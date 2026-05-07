"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type RoutineItem = {
  id: string;
  href: string;
  title: string;
  desc: string;
  duration: string;
  cta: string;
};

const todayRoutine: RoutineItem[] = [
  {
    id: "kana",
    href: "/kana",
    title: "가나 5문제 풀기",
    desc: "히라가나·가타카나를 빠르게 확인하며 감각을 깨워요.",
    duration: "약 5분",
    cta: "가나 학습하기",
  },
  {
    id: "words",
    href: "/words",
    title: "단어 퀴즈 풀기 5문제",
    desc: "자주 쓰는 단어를 짧은 퀴즈로 반복해 기억을 강화해요.",
    duration: "약 7분",
    cta: "단어 퀴즈 풀기",
  },
  {
    id: "sentences",
    href: "/sentences",
    title: "문장 3개 듣고 따라 말하기",
    desc: "짧은 문장을 듣고 소리 내어 말하며 리듬을 익혀요.",
    duration: "약 8분",
    cta: "문장 학습하기",
  },
  {
    id: "grammar",
    href: "/grammar",
    title: "문법 1개 풀기",
    desc: "기본 문법을 짧게 확인하고 문제로 점검해요.",
    duration: "약 5분",
    cta: "문법 학습하기",
  },
  {
    id: "review",
    href: "/review",
    title: "복습 항목 확인",
    desc: "저장한 단어와 틀린 항목을 다시 확인해요.",
    duration: "약 5분",
    cta: "복습하기",
  },
];

const practicalPractice: RoutineItem[] = [
  {
    id: "conversation",
    href: "/conversation",
    title: "AI 회화 바로가기",
    desc: "상황별 대화를 통해 실전 일본어 대응력을 길러요.",
    duration: "10분+",
    cta: "AI 회화",
  },
  {
    id: "writing",
    href: "/writing",
    title: "쓰기 연습 바로가기",
    desc: "오늘 배운 표현을 직접 써보며 문장 구성을 다져요.",
    duration: "10분+",
    cta: "쓰기 연습",
  },
];

const DAILY_ROUTINE_STORAGE_KEY = "dailyRoutineProgress";

type DailyRoutineStorage = {
  date: string;
  completedIds: string[];
};

type RecommendationState = {
  hasGrammarWrong: boolean;
  hasReviewItems: boolean;
};

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getArrayLength = (value: unknown) => (Array.isArray(value) ? value.length : 0);

