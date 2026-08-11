"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CURRICULUM,
  TRACKS,
  getLesson,
  getTrackLessons,
  type CourseTrack,
} from "@/data/curriculum";
import {
  DEFAULT_CURRICULUM_PROGRESS,
  CURRICULUM_REVIEW_KEY,
  loadCurriculumProgress,
  saveCurriculumProgress,
  type CurriculumProgress,
} from "@/utils/curriculumProgress";

const trackOrder: CourseTrack[] = ["foundation", "work", "travel"];

function CurriculumContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const requestedTrack = searchParams.get("track");
  const [progress, setProgress] = useState<CurriculumProgress>(DEFAULT_CURRICULUM_PROGRESS);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showReading, setShowReading] = useState(true);

  const selectedTrack: CourseTrack =
    requestedTrack === "work" || requestedTrack === "travel" || requestedTrack === "foundation"
      ? requestedTrack
      : progress.selectedTrack;
  const activeLesson = getLesson(lessonId);
  const isLessonMode = Boolean(lessonId);
  const lessons = useMemo(() => getTrackLessons(selectedTrack), [selectedTrack]);

  useEffect(() => {
    // 브라우저 전용 localStorage 기록은 마운트 후 복원합니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadCurriculumProgress());
    setLoaded(true);
  }, []);

  useEffect(() => {
    // URL로 다른 수업을 열 때 플레이어 단계도 처음으로 되돌립니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStage(0);
    setAnswers({});
  }, [lessonId]);

  const updateProgress = (next: CurriculumProgress) => {
    setProgress(next);
    saveCurriculumProgress(next);
  };

  const chooseTrack = (track: CourseTrack) => {
    updateProgress({ ...progress, selectedTrack: track });
  };

  const finishLesson = () => {
    const correct = activeLesson.quiz.filter((quiz, index) => answers[index] === quiz.answer).length;
    const score = Math.round((correct / activeLesson.quiz.length) * 100);
    updateProgress({
      ...progress,
      selectedTrack: activeLesson.track,
      completedLessonIds: Array.from(new Set([...progress.completedLessonIds, activeLesson.id])),
      quizScores: { ...progress.quizScores, [activeLesson.id]: score },
      lastLessonId: activeLesson.id,
    });
    try {
      const raw = window.localStorage.getItem(CURRICULUM_REVIEW_KEY);
      const stored = raw ? (JSON.parse(raw) as unknown) : [];
      const existing = Array.isArray(stored) ? stored : [];
      const wrongItems = activeLesson.quiz.flatMap((quiz, index) =>
        answers[index] === quiz.answer
          ? []
          : [{
              id: `${activeLesson.id}:${index}`,
              lessonId: activeLesson.id,
              lessonTitle: activeLesson.title,
              prompt: quiz.prompt,
              explanation: quiz.explanation,
              createdAt: new Date().toISOString(),
            }],
      );
      const nextReview = [...existing.filter((item) => {
        if (!item || typeof item !== "object" || !("id" in item)) return false;
        return !String(item.id).startsWith(`${activeLesson.id}:`);
      }), ...wrongItems];
      window.localStorage.setItem(CURRICULUM_REVIEW_KEY, JSON.stringify(nextReview));
    } catch {
      // 복습 저장 실패가 수업 완료 기록을 막지 않도록 합니다.
    }
    setStage(5);
  };

  if (!loaded) return <div className="learn-loading">학습 기록을 불러오는 중이에요.</div>;

  if (!isLessonMode) {
    const completedTotal = progress.completedLessonIds.length;
    return (
      <section className="curriculum-page">
        <header className="curriculum-hero">
          <span>새로운 학습 과정</span>
          <h1>처음부터, 실제로 말할 수 있게</h1>
          <p>단어만 외우지 않아요. 하루 10분 동안 표현·문법·대화·말하기·문제를 한 번에 연결합니다.</p>
          <div className="curriculum-summary">
            <strong>{completedTotal}/{CURRICULUM.length}</strong>
            <span>전체 수업 완료</span>
          </div>
        </header>

        <div className="track-tabs" role="tablist" aria-label="학습 과정 선택">
          {trackOrder.map((track) => (
            <Link
              key={track}
              href={`/learn?track=${track}`}
              onClick={() => chooseTrack(track)}
              className={selectedTrack === track ? "is-active" : ""}
            >
              {TRACKS[track].title}
            </Link>
          ))}
        </div>

        <section className={`track-intro track-${TRACKS[selectedTrack].accent}`}>
          <div>
            <small>{selectedTrack === "foundation" ? "필수 1단계" : "목적별 실전 과정"}</small>
            <h2>{TRACKS[selectedTrack].title}</h2>
            <p>{TRACKS[selectedTrack].description}</p>
          </div>
          <strong>{lessons.filter((item) => progress.completedLessonIds.includes(item.id)).length}/{lessons.length}</strong>
        </section>

        <div className="lesson-roadmap">
          {lessons.map((item, index) => {
            const completed = progress.completedLessonIds.includes(item.id);
            const previous = lessons[index - 1];
            const locked = Boolean(previous && !progress.completedLessonIds.includes(previous.id));
            return (
              <article key={item.id} className={completed ? "lesson-node is-completed" : "lesson-node"}>
                <div className="lesson-number">{completed ? "✓" : index + 1}</div>
                <div>
                  <small>{item.minutes}분 · {item.words.length}개 표현</small>
                  <h3>{item.title}</h3>
                  <p>{item.goal}</p>
                  {progress.quizScores[item.id] !== undefined && <b>최근 점수 {progress.quizScores[item.id]}점</b>}
                </div>
                <Link href={`/learn?lesson=${item.id}`} aria-label={`${item.title} 학습 시작`}>
                  {completed ? "다시 학습" : locked ? "미리 보기" : "시작"} →
                </Link>
              </article>
            );
          })}
        </div>

        <section className="legacy-library">
          <div>
            <small>기존 학습 자료도 그대로</small>
            <h2>원하는 내용만 더 연습하기</h2>
            <p>새 과정에서 배운 뒤 단어·문장·문법 자료실에서 부족한 부분을 반복할 수 있어요.</p>
          </div>
          <div>
            <Link href="/kana">가나</Link><Link href="/words">단어</Link><Link href="/sentences">문장</Link><Link href="/grammar">문법</Link>
          </div>
        </section>
      </section>
    );
  }

  const stages = ["표현", "문장 원리", "대화", "말하기", "확인 문제"];
  const answeredAll = activeLesson.quiz.every((_, index) => answers[index] !== undefined);
  const trackLessons = getTrackLessons(activeLesson.track);
  const lessonIndex = trackLessons.findIndex((item) => item.id === activeLesson.id);
  const nextLesson = trackLessons[lessonIndex + 1];

  return (
    <section className="lesson-player">
      <header className="lesson-player-header">
        <Link href={`/learn?track=${activeLesson.track}`}>← 과정으로</Link>
        <div>
          <small>{TRACKS[activeLesson.track].title} · {activeLesson.order}단계</small>
          <h1>{activeLesson.title}</h1>
        </div>
        <span>{activeLesson.minutes}분</span>
      </header>

      {stage < 5 && (
        <>
          <div className="lesson-stage-bar" aria-label="학습 진행률">
            {stages.map((label, index) => <span key={label} className={index <= stage ? "is-active" : ""}>{label}</span>)}
          </div>
          <div className="lesson-progress"><i style={{ width: `${((stage + 1) / stages.length) * 100}%` }} /></div>
        </>
      )}

      <main className="lesson-stage-card">
        {stage === 0 && (
          <div className="lesson-words-stage">
            <p className="stage-kicker">오늘의 핵심 표현</p><h2>{activeLesson.goal}</h2>
            <div className="word-focus-grid">
              {activeLesson.words.map((word) => (
                <article key={word.japanese}><strong>{word.japanese}</strong>{showReading && <span>{word.reading}</span>}<p>{word.meaning}</p></article>
              ))}
            </div>
            <button className="text-toggle" type="button" onClick={() => setShowReading((value) => !value)}>{showReading ? "읽는 법 숨기기" : "읽는 법 보기"}</button>
          </div>
        )}
        {stage === 1 && (
          <div className="pattern-stage">
            <p className="stage-kicker">오늘은 원리 하나만</p><h2>{activeLesson.pattern.label}</h2>
            <p className="pattern-explanation">{activeLesson.pattern.explanation}</p>
            <div className="pattern-example"><strong>{activeLesson.pattern.example}</strong><span>{activeLesson.pattern.meaning}</span></div>
          </div>
        )}
        {stage === 2 && (
          <div className="dialogue-stage">
            <p className="stage-kicker">상황 속에서 들어보기</p><h2>짧은 대화를 읽어 보세요</h2>
            <div className="dialogue-list">
              {activeLesson.dialogue.map((line, index) => (
                <article key={`${line.speaker}-${index}`} className={`speaker-${line.speaker.toLowerCase()}`}><b>{line.speaker}</b><div><strong>{line.japanese}</strong>{showReading && <small>{line.reading}</small>}<p>{line.meaning}</p></div></article>
              ))}
            </div>
          </div>
        )}
        {stage === 3 && (
          <div className="speaking-stage">
            <p className="stage-kicker">소리 내어 3번</p><h2>천천히 끊어 읽고, 자연스럽게 이어 보세요</h2>
            <div className="speak-prompt">{activeLesson.speak}</div>
            <p>완벽한 발음보다 입으로 직접 말하는 것이 먼저예요.</p>
          </div>
        )}
        {stage === 4 && (
          <div className="quiz-stage">
            <p className="stage-kicker">마지막 확인</p><h2>오늘 배운 내용을 확인해요</h2>
            {activeLesson.quiz.map((quiz, quizIndex) => (
              <article key={quiz.prompt} className="lesson-quiz">
                <h3>{quizIndex + 1}. {quiz.prompt}</h3>
                <div>{quiz.choices.map((choice, choiceIndex) => {
                  const selected = answers[quizIndex] === choiceIndex;
                  const answered = answers[quizIndex] !== undefined;
                  const correct = choiceIndex === quiz.answer;
                  return <button key={choice} type="button" className={answered && correct ? "is-correct" : selected ? "is-wrong" : ""} onClick={() => setAnswers((prev) => ({ ...prev, [quizIndex]: choiceIndex }))}>{choice}</button>;
                })}</div>
                {answers[quizIndex] !== undefined && <p className={answers[quizIndex] === quiz.answer ? "quiz-feedback correct" : "quiz-feedback"}>{answers[quizIndex] === quiz.answer ? "정답이에요. " : "다시 기억해 볼까요? "}{quiz.explanation}</p>}
              </article>
            ))}
          </div>
        )}
        {stage === 5 && (
          <div className="lesson-complete">
            <span>✓</span><p className="stage-kicker">오늘 학습 완료</p><h2>{activeLesson.goal}</h2>
            <strong>{progress.quizScores[activeLesson.id] ?? 0}점</strong>
            <p>틀린 문제는 이 수업을 다시 열면 언제든 복습할 수 있어요.</p>
            <div>{nextLesson ? <Link className="primary-start-button" href={`/learn?lesson=${nextLesson.id}`}>다음 수업: {nextLesson.title} →</Link> : <Link className="primary-start-button" href={`/learn?track=${activeLesson.track}`}>과정 완료 확인하기 →</Link>}<Link href="/review">기존 복습 항목 보기</Link></div>
            {activeLesson.practice && <Link className="lesson-extra-practice" href={activeLesson.practice.href}>추가 연습: {activeLesson.practice.label} →</Link>}
          </div>
        )}
      </main>

      {stage < 5 && (
        <footer className="lesson-player-actions">
          <button type="button" disabled={stage === 0} onClick={() => setStage((value) => Math.max(0, value - 1))}>이전</button>
          {stage < 4 ? <button type="button" className="primary" onClick={() => setStage((value) => value + 1)}>다음</button> : <button type="button" className="primary" disabled={!answeredAll} onClick={finishLesson}>학습 완료</button>}
        </footer>
      )}
    </section>
  );
}

export default function LearnPage() {
  return <Suspense fallback={<div className="learn-loading">과정을 준비하는 중이에요.</div>}><CurriculumContent /></Suspense>;
}
