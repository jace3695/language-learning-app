"use client";

import { useEffect, useState, useCallback } from "react";

import { WORDS, type WordItem as Word } from "@/data/words";

const STORAGE_KEY = "savedWords";
const WRONG_WORDS_KEY = "wrongWords";
type CategoryFilter = "전체" | "여행" | "업무" | "일상" | "친구";
type LevelFilter = "all" | "beginner" | "basic" | "practical";
type QuizType = "jp-to-kr" | "kr-to-jp" | "jp-to-kor-pron";
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
  showKoreanPronunciation: boolean;
  showReading: boolean;
};

const APP_SETTINGS_KEY = "japaneseAppSettings";
const DEFAULT_SETTINGS: AppSettings = {
  ttsRate: 1,
  repeatCount: 1,
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
  if (quizType === "kr-to-jp") return all.map((w) => w.word);
  return all.map((w) => w.koreanPronunciation ?? "");
}

export default function WordsPage() {
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<PageMode>("study");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("전체");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  // 퀴즈 상태
  const [quizType, setQuizType] = useState<QuizType>("jp-to-kr");
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_SETTINGS_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

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

  const quizPool =
    quizType === "jp-to-kor-pron"
      ? filteredWordsByLevel.filter((w) => Boolean(w.koreanPronunciation))
      : filteredWordsByLevel;

  const generateQuiz = useCallback(
    (pool: Word[], type: QuizType) => {
      if (pool.length < 4) return;
      const word = pool[Math.floor(Math.random() * pool.length)];
      setCurrentWord(word);
      setChoices(getChoices(word, pool, type));
      setSelected(null);
    },
    []
  );

  useEffect(() => {
    if (mode === "quiz") {
      generateQuiz(quizPool, quizType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, categoryFilter, levelFilter, quizType]);

  const handleAnswer = (choice: string) => {
    if (selected !== null || !currentWord) return;
    setSelected(choice);
    const correctAnswer =
      quizType === "jp-to-kr"
        ? currentWord.meaning
        : quizType === "kr-to-jp"
          ? currentWord.word
          : currentWord.koreanPronunciation ?? "";
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
    generateQuiz(quizPool, quizType);
  };

  const correctAnswer = currentWord
    ? quizType === "jp-to-kr"
      ? currentWord.meaning
      : quizType === "kr-to-jp"
        ? currentWord.word
        : currentWord.koreanPronunciation ?? ""
    : "";

  const CATEGORIES: CategoryFilter[] = ["전체", "여행", "업무", "일상", "친구"];
  const LEVELS: Array<{ label: string; value: LevelFilter }> = [
    { label: "전체", value: "all" },
    { label: "기초", value: "beginner" },
    { label: "기본", value: "basic" },
    { label: "실전", value: "practical" },
  ];

  return (
    <section>
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

      {/* ===== 학습 모드 ===== */}
      {mode === "study" && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredWordsByLevel.map((w) => {
            const saved = isSaved(w);
            return (
              <li key={getWordKey(w)} className="card" style={{ marginBottom: "14px" }}>
                <div className="card-top">
                  <div className="jp-text">{w.word}</div>
                  <span className="badge">{w.category}</span>
                </div>
                {w.reading && (
                  settings.showReading &&
                  <div style={{ marginTop: "6px" }}>
                    <div className="label">읽기</div>
                    <div style={{ color: "#444", fontSize: "15px" }}>{w.reading}</div>
                  </div>
                )}
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
                      <div style={{ color: "#555" }}>{w.example}</div>
                    </div>
                    {w.exampleMeaning && (
                      <div style={{ marginTop: "4px" }}>
                        <div className="label">예문 뜻</div>
                        <div style={{ color: "#666", fontSize: "13px" }}>{w.exampleMeaning}</div>
                      </div>
                    )}
                    {w.exampleReading && (
                      settings.showReading &&
                      <div style={{ marginTop: "4px" }}>
                        <div className="label">예문 읽기</div>
                        <div style={{ color: "#666", fontSize: "13px" }}>{w.exampleReading}</div>
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
                <div className="card-actions">
                  <button
                    onClick={() => handleSaveToggle(w)}
                    className="btn"
                  >
                    {saved ? "저장 취소" : "저장"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ===== 퀴즈 모드 ===== */}
      {mode === "quiz" && (
        <div>
          {quizPool.length < 4 ? (
            <div
              className="card"
              style={{ textAlign: "center", color: "#888", padding: "40px 20px" }}
            >
              {quizType === "jp-to-kor-pron"
                ? "발음 퀴즈를 위해 한글 발음이 있는 단어가 4개 이상 필요합니다."
                : "퀴즈를 위해 해당 카테고리에 단어가 4개 이상 필요합니다."}
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
                      setQuizType("jp-to-kr");
                      setScore({ correct: 0, total: 0 });
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: quizType === "jp-to-kr" ? "#222" : "transparent",
                      color: quizType === "jp-to-kr" ? "#fff" : "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    일→뜻
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuizType("kr-to-jp");
                      setScore({ correct: 0, total: 0 });
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: quizType === "kr-to-jp" ? "#222" : "transparent",
                      color: quizType === "kr-to-jp" ? "#fff" : "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    뜻→일
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuizType("jp-to-kor-pron");
                      setScore({ correct: 0, total: 0 });
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: quizType === "jp-to-kor-pron" ? "#222" : "transparent",
                      color: quizType === "jp-to-kor-pron" ? "#fff" : "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    일→발음
                  </button>
                </div>
              </div>

              {/* 문제 카드 */}
              {currentWord && (
                <div className="card" style={{ marginBottom: "20px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <span className="badge">{currentWord.category}</span>
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
                    {quizType === "kr-to-jp" ? currentWord.meaning : currentWord.word}
                  </div>
                  {quizType === "jp-to-kr" && currentWord.reading && (
                    settings.showReading &&
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "2px",
                      }}
                    >
                      {currentWord.reading}
                    </div>
                  )}
                  {quizType === "jp-to-kr" && currentWord.koreanPronunciation && (
                    settings.showKoreanPronunciation &&
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
                      ? "이 단어의 뜻은?"
                      : quizType === "kr-to-jp"
                        ? "이 뜻의 일본어는?"
                        : "이 단어의 한글 발음 참고를 고르세요"}
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
                          {choice}
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
