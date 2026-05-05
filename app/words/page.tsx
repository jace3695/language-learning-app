"use client";

import { useEffect, useState, useCallback } from "react";

import { WORDS, type WordItem as Word } from "@/data/words";
import FuriganaText from "@/components/FuriganaText";
import type { RubySegment } from "@/data/words";

const STORAGE_KEY = "savedWords";
const WRONG_WORDS_KEY = "wrongWords";
type CategoryFilter = "전체" | "여행" | "업무" | "일상" | "친구";
type LevelFilter = "all" | "beginner" | "basic" | "practical";
type PartOfSpeechFilter = "all" | "noun" | "verb" | "i-adjective" | "na-adjective" | "adverb" | "expression" | "particle" | "other";
type QuizType = "jp-to-kr" | "kr-to-jp";
type PageMode = "study" | "quiz";

type WrongWord = {
  word: string;
  meaning: string;
  example: string;
  category: Word["category"];
  quizType: QuizType;
  createdAt: string;
};

type AppSettings = {
  ttsRate: number;
  repeatCount: number;
  repeatDelayMs: number;
  showKoreanPronunciation: boolean;
  showReading: boolean;
};
type SettingsPayload = Partial<AppSettings> & {
  sections?: {
    words?: Partial<AppSettings>;
  };
};

const APP_SETTINGS_KEY = "japaneseAppSettings";

const partOfSpeechLabels: Record<Exclude<PartOfSpeechFilter, "all">, string> = {
  noun: "명사",
  verb: "동사",
  "i-adjective": "い형용사",
  "na-adjective": "な형용사",
  adverb: "부사",
  expression: "표현",
  particle: "조사",
  other: "기타",
};

const partOfSpeechBadgeStyles: Record<Exclude<PartOfSpeechFilter, "all">, { background: string; color: string }> = {
  noun: { background: "#eef2ff", color: "#3730a3" },
  verb: { background: "#ecfeff", color: "#155e75" },
  "i-adjective": { background: "#fef3c7", color: "#92400e" },
  "na-adjective": { background: "#fce7f3", color: "#9d174d" },
  adverb: { background: "#e0f2fe", color: "#075985" },
  expression: { background: "#dcfce7", color: "#166534" },
  particle: { background: "#f3e8ff", color: "#6b21a8" },
  other: { background: "#f3f4f6", color: "#374151" },
};

function normalizePartOfSpeech(partOfSpeech?: string): Exclude<PartOfSpeechFilter, "all"> {
  if (!partOfSpeech) return "other";
  const normalized = partOfSpeech.replace(/_/g, "-");
  if (normalized in partOfSpeechLabels) return normalized as Exclude<PartOfSpeechFilter, "all">;
  return "other";
}

const DEFAULT_SETTINGS: AppSettings = {
  ttsRate: 1,
  repeatCount: 1,
  repeatDelayMs: 500,
  showKoreanPronunciation: true,
  showReading: true,
};

function getWordKey(w: Pick<Word, "word" | "meaning" | "category">) {
  return `${w.word}|${w.meaning}|${w.category}`;
}

function getEffectiveLevel(word: Word): Exclude<LevelFilter, "all"> {
  return word.level ?? "beginner";
}

function normalizeSavedWord(item: Partial<Word>): Word | null {
  if (!item.word || !item.meaning || !item.example || !item.category) return null;

  return {
    word: item.word,
    reading: item.reading,
    koreanPronunciation: item.koreanPronunciation,
    meaning: item.meaning,
    example: item.example,
    exampleReading: item.exampleReading,
    exampleKoreanPronunciation: item.exampleKoreanPronunciation,
    exampleMeaning: item.exampleMeaning,
    category: item.category as Word["category"],
  };
}

