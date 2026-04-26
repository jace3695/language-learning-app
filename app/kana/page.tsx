"use client";

import { useState, useCallback, useRef } from "react";

const hiragana = [
  { char: "あ", roman: "a" }, { char: "い", roman: "i" }, { char: "う", roman: "u" }, { char: "え", roman: "e" }, { char: "お", roman: "o" },
  { char: "か", roman: "ka" }, { char: "き", roman: "ki" }, { char: "く", roman: "ku" }, { char: "け", roman: "ke" }, { char: "こ", roman: "ko" },
  { char: "さ", roman: "sa" }, { char: "し", roman: "shi" }, { char: "す", roman: "su" }, { char: "せ", roman: "se" }, { char: "そ", roman: "so" },
  { char: "た", roman: "ta" }, { char: "ち", roman: "chi" }, { char: "つ", roman: "tsu" }, { char: "て", roman: "te" }, { char: "と", roman: "to" },
  { char: "な", roman: "na" }, { char: "に", roman: "ni" }, { char: "ぬ", roman: "nu" }, { char: "ね", roman: "ne" }, { char: "の", roman: "no" },
  { char: "は", roman: "ha" }, { char: "ひ", roman: "hi" }, { char: "ふ", roman: "fu" }, { char: "へ", roman: "he" }, { char: "ほ", roman: "ho" },
  { char: "ま", roman: "ma" }, { char: "み", roman: "mi" }, { char: "む", roman: "mu" }, { char: "め", roman: "me" }, { char: "も", roman: "mo" },
  { char: "や", roman: "ya" }, { char: "ゆ", roman: "yu" }, { char: "よ", roman: "yo" },
  { char: "ら", roman: "ra" }, { char: "り", roman: "ri" }, { char: "る", roman: "ru" }, { char: "れ", roman: "re" }, { char: "ろ", roman: "ro" },
  { char: "わ", roman: "wa" }, { char: "を", roman: "wo" },
  { char: "ん", roman: "n" },
];

const katakana = [
  { char: "ア", roman: "a" }, { char: "イ", roman: "i" }, { char: "ウ", roman: "u" }, { char: "エ", roman: "e" }, { char: "オ", roman: "o" },
  { char: "カ", roman: "ka" }, { char: "キ", roman: "ki" }, { char: "ク", roman: "ku" }, { char: "ケ", roman: "ke" }, { char: "コ", roman: "ko" },
  { char: "サ", roman: "sa" }, { char: "シ", roman: "shi" }, { char: "ス", roman: "su" }, { char: "セ", roman: "se" }, { char: "ソ", roman: "so" },
  { char: "タ", roman: "ta" }, { char: "チ", roman: "chi" }, { char: "ツ", roman: "tsu" }, { char: "テ", roman: "te" }, { char: "ト", roman: "to" },
  { char: "ナ", roman: "na" }, { char: "ニ", roman: "ni" }, { char: "ヌ", roman: "nu" }, { char: "ネ", roman: "ne" }, { char: "ノ", roman: "no" },
  { char: "ハ", roman: "ha" }, { char: "ヒ", roman: "hi" }, { char: "フ", roman: "fu" }, { char: "ヘ", roman: "he" }, { char: "ホ", roman: "ho" },
  { char: "マ", roman: "ma" }, { char: "ミ", roman: "mi" }, { char: "ム", roman: "mu" }, { char: "メ", roman: "me" }, { char: "モ", roman: "mo" },
  { char: "ヤ", roman: "ya" }, { char: "ユ", roman: "yu" }, { char: "ヨ", roman: "yo" },
  { char: "ラ", roman: "ra" }, { char: "リ", roman: "ri" }, { char: "ル", roman: "ru" }, { char: "レ", roman: "re" }, { char: "ロ", roman: "ro" },
  { char: "ワ", roman: "wa" }, { char: "ヲ", roman: "wo" },
  { char: "ン", roman: "n" },
];

type KanaItem = { char: string; roman: string };

type ConfusingPair = {
  a: { char: string; roman: string };
  b: { char: string; roman: string };
  tip: string;
};

