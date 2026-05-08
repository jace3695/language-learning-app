"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getLocalDateKey } from "@/utils/dateKey";

const DAILY_LEARNING_HISTORY_STORAGE_KEY = "dailyLearningHistory";

type DailyLearningHistoryItem = {
  completedIds: string[];
  completedCount: number;
  totalCount: number;
  updatedAt: string;
};

type DailyLearningHistoryStorage = Record<string, DailyLearningHistoryItem>;
const getSafeCompletedIds = (value: unknown) =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];

const routineLabelMap: Record<string, string> = {
  kana: "가나",
  words: "단어",
  sentences: "문장",
  grammar: "문법",
  review: "복습",
};



const routineOrder = ["kana", "words", "sentences", "grammar", "review"] as const;
const toDateKey = getLocalDateKey;

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getCompletedCount = (entry?: DailyLearningHistoryItem) => {
  if (!entry) return 0;

  const countFromField = Number.isFinite(entry.completedCount) ? entry.completedCount : 0;
  const countFromIds = getSafeCompletedIds(entry.completedIds).length;

  return Math.max(countFromField, countFromIds, 0);
};

const getDayVisual = (completedCount: number) => {
  if (completedCount >= 5) {
    return { background: "#bbf7d0", tone: "#14532d", label: "5/5" };
  }
  if (completedCount >= 3) {
    return { background: "#dcfce7", tone: "#166534", label: `${Math.min(completedCount, 5)}/5` };
  }
  if (completedCount >= 1) {
    return { background: "#f0fdf4", tone: "#15803d", label: `${Math.min(completedCount, 5)}/5` };
  }

  return { background: "#ffffff", tone: "#6b7280", label: "" };
};

