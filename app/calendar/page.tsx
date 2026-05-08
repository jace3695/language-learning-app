"use client";

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

const toDateKey = getLocalDateKey;

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getStreakDays = (history: DailyLearningHistoryStorage, today: Date) => {
  let streak = 0;
  const cursor = new Date(today);

  while (true) {
    const key = toDateKey(cursor);
    const entry = history[key];
    if (!entry || entry.completedCount <= 0) break;

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
  const currentMonthLearnedDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    return Object.entries(history).filter(([dateKey, entry]) => {
      if (!entry || entry.completedCount <= 0) return false;
      const date = parseDateKey(dateKey);
      return date.getFullYear() === year && date.getMonth() === month;
    }).length;
  }, [history, viewDate]);

  const streakDays = useMemo(() => getStreakDays(history, today), [history, today]);
  const todayEntry = history[toDateKey(today)];
  const todayRate = todayEntry ? Math.round((todayEntry.completedCount / Math.max(todayEntry.totalCount, 1)) * 100) : 0;

  const selectedEntry = history[selectedDateKey];
  const selectedCompletedIds = getSafeCompletedIds(selectedEntry?.completedIds);
  const selectedDateLabel = selectedDateKey.replaceAll("-", ".");

  return (
    <section>
      <div className="page-header">
        <h1>학습 달력</h1>
        <p className="muted" style={{ margin: 0 }}>날짜별 루틴 완료 기록을 확인해 보세요.</p>
      </div>

      <section className="card" style={{ marginBottom: "12px" }}>
        <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <div><strong>연속 학습일</strong><div>{streakDays}일</div></div>
          <div><strong>이번 달 학습일</strong><div>{currentMonthLearnedDays}일</div></div>
          <div><strong>오늘 완료율</strong><div>{todayRate}%</div></div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>이전 달</button>
          <h2 style={{ margin: 0 }}>{viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월</h2>
          <div style={{ display: "flex", gap: "6px" }}>
            <button type="button" onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}>이번 달</button>
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>다음 달</button>
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
            const isLearned = !!entry && entry.completedCount > 0;
            const isToday = isSameDay(day, today);
            const isSelected = selectedDateKey === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDateKey(dateKey)}
                style={{
                  minHeight: "62px",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: isLearned ? "#dcfce7" : "#ffffff",
                  color: "#111827",
                  fontWeight: isToday ? 700 : 500,
                }}
              >
                <div>{day.getDate()}</div>
                {isLearned && <div style={{ fontSize: "11px", color: "#166534" }}>학습</div>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card" style={{ marginTop: "12px" }}>
        <h2 style={{ marginTop: 0 }}>{selectedDateLabel} 완료 루틴</h2>
        {!selectedEntry || selectedCompletedIds.length === 0 ? (
          <p className="muted" style={{ marginBottom: 0 }}>완료한 루틴이 없습니다.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {selectedCompletedIds.map((id) => (
              <li key={id}>{routineLabelMap[id] ?? id}</li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