function saveWrongWord(w: Word, quizType: QuizType) {
  try {
    const raw = localStorage.getItem(WRONG_WORDS_KEY);
    const prev: WrongWord[] = raw ? JSON.parse(raw) : [];
    const currentWordKey = getWordKey(w);
    const alreadyExists = prev.some(
      (item) =>
        getWordKey(item) === currentWordKey &&
        item.quizType === quizType
    );
    if (alreadyExists) return;
    const next: WrongWord[] = [
      ...prev,
      {
        word: w.word,
        meaning: w.meaning,
        example: w.example,
        category: w.category,
        quizType,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(next));
  } catch {}
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getChoices(correct: Word, pool: Word[], quizType: QuizType): string[] {
  const others = pool.filter((w) => getWordKey(w) !== getWordKey(correct));
  const shuffled = shuffle(others).slice(0, 3);
  const all = shuffle([...shuffled, correct]);
  if (quizType === "jp-to-kr") return all.map((w) => w.meaning);
  return all.map((w) => w.word);
}

export default function WordsPage() {
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<PageMode>("study");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("전체");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState<PartOfSpeechFilter>("all");

  // 퀴즈 상태
  const [quizType, setQuizType] = useState<QuizType>("jp-to-kr");
  const [showQuizKoreanPronunciation, setShowQuizKoreanPronunciation] = useState(
    DEFAULT_SETTINGS.showKoreanPronunciation
  );
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_SETTINGS_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as SettingsPayload;
      const sectionSettings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        ...(parsed.sections?.words ?? {}),
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
    setShowQuizKoreanPronunciation(settings.showKoreanPronunciation);
  }, [settings.showKoreanPronunciation]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<Word>[];
      if (!Array.isArray(parsed)) return;

      const next = parsed
        .map((item) => normalizeSavedWord(item))
        .filter((item): item is Word => item !== null);

      setSavedWords(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const isSaved = (w: Word) =>
    savedWords.some((s) => getWordKey(s) === getWordKey(w));

  const handleSaveToggle = (w: Word) => {
    const targetKey = getWordKey(w);
    const next = isSaved(w)
      ? savedWords.filter((saved) => getWordKey(saved) !== targetKey)
      : [...savedWords, w];

    setSavedWords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const filteredWords =
    categoryFilter === "전체"
      ? WORDS
      : WORDS.filter((w) => w.category === categoryFilter);

  const filteredWordsByLevel =
    levelFilter === "all"
      ? filteredWords
      : filteredWords.filter((w) => getEffectiveLevel(w) === levelFilter);

  const filteredWordsByPartOfSpeech =
    partOfSpeechFilter === "all"
      ? filteredWordsByLevel
      : filteredWordsByLevel.filter((w) => normalizePartOfSpeech(w.partOfSpeech) === partOfSpeechFilter);

  const quizPool = filteredWordsByPartOfSpeech;

  const generateQuiz = useCallback(
    (pool: Word[]) => {
      if (pool.length < 4) return;
      const word = pool[Math.floor(Math.random() * pool.length)];
      const randomQuizType: QuizType = Math.random() < 0.5 ? "jp-to-kr" : "kr-to-jp";
      setQuizType(randomQuizType);
      setCurrentWord(word);
      setChoices(getChoices(word, pool, randomQuizType));
      setSelected(null);
    },
    []
  );

  useEffect(() => {
    if (mode === "quiz") {
      generateQuiz(quizPool);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, categoryFilter, levelFilter, partOfSpeechFilter]);

  const handleAnswer = (choice: string) => {
    if (selected !== null || !currentWord) return;
    setSelected(choice);
    const correctAnswer =
      quizType === "jp-to-kr"
        ? currentWord.meaning
        : currentWord.word;
    const isCorrect = choice === correctAnswer;
    if (!isCorrect) {
      saveWrongWord(currentWord, quizType);
    }
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const handleNext = () => {
    generateQuiz(quizPool);
  };

  const correctAnswer = currentWord
    ? quizType === "jp-to-kr"
      ? currentWord.meaning
      : currentWord.word
    : "";

  const speakJapaneseText = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
      window.speechSynthesis.cancel();
      for (let i = 0; i < settings.repeatCount; i += 1) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "ja-JP";
        utter.rate = settings.ttsRate;
        setTimeout(() => {
          window.speechSynthesis.speak(utter);
        }, i * (settings.repeatDelayMs + 350));
      }
    },
    [settings.repeatCount, settings.repeatDelayMs, settings.ttsRate]
  );

  const CATEGORIES: CategoryFilter[] = ["전체", "여행", "업무", "일상", "친구"];
  const LEVELS: Array<{ label: string; value: LevelFilter }> = [
    { label: "전체", value: "all" },
    { label: "기초", value: "beginner" },
    { label: "기본", value: "basic" },
    { label: "실전", value: "practical" },
  ];



  const PARTS_OF_SPEECH: Array<{ label: string; value: PartOfSpeechFilter }> = [
    { label: "전체 품사", value: "all" },
    { label: "명사", value: "noun" },
    { label: "동사", value: "verb" },
    { label: "い형용사", value: "i-adjective" },
    { label: "な형용사", value: "na-adjective" },
    { label: "부사", value: "adverb" },
    { label: "표현", value: "expression" },
    { label: "조사", value: "particle" },
    { label: "기타", value: "other" },
  ];


  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="page-header">
        <h1>단어 학습</h1>
        <p className="muted" style={{ margin: 0 }}>
          단어를 확인하고 저장해 보세요.{" "}
          <span style={{ color: "#222" }}>저장 {savedWords.length}개</span>
        </p>
      </div>

      {/* 모드 전환 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          className="btn"
          onClick={() => setMode("study")}
          style={{
            flex: 1,
            background: mode === "study" ? "#222" : "transparent",
            color: mode === "study" ? "#fff" : "#222",
            border: "1.5px solid #222",
            fontWeight: 600,
          }}
        >
          학습 모드
        </button>
        <button
          className="btn"
          onClick={() => {
            setMode("quiz");
            setScore({ correct: 0, total: 0 });
          }}
          style={{
            flex: 1,
            background: mode === "quiz" ? "#222" : "transparent",
            color: mode === "quiz" ? "#fff" : "#222",
            border: "1.5px solid #222",
            fontWeight: 600,
          }}
        >
          퀴즈 모드
        </button>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="btn"
            onClick={() => {
              setCategoryFilter(cat);
              if (mode === "quiz") setScore({ correct: 0, total: 0 });
            }}
            style={{
              background: categoryFilter === cat ? "#555" : "transparent",
              color: categoryFilter === cat ? "#fff" : "#555",
              border: "1.5px solid #ccc",
              fontSize: "13px",
              padding: "6px 14px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 난이도 필터 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {LEVELS.map((level) => (
          <button
            key={level.value}
            className="btn"
            onClick={() => {
              setLevelFilter(level.value);
              if (mode === "quiz") setScore({ correct: 0, total: 0 });
            }}
            style={{
              background: levelFilter === level.value ? "#555" : "transparent",
              color: levelFilter === level.value ? "#fff" : "#555",
              border: "1.5px solid #ccc",
              fontSize: "13px",
              padding: "6px 14px",
            }}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* 품사 필터 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {PARTS_OF_SPEECH.map((part) => (
          <button
            key={part.value}
            className="btn"
            onClick={() => {
              setPartOfSpeechFilter(part.value);
              if (mode === "quiz") setScore({ correct: 0, total: 0 });
            }}
            style={{
              background: partOfSpeechFilter === part.value ? "#555" : "transparent",
              color: partOfSpeechFilter === part.value ? "#fff" : "#555",
              border: "1.5px solid #ccc",
              fontSize: "13px",
              padding: "6px 14px",
            }}
          >
            {part.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: "20px", padding: "14px 16px" }}>
        <div className="label" style={{ marginBottom: "8px" }}>품사 빠른 설명</div>
        <div style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#444" }}>
          <div><strong>명사:</strong> 사람, 장소, 물건, 개념을 나타내는 말이에요. 예: 水, 駅, 会社</div>
          <div><strong>동사:</strong> 동작이나 상태를 나타내는 말이에요. 예: 食べる, 行く, 見る</div>
          <div><strong>い형용사:</strong> 끝이 い로 끝나며 상태나 성질을 나타내요. 예: 大きい, 小さい, 高い</div>
          <div><strong>な형용사:</strong> 명사를 꾸밀 때 な가 붙는 형용사예요. 예: 静か, 便利, きれい</div>
          <div><strong>조사:</strong> 단어 사이의 관계를 나타내는 짧은 말이에요. 예: は, を, に, で</div>
          <div><strong>표현:</strong> 인사나 자주 쓰는 고정 표현이에요. 예: こんにちは, ありがとう</div>
        </div>
      </div>

      {/* ===== 학습 모드 ===== */}
      {mode === "study" && (
        <div style={{
          marginTop: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
          gap: "16px",
        }}>
          {filteredWordsByPartOfSpeech.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "#888", padding: "24px 16px" }}>
              해당 조건의 단어가 없습니다.
            </div>
          ) : filteredWordsByPartOfSpeech.map((w) => {
            const saved = isSaved(w);
            return (
              <div key={getWordKey(w)} className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
                }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div className="card-top">
                    <div className="jp-text"><FuriganaText text={w.word} rubySegments={w.rubySegments} showReading={settings.showReading} /></div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span className="badge">{w.category}</span>
                      <span className="badge" style={partOfSpeechBadgeStyles[normalizePartOfSpeech(w.partOfSpeech)]}>{partOfSpeechLabels[normalizePartOfSpeech(w.partOfSpeech)]}</span>
                    </div>
                  </div>
                  {w.koreanPronunciation && (
                    settings.showKoreanPronunciation &&
                    <div style={{ marginTop: "4px" }}>
                      <div className="label">한글 발음</div>
                      <div style={{ color: "#666", fontSize: "14px" }}>{w.koreanPronunciation}</div>
                    </div>
                  )}
                  <div style={{ marginTop: "10px" }}>
                    <div className="label">뜻</div>
                    <div>{w.meaning}</div>
                  </div>
                  {w.example && (
                    <>
                      <div style={{ marginTop: "10px" }}>
                        <div className="label">예문</div>
                        <div style={{ color: "#555" }}><FuriganaText text={w.example} rubySegments={w.exampleRubySegments} showReading={settings.showReading} /></div>
                      </div>
                      {w.exampleMeaning && (
                        <div style={{ marginTop: "4px" }}>
                          <div className="label">예문 뜻</div>
                          <div style={{ color: "#666", fontSize: "13px" }}>{w.exampleMeaning}</div>
                        </div>
                      )}
                      {w.exampleKoreanPronunciation && (
                        settings.showKoreanPronunciation &&
                        <div style={{ marginTop: "4px" }}>
                          <div className="label">예문 한글 발음</div>
                          <div style={{ color: "#888", fontSize: "13px" }}>{w.exampleKoreanPronunciation}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div style={{
                  marginTop: "16px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}>
                  <button
                    onClick={() => speakJapaneseText(w.word)}
                    className="btn"
                  >
                    🔊 단어 듣기
                  </button>
                  <button
                    onClick={() => speakJapaneseText(w.example)}
                    className="btn"
                  >
                    🔊 예문 듣기
                  </button>
                  <button
                    onClick={() => handleSaveToggle(w)}
                    className="btn"
                  >
                    {saved ? "저장 취소" : "저장"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== 퀴즈 모드 ===== */}
      {mode === "quiz" && (
        <div>
          {quizPool.length < 4 ? (
            <div
              className="card"
              style={{ textAlign: "center", color: "#888", padding: "40px 20px" }}
            >
              퀴즈를 위해 해당 카테고리에 단어가 4개 이상 필요합니다.
            </div>
          ) : (
            <>
              {/* 점수 & 퀴즈 타입 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#555" }}>
                  점수:{" "}
                  <strong style={{ color: "#222" }}>
                    {score.correct} / {score.total}
                  </strong>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setShowQuizKoreanPronunciation((prev) => !prev);
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: "transparent",
                      color: "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    한글 발음 {showQuizKoreanPronunciation ? "숨김" : "표시"}
                  </button>
                </div>
              </div>

              {/* 문제 카드 */}
              {currentWord && (
                <div className="card" style={{ marginBottom: "20px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span className="badge">{currentWord.category}</span>
                      <span className="badge" style={partOfSpeechBadgeStyles[normalizePartOfSpeech(currentWord.partOfSpeech)]}>{partOfSpeechLabels[normalizePartOfSpeech(currentWord.partOfSpeech)]}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: 700,
                      textAlign: "center",
                      padding: "24px 0 4px",
                      letterSpacing: "2px",
                    }}
                  >
                    {quizType === "kr-to-jp" ? currentWord.meaning : <FuriganaText text={currentWord.word} rubySegments={currentWord.rubySegments} showReading={settings.showReading} />}
                  </div>
                  {quizType === "jp-to-kr" && currentWord.koreanPronunciation && (
                    showQuizKoreanPronunciation &&
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#999",
                        marginBottom: "2px",
                      }}
                    >
                      {currentWord.koreanPronunciation}
                    </div>
                  )}
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "13px",
                      color: "#aaa",
                      marginBottom: "8px",
                      marginTop: "4px",
                    }}
                  >
                    {quizType === "jp-to-kr"
                      ? "일본어에 맞는 뜻을 고르세요"
                      : "뜻에 맞는 일본어를 고르세요"}
                  </div>

                  {/* 보기 */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    {choices.map((choice, idx) => {
                      const isCorrect = choice === correctAnswer;
                      const isSelected = choice === selected;
                      let bg = "transparent";
                      let color = "#222";
                      let border = "1.5px solid #ddd";

                      if (selected !== null) {
                        if (isCorrect) {
                          bg = "#e6f4ea";
                          color = "#1a7f37";
                          border = "1.5px solid #1a7f37";
                        } else if (isSelected) {
                          bg = "#fdecea";
                          color = "#c0392b";
                          border = "1.5px solid #c0392b";
                        }
                      }

                      return (
                        <button
                          key={`${choice}-${idx}`}
                          onClick={() => handleAnswer(choice)}
                          style={{
                            background: bg,
                            color,
                            border,
                            borderRadius: "10px",
                            padding: "14px 10px",
                            fontSize: "16px",
                            fontWeight: 600,
                            cursor: selected !== null ? "default" : "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {quizType === "kr-to-jp" ? (
                            <>
                              <div><FuriganaText text={choice} rubySegments={quizPool.find((w) => w.word === choice)?.rubySegments} showReading={settings.showReading} /></div>
                              {(() => {
                                const choiceWord = quizPool.find((w) => w.word === choice);
                                return (
                                  <>
                                    {showQuizKoreanPronunciation && choiceWord?.koreanPronunciation && (
                                      <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                                        {choiceWord.koreanPronunciation}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            choice
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* 피드백 */}
                  {selected !== null && (
                    <div
                      style={{
                        marginTop: "18px",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "18px",
                        color: selected === correctAnswer ? "#1a7f37" : "#c0392b",
                      }}
                    >
                      {selected === correctAnswer ? "정답! 🎉" : `오답 — 정답: ${correctAnswer}`}
                      <div style={{ marginTop: "6px", fontSize: "13px", color: "#555" }}>품사: [{partOfSpeechLabels[normalizePartOfSpeech(currentWord?.partOfSpeech)]}]</div>
                      {selected !== correctAnswer && currentWord && quizType === "kr-to-jp" && (
                        <div style={{ marginTop: "8px", fontSize: "14px", color: "#444" }}>
                          <FuriganaText text={currentWord.word} rubySegments={currentWord.rubySegments} showReading={settings.showReading} />
                          {showQuizKoreanPronunciation && currentWord.koreanPronunciation && (
                            <div style={{ fontSize: "12px", color: "#888" }}>{currentWord.koreanPronunciation}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 다음 문제 버튼 */}
                  {selected !== null && (
                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                      <button
                        className="btn"
                        onClick={handleNext}
                        style={{
                          background: "#222",
                          color: "#fff",
                          padding: "10px 32px",
                          fontWeight: 600,
                          fontSize: "15px",
                        }}
                      >
                        다음 문제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
