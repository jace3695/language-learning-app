"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RoutineItem = {
  href: string;
  title: string;
  desc: string;
  duration: string;
  cta: string;
};

const todayRoutine: RoutineItem[] = [
  {
    href: "/kana",
    title: "가나 5문제 풀기",
    desc: "히라가나·가타카나를 빠르게 확인하며 감각을 깨워요.",
    duration: "약 5분",
    cta: "가나 시작",
  },
  {
    href: "/words",
    title: "단어 퀴즈 5문제",
    desc: "자주 쓰는 단어를 짧은 퀴즈로 반복해 기억을 강화해요.",
    duration: "약 7분",
    cta: "단어 퀴즈",
  },
  {
    href: "/sentences",
    title: "문장 3개 듣고 따라 말하기",
    desc: "짧은 문장을 듣고 소리 내어 말하며 리듬을 익혀요.",
    duration: "약 8분",
    cta: "문장 연습",
  },
  {
    href: "/speaking",
    title: "말하기 훈련 3문장",
    desc: "핵심 표현 3문장을 직접 말하며 발화를 자연스럽게 만들어요.",
    duration: "약 8분",
    cta: "말하기 시작",
  },
  {
    href: "/progress",
    title: "오답 복습하기",
    desc: "틀린 문제를 다시 확인해 취약한 부분을 보완해요.",
    duration: "약 6분",
    cta: "오답 복습",
  },
];

const practicalPractice: RoutineItem[] = [
  {
    href: "/conversation",
    title: "AI 회화 바로가기",
    desc: "상황별 대화를 통해 실전 일본어 대응력을 길러요.",
    duration: "10분+",
    cta: "AI 회화",
  },
  {
    href: "/writing",
    title: "쓰기 연습 바로가기",
    desc: "오늘 배운 표현을 직접 써보며 문장 구성을 다져요.",
    duration: "10분+",
    cta: "쓰기 연습",
  },
];

const DAILY_ROUTINE_STORAGE_KEY = "dailyRoutineStatus";

type DailyRoutineStorage = {
  date: string;
  completed: Record<string, boolean>;
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

export default function HomePage() {
  const [completedByHref, setCompletedByHref] = useState<Record<string, boolean>>({});
  const todayKey = useMemo(() => getTodayKey(), []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(DAILY_ROUTINE_STORAGE_KEY);
      if (!raw) {
        setCompletedByHref({});
        return;
      }

      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("date" in parsed) ||
        !("completed" in parsed)
      ) {
        setCompletedByHref({});
        return;
      }

      const date = (parsed as DailyRoutineStorage).date;
      const completed = (parsed as DailyRoutineStorage).completed;
      if (date !== todayKey || typeof completed !== "object" || completed === null) {
        setCompletedByHref({});
        return;
      }

      const nextCompleted: Record<string, boolean> = {};
      for (const item of todayRoutine) {
        nextCompleted[item.href] = Boolean(completed[item.href]);
      }
      setCompletedByHref(nextCompleted);
    } catch {
      setCompletedByHref({});
    }
  }, [todayKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const data: DailyRoutineStorage = {
      date: todayKey,
      completed: completedByHref,
    };
    window.localStorage.setItem(DAILY_ROUTINE_STORAGE_KEY, JSON.stringify(data));
  }, [completedByHref, todayKey]);

  const completedCount = todayRoutine.reduce(
    (count, item) => count + (completedByHref[item.href] ? 1 : 0),
    0,
  );

  const toggleCompleted = (href: string) => {
    setCompletedByHref((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const resetAllCompleted = () => {
    setCompletedByHref({});
  };

  return (
    <section>
      <div
        style={{
          textAlign: "center",
          padding: "12px 0 24px",
        }}
      >
        <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>오늘 학습 루틴</h1>
        <p className="muted" style={{ margin: 0 }}>
          가나, 단어, 문장, 말하기를 짧게 반복해 보세요.
        </p>
        <p className="muted" style={{ margin: "8px 0 0", fontWeight: 600 }}>
          오늘 완료 {completedCount} / {todayRoutine.length}
        </p>
        <div style={{ marginTop: "10px" }}>
          <button
            type="button"
            onClick={resetAllCompleted}
            style={{
              border: "1px solid var(--line)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "inherit",
              background: "var(--card)",
              cursor: "pointer",
            }}
          >
            전체 초기화
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
        {todayRoutine.map((item) => (
          <article
            key={item.href}
            className="card"
            style={{
              display: "grid",
              gap: "10px",
              padding: "14px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "17px",
                  margin: "0 0 6px",
                }}
              >
                {completedByHref[item.href] ? `✅ ${item.title}` : item.title}
              </h2>
              <p className="muted" style={{ margin: "0 0 8px" }}>
                {item.desc}
              </p>
              {completedByHref[item.href] && (
                <p className="muted" style={{ margin: "0 0 8px", fontWeight: 600 }}>
                  완료됨
                </p>
              )}
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
                onClick={() => toggleCompleted(item.href)}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "inherit",
                  background: completedByHref[item.href] ? "var(--line)" : "var(--card)",
                  cursor: "pointer",
                }}
              >
                {completedByHref[item.href] ? "완료됨" : "완료"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <section style={{ marginTop: "8px" }}>
        <h2 style={{ fontSize: "20px", margin: "0 0 10px" }}>실전 연습</h2>
        <div style={{ display: "grid", gap: "12px" }}>
          {practicalPractice.map((item) => (
            <article
              key={item.href}
              className="card"
              style={{
                display: "grid",
                gap: "10px",
                padding: "14px",
              }}
            >
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>
                  {item.title}
                </div>
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
    </section>
  );
}
