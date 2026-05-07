"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GRAMMAR_PROGRESS_KEY, type GrammarProgressItem } from "@/data/grammar";

type Word = {
  word: string;
  meaning: string;
  example: string;
  category: "일상" | "여행" | "업무" | "친구";
  partOfSpeech?: string;
  sentenceKeyword?: string;
};

type Sentence = {
  japanese: string;
  meaning: string;
  category: "일상" | "여행" | "업무" | "친구";
  note: string;
  pattern?: string;
};

type ReviewTab = "all" | "words" | "sentences" | "grammar" | "kana";
type WrongItem = string | Record<string, unknown>;

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
const WRONG_KANA_KEY = "wrongKana";
const WRONG_KANA_CHARS_KEY = "wrongKanaChars";
const WRONG_WORDS_KEY = "wrongWords";
const WRONG_SENTENCES_KEY = "wrongSentences";

function normalizePartOfSpeech(partOfSpeech?: string): string {
  if (!partOfSpeech) return "other";
  return partOfSpeech.replace(/_/g, "-");
}

function loadArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function renderWrongItem(item: WrongItem): string {
  if (typeof item === "string") return item;
  const word = typeof item.word === "string" ? item.word : "";
  const jp = typeof item.japanese === "string" ? item.japanese : "";
  const meaning = typeof item.meaning === "string" ? item.meaning : "";
  const main = word || jp || "복습 항목";
  return meaning ? `${main} (${meaning})` : main;
}

