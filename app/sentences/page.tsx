"use client";

import { useEffect, useState, useCallback } from "react";

import { SENTENCES, type SentenceItem as Sentence } from "@/data/sentences";
import FuriganaText from "@/components/FuriganaText";
import type { RubySegment } from "@/data/sentences";

const STORAGE_KEY = "savedSentences";
const WRONG_SENTENCES_KEY = "wrongSentences";

type Category = "전체" | "여행" | "업무" | "친구" | "일상";
type LevelFilter = "all" | "beginner" | "basic" | "practical";
type Mode = "학습" | "퀴즈";
type QuizType = "jp-to-kr" | "kr-to-jp";

interface QuizState {
  question: Sentence;
  choices: string[];
  quizType: QuizType;
  selected: string | null;
  isCorrect: boolean | null;
}

type AppSettings = {
  ttsRate: number;
  repeatCount: number;
  repeatDelayMs: number;
  showKoreanPronunciation: boolean;
  showReading: boolean;
};
type SettingsPayload = Partial<AppSettings> & {
  sections?: {
    sentences?: Partial<AppSettings>;
  };
};

const APP_SETTINGS_KEY = "japaneseAppSettings";
const DEFAULT_SETTINGS: AppSettings = {
  ttsRate: 1,
  repeatCount: 1,
  repeatDelayMs: 500,
  showKoreanPronunciation: true,
  showReading: true,
};
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function speakJapaneseFallback(text: string, settings: AppSettings) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  for (let i = 0; i < settings.repeatCount; i += 1) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = settings.ttsRate;
    await new Promise<void>((resolve) => {
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      setTimeout(() => {
        window.speechSynthesis.speak(utter);
      }, 50);
    });
    if (i < settings.repeatCount - 1 && settings.repeatDelayMs > 0) {
      await wait(settings.repeatDelayMs);
    }
  }
}

