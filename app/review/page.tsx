"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GRAMMAR_PROGRESS_KEY, type GrammarProgressItem } from "@/data/grammar";

type Word = {
  word: string;
  meaning: string;
  example: string;
  category: "일상" | "여행" | "업무" | "친구";
  partOfSpeech?: string;
};

const partOfSpeechLabels: Record<string, string> = {
  noun: "명사",
  verb: "동사",
  "i-adjective": "い형용사",
  "na-adjective": "な형용사",
  adverb: "부사",
  expression: "표현",
  particle: "조사",
  other: "기타",
};

function normalizePartOfSpeech(partOfSpeech?: string): string {
  if (!partOfSpeech) return "other";
  return partOfSpeech.replace(/_/g, "-");
}

type Sentence = {
  japanese: string;
  meaning: string;
  category: "일상" | "여행" | "업무" | "친구";
  note: string;
  pattern?: string;
};
const sentencePatternLabels: Record<string, string> = {
  desu: "です 문장",
  masu: "ます 문장",
  "particle-wa": "は 패턴",
  "particle-wo": "を 패턴",
  "particle-ni": "に 패턴",
  "particle-de": "で 패턴",
  question: "질문 표현",
  travel: "여행 표현",
  work: "업무 표현",
  daily: "일상 표현",
  request: "요청 표현",
  shopping: "쇼핑 표현",
  direction: "길찾기 표현",
  other: "기타",
};

const WORDS_KEY = "savedWords";
const SENTENCES_KEY = "savedSentences";

export default function ReviewPage() {
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [savedSentences, setSavedSentences] = useState<Sentence[]>([]);
  const [grammarReviewItems, setGrammarReviewItems] = useState<GrammarProgressItem[]>([]);

  // 초기 로드: localStorage에서 저장된 단어/문장 불러오기
  useEffect(() => {
    try {
      const rawWords = localStorage.getItem(WORDS_KEY);
      if (rawWords) {
        setSavedWords(JSON.parse(rawWords) as Word[]);
      }
    } catch {
      // 무시 (잘못된 JSON 등)
    }

    try {
      const rawSentences = localStorage.getItem(SENTENCES_KEY);
      if (rawSentences) {
        setSavedSentences(JSON.parse(rawSentences) as Sentence[]);
      }
    } catch {
      // 무시 (잘못된 JSON 등)
    }

    try {
      const rawGrammar = localStorage.getItem(GRAMMAR_PROGRESS_KEY);
      if (!rawGrammar) return;
      const parsed = JSON.parse(rawGrammar);
      if (!Array.isArray(parsed)) return;
      const items = (parsed as GrammarProgressItem[]).filter((item) => item.wrongCount > 0 || item.lastResult === "wrong");
      setGrammarReviewItems(items);
    } catch {
      setGrammarReviewItems([]);
    }
  }, []);

  // 단어 삭제
  const handleDeleteWord = (w: Word) => {
    const next = savedWords.filter((x) => x.word !== w.word);
    setSavedWords(next);
    localStorage.setItem(WORDS_KEY, JSON.stringify(next));
  };

  // 문장 삭제
  const handleDeleteSentence = (s: Sentence) => {
    const next = savedSentences.filter((x) => x.japanese !== s.japanese);
    setSavedSentences(next);
    localStorage.setItem(SENTENCES_KEY, JSON.stringify(next));
  };

  return (
    <section>
      <div className="page-header">
        <h1>복습</h1>
        <p className="muted" style={{ margin: 0 }}>
          저장한 단어와 문장을 다시 확인해 보세요.
        </p>
      </div>

      {/* 저장한 단어 섹션 */}
      <div className="section-title">
        <h2>저장한 단어</h2>
        <span className="count">{savedWords.length}개</span>
      </div>

      {savedWords.length === 0 ? (
        <div className="empty-state">
          아직 저장된 단어가 없습니다.
          <br />
          <span style={{ fontSize: "13px" }}>
            &apos;단어 학습&apos;에서 마음에 드는 단어를 저장해 보세요.
          </span>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {savedWords.map((w) => (
            <li
              key={w.word}
              className="card"
              style={{ marginBottom: "14px" }}
            >
              <div className="card-top">
                <div className="jp-text">{w.word}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <span className="badge">{w.category}</span>
                  {partOfSpeechLabels[normalizePartOfSpeech(w.partOfSpeech)] && (
                    <span className="badge">{partOfSpeechLabels[normalizePartOfSpeech(w.partOfSpeech)]}</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "12px" }}>
                <div className="label">뜻</div>
                <div>{w.meaning}</div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <div className="label">예문</div>
                <div style={{ color: "#555" }}>{w.example}</div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleDeleteWord(w)}
                  className="btn btn-danger"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 저장한 문장 섹션 */}
      <div className="section-title">
        <h2>저장한 문장</h2>
        <span className="count">{savedSentences.length}개</span>
      </div>

      {savedSentences.length === 0 ? (
        <div className="empty-state">
          아직 저장된 문장이 없습니다.
          <br />
          <span style={{ fontSize: "13px" }}>
            &apos;문장 학습&apos;에서 유용한 표현을 저장해 보세요.
          </span>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {savedSentences.map((s) => (
            <li
              key={s.japanese}
              className="card"
              style={{ marginBottom: "14px" }}
            >
              <div className="card-top">
                <div className="jp-text">{s.japanese}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <span className="badge">{s.category}</span>
                  {s.pattern && <span className="badge">{sentencePatternLabels[s.pattern] ?? "기타"}</span>}
                </div>
              </div>

              <div style={{ marginTop: "12px" }}>
                <div className="label">뜻</div>
                <div>{s.meaning}</div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <div className="label">설명</div>
                <div style={{ color: "#555" }}>{s.note}</div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleDeleteSentence(s)}
                  className="btn btn-danger"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="section-title">
        <h2>문법 복습</h2>
        <span className="count">{grammarReviewItems.length}개</span>
      </div>
      {grammarReviewItems.length === 0 ? (
        <div className="empty-state">복습할 문법이 없습니다. 문법 기초를 풀어 보세요.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {grammarReviewItems.map((item) => (
            <li key={item.lessonId} className="card" style={{ marginBottom: "14px" }}>
              <div className="card-top">
                <div className="jp-text">{item.title}</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <span className="badge">{item.category}</span>
                  <span className="badge">{item.pattern}</span>
                </div>
              </div>
              <div style={{ marginTop: "10px", fontSize: "14px" }}>
                오답 {item.wrongCount}회 · 최근 결과: {item.lastResult === "correct" ? "정답" : "오답"}
              </div>
              <div className="card-actions">
                <Link href={`/grammar?lesson=${item.lessonId}`} className="btn">문법 다시 학습</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