export default function ReviewPage() {
  const [activeReviewTab, setActiveReviewTab] = useState<ReviewTab>("all");
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [savedSentences, setSavedSentences] = useState<Sentence[]>([]);
  const [grammarReviewItems, setGrammarReviewItems] = useState<GrammarProgressItem[]>([]);
  const [wrongKana, setWrongKana] = useState<WrongItem[]>([]);
  const [wrongKanaChars, setWrongKanaChars] = useState<string[]>([]);
  const [wrongWords, setWrongWords] = useState<WrongItem[]>([]);
  const [wrongSentences, setWrongSentences] = useState<WrongItem[]>([]);

  useEffect(() => {
    const words = loadArray<Word>(WORDS_KEY);
    const sentences = loadArray<Sentence>(SENTENCES_KEY);
    const grammar = loadArray<GrammarProgressItem>(GRAMMAR_PROGRESS_KEY).filter(
      (item) => item && (item.wrongCount > 0 || item.lastResult === "wrong"),
    );
    const kana = loadArray<WrongItem>(WRONG_KANA_KEY);
    const charsRaw = loadArray<unknown>(WRONG_KANA_CHARS_KEY);
    const chars = charsRaw.filter((item): item is string => typeof item === "string");
    const wWords = loadArray<WrongItem>(WRONG_WORDS_KEY);
    const wSentences = loadArray<WrongItem>(WRONG_SENTENCES_KEY);

    setSavedWords(words);
    setSavedSentences(sentences);
    setGrammarReviewItems(grammar);
    setWrongKana(kana);
    setWrongKanaChars(chars);
    setWrongWords(wWords);
    setWrongSentences(wSentences);
  }, []);

  const kanaReviewCount = useMemo(() => {
    const charsFromWrongKana = wrongKana
      .map((item) => (typeof item === "string" ? item : typeof item.char === "string" ? item.char : ""))
      .filter(Boolean);
    return new Set([...charsFromWrongKana, ...wrongKanaChars]).size;
  }, [wrongKana, wrongKanaChars]);

  const handleDeleteWord = (w: Word) => {
    const next = savedWords.filter((x) => x.word !== w.word);
    setSavedWords(next);
    localStorage.setItem(WORDS_KEY, JSON.stringify(next));
  };

  const handleDeleteSentence = (s: Sentence) => {
    const next = savedSentences.filter((x) => x.japanese !== s.japanese);
    setSavedSentences(next);
    localStorage.setItem(SENTENCES_KEY, JSON.stringify(next));
  };

  const showWords = activeReviewTab === "all" || activeReviewTab === "words";
  const showSentences = activeReviewTab === "all" || activeReviewTab === "sentences";
  const showGrammar = activeReviewTab === "all" || activeReviewTab === "grammar";
  const showKana = activeReviewTab === "all" || activeReviewTab === "kana";


  return (
    <section>
      <div className="page-header">
        <h1>복습</h1>
        <p className="muted" style={{ margin: 0 }}>저장한 단어와 문장을 다시 확인해 보세요.</p>
      </div>

      <div className="card" style={{ marginBottom: "14px" }}>
        <div className="label" style={{ marginBottom: "8px" }}>복습 요약</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span className="badge">단어 {savedWords.length}개</span>
          <span className="badge">문장 {savedSentences.length}개</span>
          <span className="badge">문법 {grammarReviewItems.length}개</span>
          <span className="badge">가나 {kanaReviewCount}개</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        {[
          { key: "all", label: "전체" },
          { key: "words", label: "단어" },
          { key: "sentences", label: "문장" },
          { key: "grammar", label: "문법" },
          { key: "kana", label: "가나" },
        ].map((tab) => {
          const selected = activeReviewTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveReviewTab(tab.key as ReviewTab)}
              className="btn"
              style={{
                borderColor: selected ? "#2563eb" : "#d1d5db",
                background: selected ? "#2563eb" : "#fff",
                color: selected ? "#fff" : "#111827",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {showWords && (
        <>
          <div className="section-title"><h2>저장한 단어</h2><span className="count">{savedWords.length}개</span></div>
          {savedWords.length === 0 ? <div className="empty-state">저장한 단어가 없습니다. <Link href="/words">[단어]</Link>에서 단어를 저장해 보세요.</div> : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {savedWords.map((w) => (
                <li key={w.word} className="card" style={{ marginBottom: "14px", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  <div className="card-top"><div className="jp-text">{w.word}</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}><span className="badge">{w.category}</span>{partOfSpeechLabels[normalizePartOfSpeech(w.partOfSpeech)] && <span className="badge">{partOfSpeechLabels[normalizePartOfSpeech(w.partOfSpeech)]}</span>}</div></div>
                  <div style={{ marginTop: "12px" }}><div className="label">뜻</div><div>{w.meaning}</div></div>
                  <div style={{ marginTop: "10px" }}><div className="label">예문</div><div style={{ color: "#555" }}>{w.example}</div></div>
                  <div className="card-actions" style={{ justifyContent: "flex-end", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Link href={`/sentences?word=${encodeURIComponent(w.sentenceKeyword || w.word)}`} className="btn">관련 문장 보기</Link>
                    <button onClick={() => handleDeleteWord(w)} className="btn btn-danger">삭제</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="section-title"><h2>틀린 단어</h2><span className="count">{wrongWords.length}개</span></div>
          {wrongWords.length === 0 ? <div className="empty-state">틀린 단어가 없습니다.</div> : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {wrongWords.map((item, idx) => <li key={`ww-${idx}`} className="card" style={{ marginBottom: "10px", overflowWrap: "anywhere" }}>{renderWrongItem(item)}</li>)}
            </ul>
          )}
        </>
      )}

      {showSentences && (
        <>
          <div className="section-title"><h2>저장한 문장</h2><span className="count">{savedSentences.length}개</span></div>
          {savedSentences.length === 0 ? <div className="empty-state">저장한 문장이 없습니다. <Link href="/sentences">[문장]</Link>에서 문장을 저장해 보세요.</div> : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {savedSentences.map((s) => (
                <li key={s.japanese} className="card" style={{ marginBottom: "14px", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  <div className="card-top"><div className="jp-text">{s.japanese}</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}><span className="badge">{s.category}</span>{s.pattern && <span className="badge">{sentencePatternLabels[s.pattern] ?? "기타"}</span>}</div></div>
                  <div style={{ marginTop: "12px" }}><div className="label">뜻</div><div>{s.meaning}</div></div>
                  <div style={{ marginTop: "10px" }}><div className="label">설명</div><div style={{ color: "#555" }}>{s.note}</div></div>
                  <div className="card-actions" style={{ justifyContent: "flex-end", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Link href="/sentences" className="btn">문장 다시 학습</Link>
                    <button onClick={() => handleDeleteSentence(s)} className="btn btn-danger">삭제</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="section-title"><h2>틀린 문장</h2><span className="count">{wrongSentences.length}개</span></div>
          {wrongSentences.length === 0 ? <div className="empty-state">틀린 문장이 없습니다.</div> : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {wrongSentences.map((item, idx) => <li key={`ws-${idx}`} className="card" style={{ marginBottom: "10px", overflowWrap: "anywhere" }}>{renderWrongItem(item)}</li>)}
            </ul>
          )}
        </>
      )}

      {showGrammar && (
        <>
          <div className="section-title"><h2>문법 복습</h2><span className="count">{grammarReviewItems.length}개</span></div>
          {grammarReviewItems.length === 0 ? <div className="empty-state">복습할 문법이 없습니다. <Link href="/grammar">[문법]</Link>에서 연습 문제를 풀어 보세요.</div> : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {grammarReviewItems.map((item) => (
                <li key={item.lessonId} className="card" style={{ marginBottom: "14px", overflowWrap: "anywhere" }}>
                  <div className="card-top"><div className="jp-text">{item.title}</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}><span className="badge">{item.category}</span><span className="badge">{item.pattern}</span></div></div>
                  <div style={{ marginTop: "10px", fontSize: "14px" }}>오답 {item.wrongCount}회 · 최근 결과: {item.lastResult === "correct" ? "정답" : "오답"}</div>
                  <div className="card-actions" style={{ justifyContent: "flex-end", display: "flex", gap: "8px", flexWrap: "wrap" }}><Link href={`/grammar?lesson=${item.lessonId}`} className="btn">문법 다시 학습</Link></div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {showKana && (
        <>
          <div className="section-title"><h2>가나 복습</h2><span className="count">{wrongKana.length}개</span></div>
          {wrongKana.length === 0 ? <div className="empty-state">가나 오답이 없습니다. <Link href="/kana">[가나]</Link>에서 퀴즈를 풀어 보세요.</div> : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {wrongKana.map((item, idx) => <li key={`wk-${idx}`} className="card" style={{ marginBottom: "10px", overflowWrap: "anywhere" }}>{renderWrongItem(item)}</li>)}
            </ul>
          )}

          <div className="section-title"><h2>헷갈린 글자</h2><span className="count">{wrongKanaChars.length}개</span></div>
          {wrongKanaChars.length === 0 ? <div className="empty-state">헷갈린 글자가 없습니다.</div> : (
            <div className="card" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>{wrongKanaChars.map((char, idx) => <span key={`kc-${char}-${idx}`} className="badge" style={{ fontSize: "18px" }}>{char}</span>)}</div>
          )}

          <div className="card-actions" style={{ justifyContent: "flex-end", marginBottom: "18px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link href="/kana" className="btn">Kana 다시 학습</Link>
          </div>
        </>
      )}

    </section>
  );
}