async function speakJapanese(text: string, settings: AppSettings) {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("TTS API error");
    const { audioContent } = await res.json();
    if (!audioContent) throw new Error("No audioContent");

    for (let i = 0; i < settings.repeatCount; i += 1) {
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      audio.playbackRate = settings.ttsRate;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        audio.play().catch(reject);
      });
      if (i < settings.repeatCount - 1 && settings.repeatDelayMs > 0) {
        await wait(settings.repeatDelayMs);
      }
    }
  } catch {
    await speakJapaneseFallback(text, settings);
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuiz(pool: Sentence[]): QuizState {
  const shuffled = shuffle(pool);
  const question = shuffled[0];
  const quizType: QuizType = Math.random() < 0.5 ? "jp-to-kr" : "kr-to-jp";

  const wrongCandidates = shuffled.slice(1);
  const wrongs = shuffle(wrongCandidates).slice(0, 3);

  let correctAnswer: string;
  let wrongAnswers: string[];

  if (quizType === "jp-to-kr") {
    correctAnswer = question.meaning;
    wrongAnswers = wrongs.map((s) => s.meaning);
  } else {
    correctAnswer = question.japanese;
    wrongAnswers = wrongs.map((s) => s.japanese);
  }

  const choices = shuffle([correctAnswer, ...wrongAnswers]);

  return {
    question,
    choices,
    quizType,
    selected: null,
    isCorrect: null,
  };
}

function getEffectiveLevel(sentence: Sentence): Exclude<LevelFilter, "all"> {
  return sentence.level ?? "beginner";
}

function JapaneseTextBlock({
  japanese,
  koreanPronunciation,
  showReading,
  showKoreanPronunciation,
  rubySegments,
}: {
  japanese: string;
  koreanPronunciation?: string;
  showReading: boolean;
  showKoreanPronunciation: boolean;
  rubySegments?: RubySegment[];
}) {
  const hasKanji = /[\u3400-\u9FFF]/.test(japanese);
  return (
    <div style={{ lineHeight: 1.5 }}>
      <div className="jp-text" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
        <FuriganaText text={japanese} rubySegments={rubySegments} showReading={showReading} />
      </div>
      {showKoreanPronunciation && koreanPronunciation && (
        <div style={{ marginTop: "2px", color: "#7b867b", fontSize: "13px" }}>{koreanPronunciation}</div>
      )}
    </div>
  );
}

export default function SentencesPage() {
  const [savedSentences, setSavedSentences] = useState<Sentence[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>("학습");
  const [category, setCategory] = useState<Category>("전체");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_SETTINGS_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as SettingsPayload;
      const sectionSettings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        ...(parsed.sections?.sentences ?? {}),
      };
      setSettings({
        ttsRate: sectionSettings.ttsRate,
        repeatCount: sectionSettings.repeatCount,
        repeatDelayMs: sectionSettings.repeatDelayMs,
        showKoreanPronunciation: sectionSettings.showKoreanPronunciation,
        showReading: sectionSettings.showReading,
      });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedSentences(JSON.parse(raw) as Sentence[]);
      }
    } catch {
      // 무시
    }
  }, []);

  const filteredSentences = SENTENCES.filter(
    (s) => category === "전체" || s.category === category
  );

  const filteredSentencesByLevel = filteredSentences.filter(
    (s) => levelFilter === "all" || getEffectiveLevel(s) === levelFilter
  );

  const startQuiz = useCallback(() => {
    const pool = SENTENCES.filter(
      (s) =>
        (category === "전체" || s.category === category) &&
        (levelFilter === "all" || getEffectiveLevel(s) === levelFilter)
    );
    if (pool.length < 4) return;
    setQuiz(generateQuiz(pool));
    setScore({ correct: 0, total: 0 });
  }, [category, levelFilter]);

  useEffect(() => {
    if (mode === "퀴즈") {
      startQuiz();
    }
  }, [mode, startQuiz]);

  const isSameSentence = (a: Sentence, b: Sentence) =>
    a.japanese === b.japanese &&
    a.meaning === b.meaning &&
    a.category === b.category;

  const isSaved = (s: Sentence) =>
    savedSentences.some((x) => isSameSentence(x, s));

  const handleSave = (s: Sentence) => {
    const next = isSaved(s)
      ? savedSentences.filter((x) => !isSameSentence(x, s))
      : [...savedSentences, s];

    setSavedSentences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const saveWrongSentence = (q: QuizState) => {
    try {
      const raw = localStorage.getItem(WRONG_SENTENCES_KEY);
      const prev: Array<{
        japanese: string;
        meaning: string;
        category: string;
        note: string;
        quizType: QuizType;
        createdAt: string;
      }> = raw ? JSON.parse(raw) : [];

      const isDuplicate = prev.some(
        (x) => x.japanese === q.question.japanese && x.quizType === q.quizType
      );
      if (isDuplicate) return;

      const next = [
        ...prev,
        {
          japanese: q.question.japanese,
          meaning: q.question.meaning,
          category: q.question.category,
          note: q.question.note,
          quizType: q.quizType,
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(WRONG_SENTENCES_KEY, JSON.stringify(next));
    } catch {
      // 무시
    }
  };

  const handleChoiceSelect = (choice: string) => {
    if (!quiz || quiz.selected !== null) return;

    const correctAnswer =
      quiz.quizType === "jp-to-kr"
        ? quiz.question.meaning
        : quiz.question.japanese;

    const isCorrect = choice === correctAnswer;

    const updatedQuiz = { ...quiz, selected: choice, isCorrect };
    setQuiz(updatedQuiz);
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (!isCorrect) {
      saveWrongSentence(updatedQuiz);
    }
  };

  const handleNextQuiz = () => {
    const pool = SENTENCES.filter(
      (s) =>
        (category === "전체" || s.category === category) &&
        (levelFilter === "all" || getEffectiveLevel(s) === levelFilter)
    );
    if (pool.length < 4) return;
    setQuiz(generateQuiz(pool));
  };

  const CATEGORIES: Category[] = ["전체", "여행", "업무", "친구", "일상"];
  const LEVELS: Array<{ label: string; value: LevelFilter }> = [
    { label: "전체", value: "all" },
    { label: "기초", value: "beginner" },
    { label: "기본", value: "basic" },
    { label: "실전", value: "practical" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="page-header">
        <h1>문장 학습</h1>
        <p className="muted" style={{ margin: 0 }}>
          문장을 확인하고 저장해 보세요.{" "}
          <span style={{ color: "#222" }}>저장 {savedSentences.length}개</span>
        </p>
      </div>

      {/* 모드 전환 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {(["학습", "퀴즈"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="btn"
            style={{
              fontWeight: mode === m ? 700 : 400,
              background: mode === m ? "#222" : undefined,
              color: mode === m ? "#fff" : undefined,
            }}
          >
            {m} 모드
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="btn"
            style={{
              fontSize: "13px",
              padding: "4px 12px",
              fontWeight: category === c ? 700 : 400,
              background: category === c ? "#444" : undefined,
              color: category === c ? "#fff" : undefined,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 난이도 필터 */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
        {LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => setLevelFilter(level.value)}
            className="btn"
            style={{
              fontSize: "13px",
              padding: "4px 12px",
              fontWeight: levelFilter === level.value ? 700 : 400,
              background: levelFilter === level.value ? "#444" : undefined,
              color: levelFilter === level.value ? "#fff" : undefined,
            }}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* 학습 모드 */}
      {mode === "학습" && (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredSentencesByLevel.map((s) => {
            const saved = isSaved(s);
            return (
              <li key={s.japanese} className="flex h-full flex-col rounded-xl border bg-white p-4">
                <div className="flex-1">
                  <JapaneseTextBlock
                    japanese={s.japanese}
                    koreanPronunciation={s.koreanPronunciation}
                    rubySegments={s.rubySegments}
                    showReading={settings.showReading}
                    showKoreanPronunciation={settings.showKoreanPronunciation}
                  />
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="label">뜻</div>
                      <span className="badge">{s.category}</span>
                    </div>
                    <div>{s.meaning}</div>
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <div className="label">설명</div>
                    <div style={{ color: "#555" }}>{s.note}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    onClick={() => speakJapanese(s.japanese, settings)}
                    className="btn"
                    type="button"
                  >
                    🔊 문장 듣기
                  </button>
                  <button
                    onClick={() => handleSave(s)}
                    className="btn"
                  >
                    {saved ? "저장 취소" : "저장"}
                  </button>
                </div>
              </li>
            );
          })}
          {filteredSentencesByLevel.length === 0 && (
            <li style={{ color: "#888", textAlign: "center", padding: "32px 0" }}>
              해당 카테고리의 문장이 없습니다.
            </li>
          )}
        </ul>
      )}

      {/* 퀴즈 모드 */}
      {mode === "퀴즈" && (
        <div>
          {/* 점수 */}
          <div
            className="card"
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600 }}>점수</span>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              {score.correct} / {score.total}
            </span>
          </div>

          {filteredSentences.length < 4 ? (
            <div
              className="card"
              style={{ textAlign: "center", color: "#888", padding: "32px 0" }}
            >
              퀴즈를 위해 해당 카테고리에 최소 4개의 문장이 필요합니다.
            </div>
          ) : quiz ? (
            <div className="card">
              {/* 문제 유형 */}
              <div style={{ marginBottom: "8px" }}>
                <span className="badge">
                  {quiz.quizType === "jp-to-kr"
                    ? "일본어 → 한국어"
                    : "한국어 → 일본어"}
                </span>
              </div>

              {/* 문제 */}
              <div
                style={{
                  fontSize: quiz.quizType === "jp-to-kr" ? "22px" : "18px",
                  fontWeight: 700,
                  margin: "16px 0",
                  lineHeight: 1.4,
                }}
              >
                {quiz.quizType === "jp-to-kr"
                  ? (
                    <FuriganaText
                      text={quiz.question.japanese}
                      reading={quiz.question.reading}
                      rubySegments={quiz.question.rubySegments}
                      showReading={settings.showReading}
                    />
                  )
                  : quiz.question.meaning}
              </div>
              {quiz.quizType === "jp-to-kr" && settings.showKoreanPronunciation && quiz.question.koreanPronunciation && (
                <div style={{ marginTop: "-8px", marginBottom: "12px", color: "#7b867b", fontSize: "13px" }}>
                  {quiz.question.koreanPronunciation}
                </div>
              )}

              {/* TTS (일본어 문제일 때) */}
              {quiz.quizType === "jp-to-kr" && (
                <div style={{ marginBottom: "16px" }}>
                  <button
                    className="btn"
                    onClick={() => speakJapanese(quiz.question.japanese, settings)}
                    type="button"
                  >
                    🔊 문장 듣기
                  </button>
                </div>
              )}

              {/* 보기 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {quiz.choices.map((choice, idx) => {
                  const correctAnswer =
                    quiz.quizType === "jp-to-kr"
                      ? quiz.question.meaning
                      : quiz.question.japanese;
                  const isSelected = quiz.selected === choice;
                  const isCorrectChoice = choice === correctAnswer;
                  const revealed = quiz.selected !== null;

                  let bg = "transparent";
                  let border = "1.5px solid #ddd";
                  let color = "#222";

                  if (revealed) {
                    if (isCorrectChoice) {
                      bg = "#d4f5d4";
                      border = "1.5px solid #4caf50";
                      color = "#1b5e20";
                    } else if (isSelected && !isCorrectChoice) {
                      bg = "#fde8e8";
                      border = "1.5px solid #e53935";
                      color = "#b71c1c";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={revealed}
                      style={{
                        padding: "12px 10px",
                        borderRadius: "8px",
                        border,
                        background: bg,
                        color,
                        fontWeight: isSelected || (revealed && isCorrectChoice) ? 700 : 400,
                        fontSize: "14px",
                        cursor: revealed ? "default" : "pointer",
                        textAlign: "left",
                        lineHeight: 1.4,
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ opacity: 0.5, marginRight: "6px" }}>
                        {idx + 1}.
                      </span>
                      <span>{quiz.quizType === "kr-to-jp" ? (() => {
                        const choiceSentence = SENTENCES.find((item) => item.japanese === choice);
                        return (
                          <FuriganaText
                            text={choice}
                            reading={choiceSentence?.reading}
                            rubySegments={choiceSentence?.rubySegments}
                            showReading={settings.showReading}
                          />
                        );
                      })() : choice}</span>
                    </button>
                  );
                })}
              </div>

              {/* 정답/오답 피드백 */}
              {quiz.selected !== null && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: quiz.isCorrect ? "#d4f5d4" : "#fde8e8",
                    color: quiz.isCorrect ? "#1b5e20" : "#b71c1c",
                    fontWeight: 600,
                    marginBottom: "14px",
                    fontSize: "15px",
                  }}
                >
                  {quiz.isCorrect ? "✓ 정답입니다!" : "✗ 오답입니다."}
                  {!quiz.isCorrect && (
                    <div style={{ fontWeight: 400, marginTop: "4px", fontSize: "13px" }}>
                      정답:{" "}
                      <strong>
                        {quiz.quizType === "jp-to-kr"
                          ? quiz.question.meaning
                          : quiz.question.japanese}
                      </strong>
                    </div>
                  )}
                  <div style={{ fontWeight: 400, marginTop: "4px", fontSize: "13px", opacity: 0.8 }}>
                    {quiz.question.note}
                  </div>
                </div>
              )}

              {/* 다음 문제 버튼 */}
              {quiz.selected !== null && (
                <button
                  className="btn"
                  onClick={handleNextQuiz}
                  style={{ fontWeight: 700, width: "100%" }}
                >
                  다음 문제
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
