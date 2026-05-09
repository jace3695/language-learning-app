"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  GRAMMAR_LESSONS,
  GRAMMAR_PROGRESS_KEY,
  type GrammarCategory,
  type GrammarLesson,
  type GrammarProgressItem,
} from "@/data/grammar";
import { markTodayRoutineCompleted } from "@/utils/dailyRoutineProgress";

type GrammarFilter = "전체" | GrammarCategory;

export default function GrammarPage() {
  const [filter, setFilter] = useState<GrammarFilter>("전체");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [grammarProgress, setGrammarProgress] = useState<GrammarProgressItem[]>([]);



  useEffect(() => {
    try {
      const raw = localStorage.getItem(GRAMMAR_PROGRESS_KEY);
      if (!raw) {
        setGrammarProgress([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setGrammarProgress([]);
        return;
      }
      setGrammarProgress(parsed as GrammarProgressItem[]);
    } catch {
      setGrammarProgress([]);
    }
  }, []);

  const saveGrammarProgress = (next: GrammarProgressItem[]) => {
    setGrammarProgress(next);
    try {
      localStorage.setItem(GRAMMAR_PROGRESS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const visibleLessons = useMemo(
    () => (filter === "전체" ? GRAMMAR_LESSONS : GRAMMAR_LESSONS.filter((l) => l.category === filter)),
    [filter],
  );

  const handleSelectAnswer = (lesson: GrammarLesson, choice: string) => {
    if (selectedAnswers[lesson.id]) {
      return;
    }

    setSelectedAnswers((prev) => ({ ...prev, [lesson.id]: choice }));

    const isCorrect = choice === lesson.quiz.answer;
    const now = new Date().toISOString();
    const existing = grammarProgress.find((item) => item.lessonId === lesson.id);
    const nextItem: GrammarProgressItem = existing
      ? {
          ...existing,
          title: lesson.title,
          category: lesson.category,
          pattern: lesson.pattern,
          correctCount: existing.correctCount + (isCorrect ? 1 : 0),
          wrongCount: existing.wrongCount + (isCorrect ? 0 : 1),
          lastAnsweredAt: now,
          lastResult: isCorrect ? "correct" : "wrong",
        }
      : {
          lessonId: lesson.id,
          title: lesson.title,
          category: lesson.category,
          pattern: lesson.pattern,
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
          lastAnsweredAt: now,
          lastResult: isCorrect ? "correct" : "wrong",
        };

    const nextProgress = existing
      ? grammarProgress.map((item) => (item.lessonId === lesson.id ? nextItem : item))
      : [...grammarProgress, nextItem];

    saveGrammarProgress(nextProgress);
    markTodayRoutineCompleted("grammar");
  };

  const resetLessonQuiz = (lessonId: string) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[lessonId];
      return next;
    });
  };

  const handleSpeak = (text: string) => {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        console.error("speechSynthesis를 사용할 수 없습니다.");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("예문 듣기 처리 중 오류가 발생했습니다.", error);
    }
  };

  return (
    <section>
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>문법 기초</h1>
        <p className="muted" style={{ margin: 0 }}>
          문장을 이해하고 직접 만들기 위한 기본 문법을 짧게 연습해요.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {(["전체", "です/ます", "조사", "지시어", "기타"] as const).map((item) => {
          const isActive = filter === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              style={{
                border: isActive ? "1px solid #111827" : "1px solid #d1d5db",
                borderRadius: "999px",
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: 700,
                background: isActive ? "#111827" : "#ffffff",
                color: isActive ? "#ffffff" : "#111827",
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
        {visibleLessons.map((lesson) => {
          const selectedAnswer = selectedAnswers[lesson.id];
          const isCorrect = selectedAnswer === lesson.quiz.answer;
          const progressItem = grammarProgress.find((item) => item.lessonId === lesson.id);
          const progressText = progressItem
            ? `진도: 정답 ${progressItem.correctCount}회 · 오답 ${progressItem.wrongCount}회`
            : "진도: 아직 풀지 않음";
          const recentText = progressItem
            ? `최근: ${progressItem.lastResult === "correct" ? "정답" : "오답"}`
            : "최근: -";

          return (
            <article key={lesson.id} className="card" style={{ padding: "14px", display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                <h2 style={{ fontSize: "18px", margin: 0 }}>{lesson.title}</h2>
                <span style={{ fontSize: "12px", fontWeight: 700, borderRadius: "999px", border: "1px solid var(--line)", padding: "4px 8px" }}>{lesson.category}</span>
              </div>
              <p className="muted" style={{ margin: 0 }}>{lesson.summary}</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "12px" }}>
                <span style={{ border: "1px solid var(--line)", borderRadius: "999px", padding: "4px 8px" }}>{progressText}</span>
                <span style={{ border: "1px solid var(--line)", borderRadius: "999px", padding: "4px 8px" }}>{recentText}</span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700 }}>핵심 패턴: {lesson.pattern}</div>
              <p className="muted" style={{ margin: 0, fontSize: "14px" }}>{lesson.explanation}</p>

              <div style={{ display: "grid", gap: "6px" }}>
                {lesson.examples.map((e) => (
                  <div key={`${lesson.id}-${e.japanese}`} style={{ fontSize: "14px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                      <span>{e.japanese}</span>
                      <button type="button" onClick={() => handleSpeak(e.japanese)} style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "6px 10px", background: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>예문 듣기</button>
                    </div>
                    <div className="muted">{e.meaning}</div>
                  </div>
                ))}
              </div>

              {lesson.sentencePattern && (
                <div>
                  <Link
                    href={`/sentences?pattern=${encodeURIComponent(lesson.sentencePattern)}`}
                    style={{
                      display: "inline-block",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      background: "#fff",
                      color: "#111827",
                      fontSize: "13px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    관련 문장 학습
                  </Link>
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "10px", display: "grid", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>연습 문제</div>
                <p style={{ margin: 0, fontSize: "14px" }}>{lesson.quiz.question}</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {lesson.quiz.choices.map((c) => {
                    const isAnswer = c === lesson.quiz.answer;
                    const isSelected = selectedAnswer === c;
                    const answered = Boolean(selectedAnswer);

                    let background = "#ffffff";
                    let border = "1px solid #d1d5db";
                    let color = "#111827";

                    if (answered && isAnswer) {
                      background = "#dcfce7";
                      border = "1px solid #22c55e";
                      color = "#166534";
                    } else if (answered && isSelected && !isAnswer) {
                      background = "#fee2e2";
                      border = "1px solid #ef4444";
                      color = "#991b1b";
                    } else if (answered) {
                      background = "#f9fafb";
                      color = "#6b7280";
                    }

                    return (
                      <button
                        key={`${lesson.id}-${c}`}
                        type="button"
                        onClick={() => handleSelectAnswer(lesson, c)}
                        disabled={answered}
                        style={{
                          width: "100%",
                          minHeight: "44px",
                          padding: "10px 12px",
                          textAlign: "left",
                          border,
                          borderRadius: "10px",
                          background,
                          color,
                          cursor: answered ? "default" : "pointer",
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer && (
                  <div
                    style={{
                      marginTop: "4px",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      fontSize: "13px",
                      fontWeight: 600,
                      background: isCorrect ? "#ecfdf5" : "#fff7ed",
                      border: isCorrect ? "1px solid #86efac" : "1px solid #fdba74",
                      color: isCorrect ? "#166534" : "#9a3412",
                    }}
                  >
                    <div>{isCorrect ? "정답이에요!" : `아쉬워요. 정답은 ${lesson.quiz.answer} 입니다.`}</div>
                    {lesson.quiz.explanation && <div style={{ marginTop: "4px" }}>{lesson.quiz.explanation}</div>}
                  </div>
                )}

                {selectedAnswer && (
                  <button
                    type="button"
                    onClick={() => resetLessonQuiz(lesson.id)}
                    style={{
                      width: "fit-content",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    다시 풀기
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
