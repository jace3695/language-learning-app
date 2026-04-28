"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type SectionKey = "wrongKana" | "wrongWords" | "wrongSentences";

const SECTIONS: { key: SectionKey; label: string; href: string; linkLabel: string }[] = [
  { key: "wrongKana", label: "헷갈린 글자", href: "/kana", linkLabel: "Kana 다시 학습" },
  { key: "wrongWords", label: "틀린 단어", href: "/words", linkLabel: "단어 다시 학습" },
  { key: "wrongSentences", label: "틀린 문장", href: "/sentences", linkLabel: "문장 다시 학습" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyItem = string | Record<string, any>;

interface KanaQuizItem {
  char: string;
  romaji: string;
  type?: string;
  mode?: string;
  createdAt?: string;
}

interface WordQuizItem {
  word: string;
  meaning: string;
  category?: string;
  quizType?: string;
  createdAt?: string;
  mode: "wordToMeaning" | "meaningToWord";
}

interface SentenceQuizItem {
  japanese: string;
  meaning: string;
  category?: string;
  quizType?: string;
  createdAt?: string;
  mode: "japaneseToMeaning" | "meaningToJapanese";
}

const ROMAJI_POOL = [
  "a","i","u","e","o",
  "ka","ki","ku","ke","ko",
  "sa","shi","su","se","so",
  "ta","chi","tsu","te","to",
  "na","ni","nu","ne","no",
  "ha","hi","fu","he","ho",
  "ma","mi","mu","me","mo",
  "ya","yu","yo",
  "ra","ri","ru","re","ro",
  "wa","wi","we","wo","n",
  "ga","gi","gu","ge","go",
  "za","ji","zu","ze","zo",
  "da","de","do",
  "ba","bi","bu","be","bo",
  "pa","pi","pu","pe","po",
  "kya","kyu","kyo",
  "sha","shu","sho",
  "cha","chu","cho",
  "nya","nyu","nyo",
  "hya","hyu","hyo",
  "mya","myu","myo",
  "rya","ryu","ryo",
  "gya","gyu","gyo",
  "ja","ju","jo",
  "bya","byu","byo",
  "pya","pyu","pyo",
];

function loadFromStorage(key: string): AnyItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AnyItem[];
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(key: string, value: AnyItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderKanaItem(item: AnyItem, i: number): React.ReactNode {
  if (typeof item === "string") {
    return (
      <div key={i} style={{ marginBottom: "0.5rem" }}>
        {item}
      </div>
    );
  }
  const obj = item as Record<string, unknown>;
  return (
    <div
      key={i}
      style={{
        marginBottom: "0.5rem",
        border: "1px solid #eee",
        borderRadius: 6,
        padding: "0.5rem 0.75rem",
        background: "#fafafa",
      }}
    >
      <span style={{ fontSize: "1.4rem", fontWeight: "bold", marginRight: "0.5rem" }}>
        {typeof obj.char === "string" ? obj.char : ""}
      </span>
      {typeof obj.romaji === "string" && (
        <span style={{ color: "#555", marginRight: "0.5rem" }}>[{obj.romaji}]</span>
      )}
      {typeof obj.type === "string" && (
        <span
          style={{
            fontSize: "0.75rem",
            background: "#e0e7ff",
            color: "#3730a3",
            borderRadius: 4,
            padding: "0.1rem 0.4rem",
            marginRight: "0.4rem",
          }}
        >
          {obj.type}
        </span>
      )}
      {typeof obj.mode === "string" && (
        <span
          style={{
            fontSize: "0.75rem",
            background: "#fef3c7",
            color: "#92400e",
            borderRadius: 4,
            padding: "0.1rem 0.4rem",
            marginRight: "0.4rem",
          }}
        >
          {obj.mode}
        </span>
      )}
      {typeof obj.createdAt === "string" && (
        <span style={{ fontSize: "0.75rem", color: "#999", marginLeft: "0.2rem" }}>
          {formatDate(obj.createdAt)}
        </span>
      )}
    </div>
  );
}

function renderWordOrSentenceItem(item: AnyItem, i: number): React.ReactNode {
  if (typeof item === "string") {
    return (
      <span key={i} style={{ marginBottom: "0.3rem" }}>
        {item}
      </span>
    );
  }
  const obj = item as Record<string, unknown>;
  const parts: string[] = [];

  const mainFields = ["word", "japanese", "sentence"] as const;
  for (const f of mainFields) {
    if (typeof obj[f] === "string" && obj[f]) {
      parts.push(obj[f] as string);
      break;
    }
  }
  if (typeof obj.meaning === "string" && obj.meaning) {
    parts.push(`(${obj.meaning})`);
  }
  if (typeof obj.example === "string" && obj.example) {
    parts.push(`예: ${obj.example}`);
  }
  if (typeof obj.category === "string" && obj.category) {
    parts.push(`[${obj.category}]`);
  }
  if (typeof obj.note === "string" && obj.note) {
    parts.push(`※ ${obj.note}`);
  }

  const display = parts.length > 0 ? parts.join(" ") : JSON.stringify(obj);

  return <span key={i}>{display}</span>;
}

function getKanaQuizItems(items: AnyItem[]): KanaQuizItem[] {
  const result: KanaQuizItem[] = [];
  items.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      if (typeof obj.char === "string" && obj.char && typeof obj.romaji === "string" && obj.romaji) {
        result.push({
          char: obj.char,
          romaji: obj.romaji,
          type: typeof obj.type === "string" ? obj.type : undefined,
          mode: typeof obj.mode === "string" ? obj.mode : undefined,
          createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
        });
      }
    }
  });
  return result;
}