const confusingPairs: ConfusingPair[] = [
  {
    a: { char: "シ", roman: "shi" },
    b: { char: "ツ", roman: "tsu" },
    tip: "シ는 획이 왼쪽 위에서 오른쪽 아래로 뻗고, ツ는 오른쪽 위에서 아래로 내려옵니다. 시옷(シ)은 누워있고, 쯔(ツ)는 세워져 있다고 기억하세요.",
  },
  {
    a: { char: "ソ", roman: "so" },
    b: { char: "ン", roman: "n" },
    tip: "ソ는 획이 왼쪽 아래에서 오른쪽 위로 비스듬히 올라가고, ン은 오른쪽 아래로 내려옵니다. 소(ソ)는 올라가고, 은(ン)은 내려온다고 기억하세요.",
  },
  {
    a: { char: "さ", roman: "sa" },
    b: { char: "き", roman: "ki" },
    tip: "さ는 위에 선이 하나이고 아래에 둥근 고리가 있습니다. き는 위에 선이 두 개이고 오른쪽에 작은 획이 추가됩니다. 선의 개수를 주목하세요.",
  },
  {
    a: { char: "ぬ", roman: "nu" },
    b: { char: "め", roman: "me" },
    tip: "ぬ는 오른쪽에 작은 고리(꼬리)가 있고, め는 오른쪽 고리가 더 크고 닫혀있습니다. 꼬리 크기로 구분하세요.",
  },
  {
    a: { char: "わ", roman: "wa" },
    b: { char: "れ", roman: "re" },
    tip: "わ는 왼쪽 세로선 아래가 둥글게 마무리되고, れ는 아래에 고리 모양이 추가됩니다. れ 아래의 고리를 주목하세요.",
  },
  {
    a: { char: "は", roman: "ha" },
    b: { char: "ほ", roman: "ho" },
    tip: "は는 오른쪽 부분이 두 획으로 나뉘고, ほ는 세 획으로 고리까지 있습니다. ほ에 작은 고리가 있다는 것을 기억하세요.",
  },
];

type ConfusingQuizItem = {
  question: { char: string; roman: string };
  choices: string[];
  pairIndex: number;
};

function speakKanaFallback(char: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const makeUtter = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = 0.75;
    utter.pitch = 1;
    utter.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang === "ja-JP" || v.lang.startsWith("ja"));
    if (jaVoice) utter.voice = jaVoice;
    return utter;
  };

  const utter1 = makeUtter(char);
  const utter2 = makeUtter(char);

  utter1.onstart = () => { if (onStart) onStart(); };
  utter2.onend = () => { if (onEnd) onEnd(); };

  setTimeout(() => {
    window.speechSynthesis.speak(utter1);
    window.speechSynthesis.speak(utter2);
  }, 80);
}

async function speakKana(
  char: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  try {
    if (onStart) onStart();
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: char }),
    });
    if (!res.ok) throw new Error("TTS API error");
    const { audioContent } = await res.json();
    if (!audioContent) throw new Error("No audioContent");

    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
    audio.onended = () => { if (onEnd) onEnd(); };
    audio.onerror = () => {
      if (onEnd) onEnd();
      speakKanaFallback(char, undefined, undefined);
    };
    await audio.play();
  } catch {
    speakKanaFallback(char, onStart, onEnd);
  }
}

function getKanaType(char: string): "hiragana" | "katakana" {
  const code = char.codePointAt(0) ?? 0;
  // Hiragana: U+3041–U+309F, Katakana: U+30A0–U+30FF
  return code >= 0x30a0 && code <= 0x30ff ? "katakana" : "hiragana";
}

function saveWrongKana(
  char: string,
  romaji: string,
  type: "hiragana" | "katakana",
  mode: "quiz" | "confusing"
) {
  try {
    const raw = localStorage.getItem("wrongKana");
    const existing: Array<{
      char: string;
      romaji: string;
      type: "hiragana" | "katakana";
      mode: "quiz" | "confusing";
      createdAt: string;
    }> = raw ? JSON.parse(raw) : [];

    const isDuplicate = existing.some(
      (item) => item.char === char && item.mode === mode
    );
    if (isDuplicate) return;

    existing.push({ char, romaji, type, mode, createdAt: new Date().toISOString() });
    localStorage.setItem("wrongKana", JSON.stringify(existing));
  } catch {
    // JSON 파싱 실패 또는 localStorage 접근 불가 시 무시
  }
}