const getStreakDays = (history: DailyLearningHistoryStorage, today: Date) => {
  let streak = 0;
  const cursor = new Date(today);

  while (true) {
    const key = toDateKey(cursor);
    const entry = history[key];
    if (!entry || getCompletedCount(entry) <= 0) break;

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const getMonthDays = (viewDate: Date) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekday = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: Array<Date | null> = [];
  for (let i = 0; i < startWeekday; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(today));

  const [history, setHistory] = useState<DailyLearningHistoryStorage>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadHistory = () => {
      try {
        const raw = window.localStorage.getItem(DAILY_LEARNING_HISTORY_STORAGE_KEY);
        if (!raw) {
          setHistory({});
          return;
        }
        const parsed: unknown = JSON.parse(raw);
        setHistory(typeof parsed === "object" && parsed !== null ? (parsed as DailyLearningHistoryStorage) : {});
      } catch {
        setHistory({});
      }
    };

    loadHistory();
    window.addEventListener("storage", loadHistory);
    window.addEventListener("focus", loadHistory);

    return () => {
      window.removeEventListener("storage", loadHistory);
      window.removeEventListener("focus", loadHistory);
    };
  }, []);

  const calendarDays = useMemo(() => getMonthDays(viewDate), [viewDate]);
  const monthStats = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    return Object.entries(history).reduce(
      (acc, [dateKey, entry]) => {
        if (!entry || getCompletedCount(entry) <= 0) return acc;

        const date = parseDateKey(dateKey);
        if (!date) return acc;
        if (date.getFullYear() !== year || date.getMonth() !== month) return acc;

        return {
          learnedDays: acc.learnedDays + 1,
          totalCompletedRoutines: acc.totalCompletedRoutines + getCompletedCount(entry),
        };
      },
      { learnedDays: 0, totalCompletedRoutines: 0 },
    );
  }, [history, viewDate]);

  const streakDays = useMemo(() => getStreakDays(history, today), [history, today]);
  const todayEntry = history[toDateKey(today)];
  const todayCompletedCount = getCompletedCount(todayEntry);
  const todayTotalCount = Number.isFinite(todayEntry?.totalCount) && (todayEntry?.totalCount ?? 0) > 0
    ? (todayEntry?.totalCount as number)
    : routineOrder.length;
  const todayRate = todayEntry ? Math.round((todayCompletedCount / Math.max(todayTotalCount, 1)) * 100) : 0;

  const moveMonth = (diff: number) => {
    const nextMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + diff, 1);
    setViewDate(nextMonthDate);
    setSelectedDateKey(toDateKey(nextMonthDate));
  };

  const moveToCurrentMonth = () => {
    const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    setViewDate(currentMonthDate);
    setSelectedDateKey(toDateKey(today));
  };

  const selectedEntry = history[selectedDateKey];
  const selectedCompletedIds = getSafeCompletedIds(selectedEntry?.completedIds);
  const selectedCompletedIdSet = new Set(selectedCompletedIds);
  const completedRoutines = routineOrder.filter((id) => selectedCompletedIdSet.has(id));
  const incompletedRoutines = routineOrder.filter((id) => !selectedCompletedIdSet.has(id));
  const hasLearningRecord = Boolean(selectedEntry && selectedCompletedIds.length > 0);
  const selectedDateLabel = selectedDateKey.replaceAll("-", ".");
  const isSelectedToday = selectedDateKey === toDateKey(today);

  return (
    <section>
      <div className="page-header">
        <h1>학습 달력</h1>
        <p className="muted" style={{ margin: 0 }}>날짜별 루틴 완료 기록을 확인해 보세요.</p>
      </div>

      <section className="card" style={{ marginBottom: "12px" }}>
        <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <div><strong>연속 학습일</strong><div>{streakDays}일</div></div>
          <div><strong>이번 달 학습일</strong><div>{monthStats.learnedDays}일</div></div>
          <div><strong>이번 달 총 완료 루틴</strong><div>{monthStats.totalCompletedRoutines}개</div></div>
          <div><strong>오늘 완료율</strong><div>{todayRate}%</div></div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
          <button type="button" onClick={() => moveMonth(-1)}>이전 달</button>
          <h2 style={{ margin: 0 }}>{viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월</h2>
          <div style={{ display: "flex", gap: "6px" }}>
            <button type="button" onClick={moveToCurrentMonth}>이번 달</button>
            <button type="button" onClick={() => moveMonth(1)}>다음 달</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "6px", marginBottom: "6px" }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} style={{ textAlign: "center", fontSize: "13px", color: "#6b7280" }}>{day}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "6px" }}>
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} style={{ minHeight: "62px" }} />;

            const dateKey = toDateKey(day);
            const entry = history[dateKey];
            const completedCount = getCompletedCount(entry);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDateKey === dateKey;
            const visual = getDayVisual(completedCount);
            const baseBorder = isSelected ? "2px solid #2563eb" : "1px solid #d1d5db";
            const todayShadow = isToday
              ? "inset 0 0 0 1px rgba(37, 99, 235, 0.35), 0 0 0 1px rgba(37, 99, 235, 0.2)"
              : "none";

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDateKey(dateKey)}
                style={{
                  minHeight: "62px",
                  borderRadius: "10px",
                  border: baseBorder,
                  background: visual.background,
                  color: "#111827",
                  fontWeight: isToday ? 700 : 500,
                  boxShadow: todayShadow,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <div>{day.getDate()}</div>
                {visual.label && (
                  <div style={{ fontSize: "11px", color: visual.tone, fontWeight: 600 }}>
                    {visual.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card" style={{ marginTop: "12px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "12px" }}>{selectedDateLabel} 학습 상세</h2>

        {!hasLearningRecord ? (
          <p className="muted" style={{ marginTop: 0, marginBottom: isSelectedToday ? "12px" : 0 }}>
            이 날짜에는 완료된 학습 기록이 없습니다.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", borderRadius: "10px", padding: "10px" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "14px", color: "#166534" }}>완료 루틴</h3>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {completedRoutines.map((id) => (
                  <li key={id}>{routineLabelMap[id] ?? id}</li>
                ))}
              </ul>
            </div>
            <div style={{ border: "1px solid #e5e7eb", background: "#f9fafb", borderRadius: "10px", padding: "10px" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "14px", color: "#4b5563" }}>미완료 루틴</h3>
              <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {incompletedRoutines.map((id) => (
                  <li key={id}>{routineLabelMap[id] ?? id}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {isSelectedToday && (
          <div
            style={{
              marginTop: "14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
            }}
          >
            <p className="muted" style={{ margin: 0 }}>
              오늘 기록을 확인했으면 [홈]으로 돌아가 남은 루틴을 이어서 진행해 보세요.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                textDecoration: "none",
                border: "1px solid #86efac",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#166534",
                background: "#f0fdf4",
                whiteSpace: "nowrap",
              }}
            >
              홈으로 돌아가 오늘 루틴 하기
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}