function getWordQuizItems(items: AnyItem[]): WordQuizItem[] {
  const result: WordQuizItem[] = [];
  items.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      if (typeof obj.word === "string" && obj.word && typeof obj.meaning === "string" && obj.meaning) {
        const mode: WordQuizItem["mode"] = Math.random() < 0.5 ? "wordToMeaning" : "meaningToWord";
        result.push({
          word: obj.word,
          meaning: obj.meaning,
          category: typeof obj.category === "string" ? obj.category : undefined,
          quizType: typeof obj.quizType === "string" ? obj.quizType : undefined,
          createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
          mode,
        });
      }
    }
  });
  return result;
}

function getSentenceQuizItems(items: AnyItem[]): SentenceQuizItem[] {
  const result: SentenceQuizItem[] = [];
  items.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      if (
        typeof obj.japanese === "string" && obj.japanese &&
        typeof obj.meaning === "string" && obj.meaning
      ) {
        const mode: SentenceQuizItem["mode"] = Math.random() < 0.5 ? "japaneseToMeaning" : "meaningToJapanese";
        result.push({
          japanese: obj.japanese,
          meaning: obj.meaning,
          category: typeof obj.category === "string" ? obj.category : undefined,
          quizType: typeof obj.quizType === "string" ? obj.quizType : undefined,
          createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
          mode,
        });
      }
    }
  });
  return result;
}

function isObjectItem(item: AnyItem): item is Record<string, unknown> {
  return typeof item === "object" && item !== null;
}

function getKanaWrongKey(item: AnyItem, includeCreatedAt?: boolean): string {
  if (!isObjectItem(item)) return "";
  const base = [
    typeof item.char === "string" ? item.char : "",
    typeof item.romaji === "string" ? item.romaji : "",
    typeof item.type === "string" ? item.type : "",
    typeof item.mode === "string" ? item.mode : "",
  ].join("|");
  const shouldIncludeCreatedAt = includeCreatedAt ?? typeof item.createdAt === "string";
  if (!shouldIncludeCreatedAt) return base;
  return `${base}|${typeof item.createdAt === "string" ? item.createdAt : ""}`;
}