function getConfusingQuizQuestion(pairIdx?: number): ConfusingQuizItem {
  const idx = pairIdx !== undefined ? pairIdx : Math.floor(Math.random() * confusingPairs.length);
  const pair = confusingPairs[idx];
  const pickA = Math.random() < 0.5;
  const question = pickA ? pair.a : pair.b;
  const wrong = pickA ? pair.b.roman : pair.a.roman;
  const choices = Math.random() < 0.5
    ? [question.roman, wrong]
    : [wrong, question.roman];
  return { question, choices, pairIndex: idx };
}

function getQuizQuestion(data: KanaItem[]): { question: KanaItem; choices: string[] } {
  const questionIndex = Math.floor(Math.random() * data.length);
  const question = data[questionIndex];

  const wrongPool = data.filter((_, i) => i !== questionIndex);
  const shuffled = [...wrongPool].sort(() => Math.random() - 0.5);
  const wrongs = shuffled.slice(0, 3).map((item) => item.roman);

  const choices = [...wrongs, question.roman].sort(() => Math.random() - 0.5);
  return { question, choices };
}

export default function KanaPage() {
  const [tab, setTab] = useState<"hiragana" | "katakana">("hiragana");
  const [mode, setMode] = useState<"learn" | "quiz" | "confusing">("learn");

  const data = tab === "hiragana" ? hiragana : katakana;

  const [quiz, setQuiz] = useState<{ question: KanaItem; choices: string[] }>(() =>
    getQuizQuestion(hiragana)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // 헷갈리는 글자 모드 상태
  const [confusingView, setConfusingView] = useState<"cards" | "quiz">("cards");
  const [confusingQuiz, setConfusingQuiz] = useState<ConfusingQuizItem>(() => getConfusingQuizQuestion());
  const [confusingSelected, setConfusingSelected] = useState<string | null>(null);
  const [confusingScore, setConfusingScore] = useState({ correct: 0, total: 0 });

  // 발음 재생 중 표시
  const [playingChar, setPlayingChar] = useState<string | null>(null);
  const playingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSpeak = useCallback((char: string) => {
    if (playingTimerRef.current) clearTimeout(playingTimerRef.current);
    setPlayingChar(char);
    speakKana(
      char,
      () => { setPlayingChar(char); },
      () => {
        playingTimerRef.current = setTimeout(() => setPlayingChar(null), 300);
      }
    );
    // 최대 6초 후 강제 초기화 (onEnd 미발동 대비)
    playingTimerRef.current = setTimeout(() => setPlayingChar(null), 6000);
  }, []);

  const loadNextQuestion = useCallback(
    (currentData: KanaItem[]) => {
      setQuiz(getQuizQuestion(currentData));
      setSelected(null);
    },
    []
  );

  const handleTabChange = (newTab: "hiragana" | "katakana") => {
    setTab(newTab);
    const newData = newTab === "hiragana" ? hiragana : katakana;
    setSelected(null);
    setScore({ correct: 0, total: 0 });
    setQuiz(getQuizQuestion(newData));
  };

  const handleModeChange = (newMode: "learn" | "quiz" | "confusing") => {
    setMode(newMode);
    if (newMode === "quiz") {
      setSelected(null);
      setScore({ correct: 0, total: 0 });
      setQuiz(getQuizQuestion(data));
    }
    if (newMode === "confusing") {
      setConfusingView("cards");
      setConfusingSelected(null);
      setConfusingScore({ correct: 0, total: 0 });
      setConfusingQuiz(getConfusingQuizQuestion());
    }
  };

  const handleChoice = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
    const isCorrect = choice === quiz.question.roman;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    if (!isCorrect) {
      saveWrongKana(quiz.question.char, quiz.question.roman, tab, "quiz");
    }
  };

  const handleConfusingChoice = (choice: string) => {
    if (confusingSelected !== null) return;
    setConfusingSelected(choice);
    const isCorrect = choice === confusingQuiz.question.roman;
    setConfusingScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    if (!isCorrect) {
      const type = getKanaType(confusingQuiz.question.char);
      saveWrongKana(confusingQuiz.question.char, confusingQuiz.question.roman, type, "confusing");
    }
  };

  const loadNextConfusingQuestion = () => {
    setConfusingQuiz(getConfusingQuizQuestion());
    setConfusingSelected(null);
  };

  const getChoiceStyle = (choice: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "2px solid",
      cursor: selected !== null ? "default" : "pointer",
      fontSize: "1rem",
      fontWeight: "600",
      width: "100%",
      textAlign: "center",
      transition: "background 0.15s",
    };

    if (selected === null) {
      return { ...base, borderColor: "#d1d5db", background: "#f9fafb", color: "#374151" };
    }
    if (choice === quiz.question.roman) {
      return { ...base, borderColor: "#16a34a", background: "#dcfce7", color: "#15803d" };
    }
    if (choice === selected) {
      return { ...base, borderColor: "#dc2626", background: "#fee2e2", color: "#b91c1c" };
    }
    return { ...base, borderColor: "#d1d5db", background: "#f9fafb", color: "#9ca3af" };
  };

  const getConfusingChoiceStyle = (choice: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      border: "2px solid",
      cursor: confusingSelected !== null ? "default" : "pointer",
      fontSize: "1.1rem",
      fontWeight: "600",
      flex: 1,
      textAlign: "center",
      transition: "background 0.15s",
    };

    if (confusingSelected === null) {
      return { ...base, borderColor: "#d1d5db", background: "#f9fafb", color: "#374151" };
    }
    if (choice === confusingQuiz.question.roman) {
      return { ...base, borderColor: "#16a34a", background: "#dcfce7", color: "#15803d" };
    }
    if (choice === confusingSelected) {
      return { ...base, borderColor: "#dc2626", background: "#fee2e2", color: "#b91c1c" };
    }
    return { ...base, borderColor: "#d1d5db", background: "#f9fafb", color: "#9ca3af" };
  };

  const modeBtnStyle = (m: string): React.CSSProperties => ({
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    border: "2px solid",
    cursor: "pointer",
    fontWeight: mode === m ? "bold" : "normal",
    borderColor: mode === m ? "#8b5cf6" : "#d1d5db",
    background: mode === m ? "#ede9fe" : "#fff",
    color: mode === m ? "#7c3aed" : "#6b7280",
    fontSize: "0.875rem",
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        히라가나 / 가타카나 훈련
      </h1>

      {/* 탭 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => handleTabChange("hiragana")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: tab === "hiragana" ? "bold" : "normal",
            background: tab === "hiragana" ? "#3b82f6" : "#e5e7eb",
            color: tab === "hiragana" ? "#fff" : "#374151",
          }}
        >
          히라가나
        </button>
        <button
          onClick={() => handleTabChange("katakana")}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: tab === "katakana" ? "bold" : "normal",
            background: tab === "katakana" ? "#3b82f6" : "#e5e7eb",
            color: tab === "katakana" ? "#fff" : "#374151",
          }}
        >
          가타카나
        </button>
      </div>

      {/* 모드 전환 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button onClick={() => handleModeChange("learn")} style={modeBtnStyle("learn")}>
          학습 모드
        </button>
        <button onClick={() => handleModeChange("quiz")} style={modeBtnStyle("quiz")}>
          퀴즈 모드
        </button>
        <button onClick={() => handleModeChange("confusing")} style={modeBtnStyle("confusing")}>
          헷갈리는 글자
        </button>
      </div>

      {/* 학습 모드 */}
      {mode === "learn" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "0.75rem",
          }}
        >
          {data.map((item) => {
            const isPlaying = playingChar === item.char;
            return (
              <div
                key={item.char}
                onClick={() => handleSpeak(item.char)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1rem 0.5rem",
                  borderRadius: "8px",
                  border: `1px solid ${isPlaying ? "#6366f1" : "#e5e7eb"}`,
                  background: isPlaying ? "#eef2ff" : "#f9fafb",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  transition: "background 0.15s, border-color 0.15s",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: "2rem", lineHeight: 1 }}>{item.char}</span>
                <span style={{ fontSize: "0.75rem", color: isPlaying ? "#6366f1" : "#6b7280", marginTop: "0.4rem", fontWeight: isPlaying ? "700" : "400" }}>
                  {isPlaying ? "재생 중..." : item.roman}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 퀴즈 모드 */}
      {mode === "quiz" && (
        <div style={{ maxWidth: "400px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: "#f3f4f6",
            }}
          >
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>점수</span>
            <span style={{ fontWeight: "bold", color: "#1f2937" }}>
              {score.correct} / {score.total}
              {score.total > 0 && (
                <span style={{ marginLeft: "0.5rem", color: "#6b7280", fontWeight: "normal", fontSize: "0.875rem" }}>
                  ({Math.round((score.correct / score.total) * 100)}%)
                </span>
              )}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "140px",
              borderRadius: "12px",
              border: "2px solid #e5e7eb",
              background: "#fff",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ fontSize: "5rem", lineHeight: 1 }}>{quiz.question.char}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {quiz.choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                style={getChoiceStyle(choice)}
              >
                {choice}
              </button>
            ))}
          </div>

          {selected !== null && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                textAlign: "center",
                fontWeight: "600",
                fontSize: "0.95rem",
                background: selected === quiz.question.roman ? "#dcfce7" : "#fee2e2",
                color: selected === quiz.question.roman ? "#15803d" : "#b91c1c",
              }}
            >
              {selected === quiz.question.roman
                ? "정답입니다!"
                : `오답! 정답은 "${quiz.question.roman}" 입니다.`}
            </div>
          )}

          {selected !== null && (
            <button
              onClick={() => loadNextQuestion(data)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: "#3b82f6",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              다음 문제 →
            </button>
          )}
        </div>
      )}

      {/* 헷갈리는 글자 모드 */}
      {mode === "confusing" && (
        <div>
          {/* 서브 탭: 카드 보기 / 비교 퀴즈 */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <button
              onClick={() => { setConfusingView("cards"); }}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "6px",
                border: "2px solid",
                cursor: "pointer",
                fontWeight: confusingView === "cards" ? "bold" : "normal",
                borderColor: confusingView === "cards" ? "#f59e0b" : "#d1d5db",
                background: confusingView === "cards" ? "#fef3c7" : "#fff",
                color: confusingView === "cards" ? "#b45309" : "#6b7280",
                fontSize: "0.875rem",
              }}
            >
              글자 비교
            </button>
            <button
              onClick={() => {
                setConfusingView("quiz");
                setConfusingSelected(null);
                setConfusingScore({ correct: 0, total: 0 });
                setConfusingQuiz(getConfusingQuizQuestion());
              }}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "6px",
                border: "2px solid",
                cursor: "pointer",
                fontWeight: confusingView === "quiz" ? "bold" : "normal",
                borderColor: confusingView === "quiz" ? "#f59e0b" : "#d1d5db",
                background: confusingView === "quiz" ? "#fef3c7" : "#fff",
                color: confusingView === "quiz" ? "#b45309" : "#6b7280",
                fontSize: "0.875rem",
              }}
            >
              비교 퀴즈
            </button>
          </div>

          {/* 글자 비교 카드 */}
          {confusingView === "cards" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {confusingPairs.map((pair, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* 글자 쌍 */}
                  <div style={{ display: "flex", borderBottom: "1px solid #f3f4f6" }}>
                    {[pair.a, pair.b].map((item, j) => {
                      const isPlaying = playingChar === item.char;
                      return (
                        <div
                          key={j}
                          onClick={() => handleSpeak(item.char)}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1.5rem 1rem",
                            background: isPlaying
                              ? (j === 0 ? "#ede9fe" : "#fef3c7")
                              : (j === 0 ? "#faf5ff" : "#fff7ed"),
                            borderRight: j === 0 ? "1px solid #f3f4f6" : undefined,
                            cursor: "pointer",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            transition: "background 0.15s",
                          }}
                        >
                          <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>{item.char}</span>
                          <span
                            style={{
                              marginTop: "0.5rem",
                              fontSize: "0.85rem",
                              fontWeight: "700",
                              color: isPlaying
                                ? (j === 0 ? "#6366f1" : "#b45309")
                                : (j === 0 ? "#7c3aed" : "#d97706"),
                              letterSpacing: "0.05em",
                            }}
                          >
                            {isPlaying ? "재생 중..." : item.roman}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* 구분 팁 */}
                  <div style={{ padding: "0.875rem 1.25rem", background: "#f9fafb" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#6b7280", marginRight: "0.4rem" }}>
                      💡 팁
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#374151", lineHeight: "1.6" }}>
                      {pair.tip}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 비교 퀴즈 */}
          {confusingView === "quiz" && (
            <div style={{ maxWidth: "420px" }}>
              {/* 점수 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "#f3f4f6",
                }}
              >
                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>점수</span>
                <span style={{ fontWeight: "bold", color: "#1f2937" }}>
                  {confusingScore.correct} / {confusingScore.total}
                  {confusingScore.total > 0 && (
                    <span style={{ marginLeft: "0.5rem", color: "#6b7280", fontWeight: "normal", fontSize: "0.875rem" }}>
                      ({Math.round((confusingScore.correct / confusingScore.total) * 100)}%)
                    </span>
                  )}
                </span>
              </div>

              {/* 쌍 힌트 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "8px",
                  background: "#fef3c7",
                  fontSize: "0.8rem",
                  color: "#92400e",
                }}
              >
                <span>이 쌍:</span>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  {confusingPairs[confusingQuiz.pairIndex].a.char}
                </span>
                <span style={{ color: "#b45309" }}>vs</span>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  {confusingPairs[confusingQuiz.pairIndex].b.char}
                </span>
              </div>

              {/* 문제 */}
              <div
                onClick={() => handleSpeak(confusingQuiz.question.char)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "150px",
                  borderRadius: "12px",
                  border: `2px solid ${playingChar === confusingQuiz.question.char ? "#6366f1" : "#e5e7eb"}`,
                  background: playingChar === confusingQuiz.question.char ? "#eef2ff" : "#fff",
                  marginBottom: "1.5rem",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <span style={{ fontSize: "6rem", lineHeight: 1 }}>{confusingQuiz.question.char}</span>
                {playingChar === confusingQuiz.question.char && (
                  <span style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: "600", marginTop: "0.25rem" }}>
                    재생 중...
                  </span>
                )}
              </div>

              {/* 보기 2개 */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {confusingQuiz.choices.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => handleConfusingChoice(choice)}
                    style={getConfusingChoiceStyle(choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>

              {/* 피드백 */}
              {confusingSelected !== null && (
                <>
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      marginBottom: "0.75rem",
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      background: confusingSelected === confusingQuiz.question.roman ? "#dcfce7" : "#fee2e2",
                      color: confusingSelected === confusingQuiz.question.roman ? "#15803d" : "#b91c1c",
                    }}
                  >
                    {confusingSelected === confusingQuiz.question.roman
                      ? "정답입니다!"
                      : `오답! 정답은 "${confusingQuiz.question.roman}" 입니다.`}
                  </div>
                  {/* 팁 */}
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      marginBottom: "1rem",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.83rem",
                      color: "#374151",
                      lineHeight: "1.6",
                    }}
                  >
                    <span style={{ fontWeight: "600", color: "#6b7280", marginRight: "0.35rem" }}>💡</span>
                    {confusingPairs[confusingQuiz.pairIndex].tip}
                  </div>
                  <button
                    onClick={loadNextConfusingQuestion}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      background: "#f59e0b",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    다음 문제 →
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
