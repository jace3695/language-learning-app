"use client";

import { useEffect, useState } from "react";

type Sentence = {
  japanese: string;
  meaning: string;
  category: "일상" | "여행" | "업무" | "친구";
  note: string;
};

const SENTENCES: Sentence[] = [
  {
    japanese: "これはいくらですか？",
    meaning: "이거 얼마예요?",
    category: "여행",
    note: "가게에서 가격을 물어볼 때",
  },
  {
    japanese: "もう一度お願いします",
    meaning: "다시 한 번 부탁드립니다",
    category: "일상",
    note: "못 들었을 때 다시 요청할 때",
  },
  {
    japanese: "ご確認お願いします",
    meaning: "확인 부탁드립니다",
    category: "업무",
    note: "메일이나 업무 대화에서 자주 쓰는 표현",
  },
  {
    japanese: "今何してる？",
    meaning: "지금 뭐 하고 있어?",
    category: "친구",
    note: "친구에게 가볍게 물어볼 때",
  },
];

const STORAGE_KEY = "savedSentences";

export default function SentencesPage() {
  const [savedSentences, setSavedSentences] = useState<Sentence[]>([]);

  // 초기 로드: localStorage에서 저장된 문장 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedSentences(JSON.parse(raw) as Sentence[]);
      }
    } catch {
      // 무시 (최초 로드 시 잘못된 JSON 등)
    }
  }, []);

  const isSaved = (s: Sentence) =>
    savedSentences.some((x) => x.japanese === s.japanese);

  const handleSave = (s: Sentence) => {
    if (isSaved(s)) return; // 중복 저장 방지
    const next = [...savedSentences, s];
    setSavedSentences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <section>
      <div className="page-header">
        <h1>문장 학습</h1>
        <p className="muted" style={{ margin: 0 }}>
          문장을 확인하고 저장해 보세요.{" "}
          <span style={{ color: "#222" }}>
            저장 {savedSentences.length}개
          </span>
        </p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {SENTENCES.map((s) => {
          const saved = isSaved(s);
          return (
            <li
              key={s.japanese}
              className="card"
              style={{ marginBottom: "14px" }}
            >
              <div className="card-top">
                <div className="jp-text">{s.japanese}</div>
                <span className="badge">{s.category}</span>
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
                  onClick={() => handleSave(s)}
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
