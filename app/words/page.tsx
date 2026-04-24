"use client";

import { useEffect, useState } from "react";

type Word = {
  word: string;
  meaning: string;
  example: string;
  category: "일상" | "여행" | "업무" | "친구";
};

const WORDS: Word[] = [
  {
    word: "こんにちは",
    meaning: "안녕하세요",
    example: "今日はいい天気ですね",
    category: "일상",
  },
  {
    word: "ありがとうございます",
    meaning: "감사합니다",
    example: "本当にありがとうございます",
    category: "일상",
  },
  {
    word: "いくらですか",
    meaning: "얼마인가요",
    example: "これはいくらですか",
    category: "여행",
  },
  {
    word: "お疲れ様です",
    meaning: "수고하셨습니다",
    example: "今日もお疲れ様です",
    category: "업무",
  },
  {
    word: "久しぶり",
    meaning: "오랜만이야",
    example: "久しぶり、元気だった？",
    category: "친구",
  },
];

const STORAGE_KEY = "savedWords";

export default function WordsPage() {
  const [savedWords, setSavedWords] = useState<Word[]>([]);

  // 초기 로드: localStorage에서 저장된 단어 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedWords(JSON.parse(raw) as Word[]);
      }
    } catch {
      // 무시 (최초 로드 시 잘못된 JSON 등)
    }
  }, []);

  const isSaved = (w: Word) =>
    savedWords.some((s) => s.word === w.word);

  const handleSave = (w: Word) => {
    if (isSaved(w)) return; // 중복 저장 방지
    const next = [...savedWords, w];
    setSavedWords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <section>
      <div className="page-header">
        <h1>단어 학습</h1>
        <p className="muted" style={{ margin: 0 }}>
          단어를 확인하고 저장해 보세요.{" "}
          <span style={{ color: "#222" }}>
            저장 {savedWords.length}개
          </span>
        </p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {WORDS.map((w) => {
          const saved = isSaved(w);
          return (
            <li
              key={w.word}
              className="card"
              style={{ marginBottom: "14px" }}
            >
              <div className="card-top">
                <div className="jp-text">{w.word}</div>
                <span className="badge">{w.category}</span>
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
                  onClick={() => handleSave(w)}
                  disabled={saved}
                  className="btn"
                >
                  {saved ? "저장됨" : "저장"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