function getWordWrongKey(item: AnyItem, includeCreatedAt?: boolean): string {
  if (!isObjectItem(item)) return "";
  const base = [
    typeof item.word === "string" ? item.word : "",
    typeof item.meaning === "string" ? item.meaning : "",
    typeof item.category === "string" ? item.category : "",
    typeof item.quizType === "string" ? item.quizType : "",
  ].join("|");
  const shouldIncludeCreatedAt = includeCreatedAt ?? typeof item.createdAt === "string";
  if (!shouldIncludeCreatedAt) return base;
  return `${base}|${typeof item.createdAt === "string" ? item.createdAt : ""}`;
}

function getSentenceWrongKey(item: AnyItem, includeCreatedAt?: boolean): string {
  if (!isObjectItem(item)) return "";
  const base = [
    typeof item.japanese === "string" ? item.japanese : "",
    typeof item.meaning === "string" ? item.meaning : "",
    typeof item.category === "string" ? item.category : "",
    typeof item.quizType === "string" ? item.quizType : "",
  ].join("|");
  const shouldIncludeCreatedAt = includeCreatedAt ?? typeof item.createdAt === "string";
  if (!shouldIncludeCreatedAt) return base;
  return `${base}|${typeof item.createdAt === "string" ? item.createdAt : ""}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateKanaOptions(correct: string, allItems: KanaQuizItem[]): string[] {
  const otherRomaji = allItems.map((x) => x.romaji).filter((r) => r !== correct);
  const pool = Array.from(new Set([...otherRomaji, ...ROMAJI_POOL])).filter((r) => r !== correct);
  const shuffled = shuffle(pool);
  const wrongs = shuffled.slice(0, 3);
  return shuffle([correct, ...wrongs]);
}

function generateWordOptions(correct: string, allItems: WordQuizItem[], field: "meaning" | "word"): string[] {
  const others = allItems.map((x) => x[field]).filter((v) => v !== correct);
  const unique = Array.from(new Set(others));
  const shuffled = shuffle(unique);
  const wrongs = shuffled.slice(0, 3);
  return shuffle([correct, ...wrongs]);
}

function generateSentenceOptions(correct: string, allItems: SentenceQuizItem[], field: "meaning" | "japanese"): string[] {
  const others = allItems.map((x) => x[field]).filter((v) => v !== correct);
  const unique = Array.from(new Set(others));
  const shuffled = shuffle(unique);
  const wrongs = shuffled.slice(0, 3);
  return shuffle([correct, ...wrongs]);
}

export default function ProgressPage() {
  const [data, setData] = useState<Record<SectionKey, AnyItem[]>>({
    wrongKana: [],
    wrongWords: [],
    wrongSentences: [],
  });

  // Kana Quiz state
  const [quizItems, setQuizItems] = useState<KanaQuizItem[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Word Quiz state
  const [wordQuizItems, setWordQuizItems] = useState<WordQuizItem[]>([]);
  const [wordQuizIndex, setWordQuizIndex] = useState(0);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [wordSelected, setWordSelected] = useState<string | null>(null);
  const [wordIsCorrect, setWordIsCorrect] = useState<boolean | null>(null);

  // Sentence Quiz state
  const [sentenceQuizItems, setSentenceQuizItems] = useState<SentenceQuizItem[]>([]);
  const [sentenceQuizIndex, setSentenceQuizIndex] = useState(0);
  const [sentenceOptions, setSentenceOptions] = useState<string[]>([]);
  const [sentenceSelected, setSentenceSelected] = useState<string | null>(null);
  const [sentenceIsCorrect, setSentenceIsCorrect] = useState<boolean | null>(null);

  const buildKanaQuiz = useCallback((items: AnyItem[]) => {
    const qi = getKanaQuizItems(items);
    const shuffled = shuffle(qi);
    setQuizItems(shuffled);
    setQuizIndex(0);
    setSelected(null);
    setIsCorrect(null);
    if (shuffled.length > 0) {
      setOptions(generateKanaOptions(shuffled[0].romaji, shuffled));
    } else {
      setOptions([]);
    }
  }, []);

  const buildWordQuiz = useCallback((items: AnyItem[]) => {
    const qi = getWordQuizItems(items);
    const shuffled = shuffle(qi);
    setWordQuizItems(shuffled);
    setWordQuizIndex(0);
    setWordSelected(null);
    setWordIsCorrect(null);
    if (shuffled.length > 0) {
      const first = shuffled[0];
      const correctVal = first.mode === "wordToMeaning" ? first.meaning : first.word;
      const field: "meaning" | "word" = first.mode === "wordToMeaning" ? "meaning" : "word";
      setWordOptions(generateWordOptions(correctVal, shuffled, field));
    } else {
      setWordOptions([]);
    }
  }, []);

  const buildSentenceQuiz = useCallback((items: AnyItem[]) => {
    const qi = getSentenceQuizItems(items);
    const shuffled = shuffle(qi);
    setSentenceQuizItems(shuffled);
    setSentenceQuizIndex(0);
    setSentenceSelected(null);
    setSentenceIsCorrect(null);
    if (shuffled.length > 0) {
      const first = shuffled[0];
      const correctVal = first.mode === "japaneseToMeaning" ? first.meaning : first.japanese;
      const field: "meaning" | "japanese" = first.mode === "japaneseToMeaning" ? "meaning" : "japanese";
      setSentenceOptions(generateSentenceOptions(correctVal, shuffled, field));
    } else {
      setSentenceOptions([]);
    }
  }, []);

  useEffect(() => {
    const wrongKana = loadFromStorage("wrongKana");
    const wrongWords = loadFromStorage("wrongWords");
    const wrongSentences = loadFromStorage("wrongSentences");
    setData({ wrongKana, wrongWords, wrongSentences });
    buildKanaQuiz(wrongKana);
    buildWordQuiz(wrongWords);
    buildSentenceQuiz(wrongSentences);
  }, [buildKanaQuiz, buildWordQuiz, buildSentenceQuiz]);

  function clearSection(key: SectionKey) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setData((prev) => {
      const next = { ...prev, [key]: [] };
      if (key === "wrongKana") {
        buildKanaQuiz([]);
      }
      if (key === "wrongWords") {
        buildWordQuiz([]);
      }
      if (key === "wrongSentences") {
        buildSentenceQuiz([]);
      }
      return next;
    });
  }

  function handleClearSection(key: SectionKey) {
    const confirmMessages: Record<SectionKey, string> = {
      wrongKana: "헷갈린 글자 오답을 모두 삭제할까요?",
      wrongWords: "틀린 단어 오답을 모두 삭제할까요?",
      wrongSentences: "틀린 문장 오답을 모두 삭제할까요?",
    };

    if (!window.confirm(confirmMessages[key])) return;
    clearSection(key);
  }

  function removeWrongKanaItem(target: AnyItem) {
    if (!isObjectItem(target)) return;
    const useCreatedAt = typeof target.createdAt === "string";
    const targetKey = getKanaWrongKey(target, useCreatedAt);

    setData((prev) => {
      let removed = false;
      const updated = prev.wrongKana.filter((storedItem) => {
        if (removed) return true;
        const storedKey = getKanaWrongKey(storedItem, useCreatedAt);
        if (storedKey === targetKey) {
          removed = true;
          return false;
        }
        return true;
      });
      saveToStorage("wrongKana", updated);
      buildKanaQuiz(updated);
      return { ...prev, wrongKana: updated };
    });
  }

  function removeWrongWordItem(target: AnyItem) {
    if (!isObjectItem(target)) return;
    const useCreatedAt = typeof target.createdAt === "string";
    const targetKey = getWordWrongKey(target, useCreatedAt);

    setData((prev) => {
      let removed = false;
      const updated = prev.wrongWords.filter((storedItem) => {
        if (removed) return true;
        const storedKey = getWordWrongKey(storedItem, useCreatedAt);
        if (storedKey === targetKey) {
          removed = true;
          return false;
        }
        return true;
      });
      saveToStorage("wrongWords", updated);
      buildWordQuiz(updated);
      return { ...prev, wrongWords: updated };
    });
  }

  function removeWrongSentenceItem(target: AnyItem) {
    if (!isObjectItem(target)) return;
    const useCreatedAt = typeof target.createdAt === "string";
    const targetKey = getSentenceWrongKey(target, useCreatedAt);

    setData((prev) => {
      let removed = false;
      const updated = prev.wrongSentences.filter((storedItem) => {
        if (removed) return true;
        const storedKey = getSentenceWrongKey(storedItem, useCreatedAt);
        if (storedKey === targetKey) {
          removed = true;
          return false;
        }
        return true;
      });
      saveToStorage("wrongSentences", updated);
      buildSentenceQuiz(updated);
      return { ...prev, wrongSentences: updated };
    });
  }

  // Kana quiz handlers
  function handleOptionSelect(opt: string) {
    if (selected !== null) return;
    const current = quizItems[quizIndex];
    if (!current) return;

    const correct = opt === current.romaji;
    setSelected(opt);
    setIsCorrect(correct);

    if (correct) {
      removeWrongKanaItem(current);
      setQuizItems((prev) => prev.filter((_, i) => i !== quizIndex));
    }
  }

  function handleNext() {
    setSelected(null);
    setIsCorrect(null);

    setQuizItems((prev) => {
      const nextIndex = isCorrect
        ? quizIndex >= prev.length ? prev.length - 1 : quizIndex
        : (quizIndex + 1) % Math.max(prev.length, 1);
      const clampedIndex = Math.min(nextIndex, prev.length - 1);

      setQuizIndex(clampedIndex);
      if (prev.length > 0) {
        setOptions(generateKanaOptions(prev[clampedIndex]?.romaji ?? "", prev));
      }
      return prev;
    });
  }

  // Word quiz handlers
  function handleWordOptionSelect(opt: string) {
    if (wordSelected !== null) return;
    const current = wordQuizItems[wordQuizIndex];
    if (!current) return;

    const correctVal = current.mode === "wordToMeaning" ? current.meaning : current.word;
    const correct = opt === correctVal;
    setWordSelected(opt);
    setWordIsCorrect(correct);

    if (correct) {
      removeWrongWordItem(current);
      setWordQuizItems((prev) => prev.filter((_, i) => i !== wordQuizIndex));
    }
  }

  function handleWordNext() {
    setWordSelected(null);
    setWordIsCorrect(null);

    setWordQuizItems((prev) => {
      const nextIndex = wordIsCorrect
        ? wordQuizIndex >= prev.length ? prev.length - 1 : wordQuizIndex
        : (wordQuizIndex + 1) % Math.max(prev.length, 1);
      const clampedIndex = Math.min(nextIndex, prev.length - 1);

      setWordQuizIndex(clampedIndex);
      if (prev.length > 0) {
        const item = prev[clampedIndex];
        if (item) {
          const field: "meaning" | "word" = item.mode === "wordToMeaning" ? "meaning" : "word";
          const correctVal = item.mode === "wordToMeaning" ? item.meaning : item.word;
          setWordOptions(generateWordOptions(correctVal, prev, field));
        }
      }
      return prev;
    });
  }

  // Sentence quiz handlers
  function handleSentenceOptionSelect(opt: string) {
    if (sentenceSelected !== null) return;
    const current = sentenceQuizItems[sentenceQuizIndex];
    if (!current) return;

    const correctVal = current.mode === "japaneseToMeaning" ? current.meaning : current.japanese;
    const correct = opt === correctVal;
    setSentenceSelected(opt);
    setSentenceIsCorrect(correct);

    if (correct) {
      removeWrongSentenceItem(current);
      setSentenceQuizItems((prev) => prev.filter((_, i) => i !== sentenceQuizIndex));
    }
  }

  function handleSentenceNext() {
    setSentenceSelected(null);
    setSentenceIsCorrect(null);

    setSentenceQuizItems((prev) => {
      const nextIndex = sentenceIsCorrect
        ? sentenceQuizIndex >= prev.length ? prev.length - 1 : sentenceQuizIndex
        : (sentenceQuizIndex + 1) % Math.max(prev.length, 1);
      const clampedIndex = Math.min(nextIndex, prev.length - 1);

      setSentenceQuizIndex(clampedIndex);
      if (prev.length > 0) {
        const item = prev[clampedIndex];
        if (item) {
          const field: "meaning" | "japanese" = item.mode === "japaneseToMeaning" ? "meaning" : "japanese";
          const correctVal = item.mode === "japaneseToMeaning" ? item.meaning : item.japanese;
          setSentenceOptions(generateSentenceOptions(correctVal, prev, field));
        }
      }
      return prev;
    });
  }

  const currentQuiz = quizItems[quizIndex] ?? null;
  const currentWordQuiz = wordQuizItems[wordQuizIndex] ?? null;
  const currentSentenceQuiz = sentenceQuizItems[sentenceQuizIndex] ?? null;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>학습 진도</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        퀴즈에서 틀렸거나 헷갈린 항목이 여기에 기록됩니다.
      </p>

      {/* Kana 오답 퀴즈 섹션 */}
      <section
        style={{
          marginBottom: "2rem",
          border: "1px solid #a5b4fc",
          borderRadius: 8,
          padding: "1rem",
          background: "#f5f3ff",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Kana 오답 다시 풀기</h2>

        {quizItems.length === 0 ? (
          <p style={{ color: "#999", margin: 0 }}>Kana 오답이 없습니다.</p>
        ) : currentQuiz ? (
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              남은 오답: {quizItems.length}개
            </p>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "bold",
                textAlign: "center",
                padding: "1.2rem 0",
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: "1rem",
                letterSpacing: "0.05em",
              }}
            >
              {currentQuiz.char}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              {options.map((opt) => {
                let bg = "#fff";
                let border = "1px solid #ccc";
                let color = "#111";
                if (selected !== null) {
                  if (opt === currentQuiz.romaji) {
                    bg = "#d1fae5";
                    border = "1px solid #34d399";
                    color = "#065f46";
                  } else if (opt === selected && !isCorrect) {
                    bg = "#fee2e2";
                    border = "1px solid #f87171";
                    color = "#991b1b";
                  }
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={selected !== null}
                    style={{
                      padding: "0.6rem 0.5rem",
                      fontSize: "1rem",
                      borderRadius: 6,
                      border,
                      background: bg,
                      color,
                      cursor: selected !== null ? "default" : "pointer",
                      fontWeight: opt === currentQuiz.romaji && selected !== null ? "bold" : "normal",
                      transition: "background 0.15s",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div style={{ marginBottom: "0.75rem", textAlign: "center" }}>
                {isCorrect ? (
                  <span style={{ color: "#065f46", fontWeight: "bold", fontSize: "0.95rem" }}>
                    ✅ 정답입니다! wrongKana에서 제거했습니다.
                  </span>
                ) : (
                  <span style={{ color: "#991b1b", fontWeight: "bold", fontSize: "0.95rem" }}>
                    ❌ 오답입니다. 정답은 [{currentQuiz.romaji}]입니다.
                  </span>
                )}
              </div>
            )}

            {selected !== null && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={handleNext}
                  style={{
                    padding: "0.5rem 1.2rem",
                    fontSize: "0.9rem",
                    borderRadius: 6,
                    border: "1px solid #a5b4fc",
                    background: "#4f46e5",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  다음 오답 →
                </button>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* 단어 오답 퀴즈 섹션 */}
      <section
        style={{
          marginBottom: "2rem",
          border: "1px solid #6ee7b7",
          borderRadius: 8,
          padding: "1rem",
          background: "#f0fdf4",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>단어 오답 다시 풀기</h2>

        {wordQuizItems.length === 0 ? (
          <p style={{ color: "#999", margin: 0 }}>단어 오답이 없습니다.</p>
        ) : currentWordQuiz ? (
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              남은 오답: {wordQuizItems.length}개
            </p>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              {currentWordQuiz.mode === "wordToMeaning" ? "단어의 뜻을 고르세요" : "뜻에 맞는 단어를 고르세요"}
            </p>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                textAlign: "center",
                padding: "1rem 0",
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: "1rem",
                letterSpacing: "0.03em",
              }}
            >
              {currentWordQuiz.mode === "wordToMeaning" ? currentWordQuiz.word : currentWordQuiz.meaning}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              {wordOptions.map((opt) => {
                const correctVal = currentWordQuiz.mode === "wordToMeaning"
                  ? currentWordQuiz.meaning
                  : currentWordQuiz.word;
                let bg = "#fff";
                let border = "1px solid #ccc";
                let color = "#111";
                if (wordSelected !== null) {
                  if (opt === correctVal) {
                    bg = "#d1fae5";
                    border = "1px solid #34d399";
                    color = "#065f46";
                  } else if (opt === wordSelected && !wordIsCorrect) {
                    bg = "#fee2e2";
                    border = "1px solid #f87171";
                    color = "#991b1b";
                  }
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleWordOptionSelect(opt)}
                    disabled={wordSelected !== null}
                    style={{
                      padding: "0.6rem 0.5rem",
                      fontSize: "0.95rem",
                      borderRadius: 6,
                      border,
                      background: bg,
                      color,
                      cursor: wordSelected !== null ? "default" : "pointer",
                      fontWeight: opt === correctVal && wordSelected !== null ? "bold" : "normal",
                      transition: "background 0.15s",
                      wordBreak: "keep-all",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {wordSelected !== null && (
              <div style={{ marginBottom: "0.75rem", textAlign: "center" }}>
                {wordIsCorrect ? (
                  <span style={{ color: "#065f46", fontWeight: "bold", fontSize: "0.95rem" }}>
                    ✅ 정답입니다! wrongWords에서 제거했습니다.
                  </span>
                ) : (
                  <span style={{ color: "#991b1b", fontWeight: "bold", fontSize: "0.95rem" }}>
                    ❌ 오답입니다. 정답은 [{currentWordQuiz.mode === "wordToMeaning" ? currentWordQuiz.meaning : currentWordQuiz.word}]입니다.
                  </span>
                )}
              </div>
            )}

            {wordSelected !== null && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={handleWordNext}
                  style={{
                    padding: "0.5rem 1.2rem",
                    fontSize: "0.9rem",
                    borderRadius: 6,
                    border: "1px solid #6ee7b7",
                    background: "#059669",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  다음 단어 오답 →
                </button>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* 문장 오답 퀴즈 섹션 */}
      <section
        style={{
          marginBottom: "2rem",
          border: "1px solid #fbbf24",
          borderRadius: 8,
          padding: "1rem",
          background: "#fffbeb",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>문장 오답 다시 풀기</h2>

        {sentenceQuizItems.length === 0 ? (
          <p style={{ color: "#999", margin: 0 }}>문장 오답이 없습니다.</p>
        ) : currentSentenceQuiz ? (
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              남은 오답: {sentenceQuizItems.length}개
            </p>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              {currentSentenceQuiz.mode === "japaneseToMeaning"
                ? "문장의 뜻을 고르세요"
                : "뜻에 맞는 일본어 문장을 고르세요"}
            </p>
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: "bold",
                textAlign: "center",
                padding: "1rem",
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: "1rem",
                lineHeight: 1.6,
                wordBreak: "keep-all",
              }}
            >
              {currentSentenceQuiz.mode === "japaneseToMeaning"
                ? currentSentenceQuiz.japanese
                : currentSentenceQuiz.meaning}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              {sentenceOptions.map((opt) => {
                const correctVal = currentSentenceQuiz.mode === "japaneseToMeaning"
                  ? currentSentenceQuiz.meaning
                  : currentSentenceQuiz.japanese;
                let bg = "#fff";
                let border = "1px solid #ccc";
                let color = "#111";
                if (sentenceSelected !== null) {
                  if (opt === correctVal) {
                    bg = "#d1fae5";
                    border = "1px solid #34d399";
                    color = "#065f46";
                  } else if (opt === sentenceSelected && !sentenceIsCorrect) {
                    bg = "#fee2e2";
                    border = "1px solid #f87171";
                    color = "#991b1b";
                  }
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleSentenceOptionSelect(opt)}
                    disabled={sentenceSelected !== null}
                    style={{
                      padding: "0.6rem 0.5rem",
                      fontSize: "0.85rem",
                      borderRadius: 6,
                      border,
                      background: bg,
                      color,
                      cursor: sentenceSelected !== null ? "default" : "pointer",
                      fontWeight: opt === correctVal && sentenceSelected !== null ? "bold" : "normal",
                      transition: "background 0.15s",
                      wordBreak: "keep-all",
                      lineHeight: 1.4,
                      textAlign: "left",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {sentenceSelected !== null && (
              <div style={{ marginBottom: "0.75rem", textAlign: "center" }}>
                {sentenceIsCorrect ? (
                  <span style={{ color: "#065f46", fontWeight: "bold", fontSize: "0.95rem" }}>
                    ✅ 정답입니다! wrongSentences에서 제거했습니다.
                  </span>
                ) : (
                  <span style={{ color: "#991b1b", fontWeight: "bold", fontSize: "0.95rem" }}>
                    ❌ 오답입니다. 정답은 [{currentSentenceQuiz.mode === "japaneseToMeaning"
                      ? currentSentenceQuiz.meaning
                      : currentSentenceQuiz.japanese}]입니다.
                  </span>
                )}
              </div>
            )}

            {sentenceSelected !== null && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={handleSentenceNext}
                  style={{
                    padding: "0.5rem 1.2rem",
                    fontSize: "0.9rem",
                    borderRadius: 6,
                    border: "1px solid #fbbf24",
                    background: "#d97706",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  다음 문장 오답 →
                </button>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {SECTIONS.map(({ key, label, href, linkLabel }) => {
        const items = data[key];
        return (
          <section
            key={key}
            style={{
              marginBottom: "2rem",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{label}</h2>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <Link
                  href={href}
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.25rem 0.7rem",
                    background: "#3730a3",
                    color: "#fff",
                    borderRadius: 4,
                    textDecoration: "none",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {linkLabel}
                </Link>
                {items.length > 0 && (
                  <button
                    onClick={() => handleClearSection(key)}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.25rem 0.6rem",
                      cursor: "pointer",
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      color: "#c00",
                    }}
                  >
                    전체 삭제
                  </button>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <p style={{ color: "#999", margin: 0 }}>아직 기록이 없습니다. {linkLabel.replace("다시 ", "")}을 시작해 보세요!</p>
            ) : key === "wrongKana" ? (
              <ul style={{ margin: 0, paddingLeft: 0 }}>
                {items.map((item, i) => (
                  <li key={`wrong-kana-item-${i}`} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", listStyle: "none" }}>
                    <div style={{ flex: 1 }}>{renderKanaItem(item, i)}</div>
                    <button
                      onClick={() => removeWrongKanaItem(item)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.45rem",
                        cursor: "pointer",
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        color: "#c00",
                        marginTop: "0.1rem",
                      }}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {items.map((item, i) => (
                  <li key={`wrong-item-${key}-${i}`} style={{ marginBottom: "0.35rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ flex: 1 }}>{renderWordOrSentenceItem(item, i)}</span>
                      <button
                        onClick={() => {
                          if (key === "wrongWords") {
                            removeWrongWordItem(item);
                            return;
                          }
                          removeWrongSentenceItem(item);
                        }}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.45rem",
                          cursor: "pointer",
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          color: "#c00",
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