export default function HomePage() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationState>({
    hasGrammarWrong: false,
    hasReviewItems: false,
  });
  const todayKey = useMemo(() => getTodayKey(), []);
  const hasLoadedRoutineRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(DAILY_ROUTINE_STORAGE_KEY);
      if (!raw) {
        setCompletedIds([]);
      } else {
        const parsed: unknown = JSON.parse(raw);
        const isValidObject = typeof parsed === "object" && parsed !== null;
        const parsedDate = isValidObject && "date" in parsed ? (parsed as { date?: unknown }).date : null;
        const parsedIds =
          isValidObject && "completedIds" in parsed
            ? (parsed as { completedIds?: unknown }).completedIds
            : null;

        if (parsedDate === todayKey && Array.isArray(parsedIds)) {
          const validIds = parsedIds.filter(
            (id): id is string => typeof id === "string" && todayRoutine.some((item) => item.id === id),
          );
          setCompletedIds(validIds);
        } else {
          setCompletedIds([]);
        }
      }

      const grammarProgressRaw = window.localStorage.getItem("grammarProgress");
      const wrongKanaRaw = window.localStorage.getItem("wrongKana");
      const wrongKanaCharsRaw = window.localStorage.getItem("wrongKanaChars");
      const wrongWordsRaw = window.localStorage.getItem("wrongWords");
      const wrongSentencesRaw = window.localStorage.getItem("wrongSentences");
      const savedWordsRaw = window.localStorage.getItem("savedWords");
      const savedSentencesRaw = window.localStorage.getItem("savedSentences");

      const grammarProgress = grammarProgressRaw ? (JSON.parse(grammarProgressRaw) as unknown) : null;
      const wrongKana = wrongKanaRaw ? (JSON.parse(wrongKanaRaw) as unknown) : null;
      const wrongKanaChars = wrongKanaCharsRaw ? (JSON.parse(wrongKanaCharsRaw) as unknown) : null;
      const wrongWords = wrongWordsRaw ? (JSON.parse(wrongWordsRaw) as unknown) : null;
      const wrongSentences = wrongSentencesRaw ? (JSON.parse(wrongSentencesRaw) as unknown) : null;
      const savedWords = savedWordsRaw ? (JSON.parse(savedWordsRaw) as unknown) : null;
      const savedSentences = savedSentencesRaw ? (JSON.parse(savedSentencesRaw) as unknown) : null;

      const grammarItems = Array.isArray(grammarProgress) ? grammarProgress : [];
      const hasGrammarWrong = grammarItems.some((item) => {
        if (typeof item !== "object" || item === null) return false;
        const wrongCount = "wrongCount" in item ? (item as { wrongCount?: unknown }).wrongCount : 0;
        const lastResult = "lastResult" in item ? (item as { lastResult?: unknown }).lastResult : "";
        return (typeof wrongCount === "number" && wrongCount > 0) || lastResult === "wrong";
      });

      const reviewCount =
        getArrayLength(wrongKana) +
        getArrayLength(wrongKanaChars) +
        getArrayLength(wrongWords) +
        getArrayLength(wrongSentences) +
        getArrayLength(savedWords) +
        getArrayLength(savedSentences);

      setRecommendation({
        hasGrammarWrong,
        hasReviewItems: hasGrammarWrong || reviewCount > 0,
      });
    } catch {
      setCompletedIds([]);
      setRecommendation({ hasGrammarWrong: false, hasReviewItems: false });
    } finally {
      hasLoadedRoutineRef.current = true;
    }
  }, [todayKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasLoadedRoutineRef.current) return;

    const data: DailyRoutineStorage = {
      date: todayKey,
      completedIds,
    };
    window.localStorage.setItem(DAILY_ROUTINE_STORAGE_KEY, JSON.stringify(data));
  }, [completedIds, todayKey]);

  const completedCount = completedIds.length;
  const progressPercent = Math.round((completedCount / todayRoutine.length) * 100);
  const isAllCompleted = completedCount === todayRoutine.length;

  const toggleCompleted = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((completedId) => completedId !== id) : [...prev, id],
    );
  };

  return (
    <section>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            padding: "12px 0 20px",
          }}
        >
          <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>오늘 학습 루틴</h1>
          <p className="muted" style={{ margin: 0 }}>
            가나, 단어, 문장, 문법, 복습을 짧게 반복해 보세요.
          </p>
          <p className="muted" style={{ margin: "8px 0 0", fontWeight: 600 }}>
            오늘 완료 {completedCount} / {todayRoutine.length}
          </p>
          <div style={{ margin: "10px auto 0", maxWidth: "420px", width: "100%" }}>
            <div
              aria-hidden="true"
              style={{
                width: "100%",
                height: "9px",
                borderRadius: "999px",
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: "#3b82f6",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
            <p className="muted" style={{ margin: "6px 0 0", fontSize: "12px" }}>
              {progressPercent}% 완료
            </p>
          </div>
          {isAllCompleted && (
            <p
              style={{
                margin: "10px auto 0",
                maxWidth: "420px",
                width: "100%",
                borderRadius: "10px",
                border: "1px solid #86efac",
                background: "#f0fdf4",
                padding: "10px 12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#166534",
              }}
            >
              오늘 루틴을 모두 완료했어요! 잘했어요.
            </p>
          )}
        </div>

        <section className="card" style={{ padding: "14px", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "18px", margin: "0 0 8px" }}>오늘 추천</h2>
          <p className="muted" style={{ margin: 0 }}>
            {recommendation.hasGrammarWrong
              ? "문법에서 오답이 있어요. [문법] 1개를 먼저 복습해 보세요."
              : recommendation.hasReviewItems
                ? "복습할 항목이 있어요. 오늘은 [복습]에서 먼저 확인해 보세요."
                : "오늘은 새 학습을 진행하기 좋은 상태예요."}
          </p>
        </section>

        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            marginBottom: "16px",
          }}
        >
          {todayRoutine.map((item) => {
            const isCompleted = completedIds.includes(item.id);
            return (
              <article
                key={item.id}
                className="card"
                style={{
                  display: "grid",
                  gap: "10px",
                  padding: "14px",
                  background: isCompleted ? "#f0fdf4" : "var(--card)",
                  border: isCompleted ? "1px solid #22c55e" : "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <h2 style={{ fontSize: "17px", margin: 0 }}>{item.title}</h2>
                    {isCompleted && (
                      <span
                        style={{
                          borderRadius: "999px",
                          border: "1px solid #22c55e",
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "3px 8px",
                          fontSize: "12px",
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        ✓ 완료됨
                      </span>
                    )}
                  </div>
                  <p className="muted" style={{ margin: "0 0 8px" }}>
                    {item.desc}
                  </p>
                  <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
                    예상 소요 시간: {item.duration}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Link
                    href={item.href}
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "inherit",
                      background: "var(--card)",
                    }}
                  >
                    {item.cta}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleCompleted(item.id)}
                    style={{
                      border: isCompleted ? "1px solid #16a34a" : "1px solid #94a3b8",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: isCompleted ? "#166534" : "#1f2937",
                      background: isCompleted ? "#dcfce7" : "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    {isCompleted ? "완료 취소" : "완료"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <section className="card" style={{ padding: "14px", marginBottom: "20px" }}>
          <p className="muted" style={{ margin: "0 0 10px" }}>
            오늘 학습 상태는 [진도]에서 자세히 볼 수 있어요.
          </p>
          <Link
            href="/progress"
            style={{
              display: "inline-block",
              textDecoration: "none",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "inherit",
              background: "var(--card)",
            }}
          >
            진도 보기
          </Link>
        </section>

        <section style={{ marginTop: "8px" }}>
          <h2 style={{ fontSize: "20px", margin: "0 0 10px" }}>실전 연습</h2>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {practicalPractice.map((item) => (
              <article
                key={item.id}
                className="card"
                style={{
                  display: "grid",
                  gap: "10px",
                  padding: "14px",
                }}
              >
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>{item.title}</div>
                  <p className="muted" style={{ margin: "0 0 8px" }}>
                    {item.desc}
                  </p>
                  <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
                    추천 시간: {item.duration}
                  </p>
                </div>
                <div>
                  <Link
                    href={item.href}
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "inherit",
                      background: "var(--card)",
                    }}
                  >
                    {item.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
