"use client";

import { useEffect, useState, useCallback } from "react";

type Word = {
  word: string;
  meaning: string;
  example: string;
  category: "일상" | "여행" | "업무" | "친구";
};

const WORDS: Word[] = [
  // ===== 여행 =====
  { word: "入口", meaning: "입구", example: "入口はどこですか？", category: "여행" },
  { word: "出口", meaning: "출구", example: "出口はこちらです", category: "여행" },
  { word: "会計", meaning: "계산", example: "会計お願いします", category: "여행" },
  { word: "予約", meaning: "예약", example: "予約しています", category: "여행" },
  { word: "注文", meaning: "주문", example: "注文いいですか？", category: "여행" },
  { word: "おすすめ", meaning: "추천", example: "おすすめは何ですか？", category: "여행" },
  { word: "水", meaning: "물", example: "水をください", category: "여행" },
  { word: "お茶", meaning: "차", example: "お茶お願いします", category: "여행" },
  { word: "トイレ", meaning: "화장실", example: "トイレはどこですか？", category: "여행" },
  { word: "駅", meaning: "역", example: "駅に行きます", category: "여행" },
  { word: "電車", meaning: "전철", example: "電車に乗ります", category: "여행" },
  { word: "バス", meaning: "버스", example: "バスで行きます", category: "여행" },
  { word: "ホテル", meaning: "호텔", example: "ホテルに泊まります", category: "여행" },
  { word: "地図", meaning: "지도", example: "地図を見せてください", category: "여행" },
  { word: "道", meaning: "길", example: "道を教えてください", category: "여행" },
  { word: "右", meaning: "오른쪽", example: "右に曲がってください", category: "여행" },
  { word: "左", meaning: "왼쪽", example: "左に行ってください", category: "여행" },
  { word: "まっすぐ", meaning: "직진", example: "まっすぐ行ってください", category: "여행" },
  { word: "遠い", meaning: "멀다", example: "ここは遠いです", category: "여행" },
  { word: "近い", meaning: "가깝다", example: "駅は近いです", category: "여행" },

  // ===== 업무 =====
  { word: "納期", meaning: "납기", example: "納期はいつですか？", category: "업무" },
  { word: "見積", meaning: "견적", example: "見積をお願いします", category: "업무" },
  { word: "仕様", meaning: "사양", example: "仕様を確認してください", category: "업무" },
  { word: "確認", meaning: "확인", example: "確認お願いします", category: "업무" },
  { word: "依頼", meaning: "의뢰", example: "依頼があります", category: "업무" },
  { word: "資料", meaning: "자료", example: "資料を送ります", category: "업무" },
  { word: "送付", meaning: "송부", example: "メールで送付します", category: "업무" },
  { word: "連絡", meaning: "연락", example: "後で連絡します", category: "업무" },
  { word: "対応", meaning: "대응", example: "対応します", category: "업무" },
  { word: "変更", meaning: "변경", example: "内容を変更します", category: "업무" },
  { word: "追加", meaning: "추가", example: "項目を追加します", category: "업무" },
  { word: "削除", meaning: "삭제", example: "データを削除します", category: "업무" },
  { word: "問題", meaning: "문제", example: "問題があります", category: "업무" },
  { word: "原因", meaning: "원인", example: "原因を確認します", category: "업무" },
  { word: "結果", meaning: "결과", example: "結果を報告します", category: "업무" },
  { word: "進捗", meaning: "진행상황", example: "進捗はどうですか？", category: "업무" },
  { word: "会議", meaning: "회의", example: "会議があります", category: "업무" },
  { word: "担当", meaning: "담당", example: "担当者は誰ですか？", category: "업무" },
  { word: "報告", meaning: "보고", example: "報告します", category: "업무" },
  { word: "相談", meaning: "상담", example: "相談したいです", category: "업무" },

  // ===== 일상 =====
  { word: "今日", meaning: "오늘", example: "今日は忙しいです", category: "일상" },
  { word: "明日", meaning: "내일", example: "明日会いましょう", category: "일상" },
  { word: "昨日", meaning: "어제", example: "昨日は楽しかったです", category: "일상" },
  { word: "今", meaning: "지금", example: "今何してる？", category: "일상" },
  { word: "後で", meaning: "나중에", example: "後で行きます", category: "일상" },
  { word: "一緒に", meaning: "함께", example: "一緒に行こう", category: "일상" },
  { word: "友達", meaning: "친구", example: "友達と遊ぶ", category: "일상" },
  { word: "家族", meaning: "가족", example: "家族と住んでいます", category: "일상" },
  { word: "仕事", meaning: "일", example: "仕事が忙しい", category: "일상" },
  { word: "休み", meaning: "휴식", example: "今日は休みです", category: "일상" },
  { word: "趣味", meaning: "취미", example: "趣味は何ですか？", category: "일상" },
  { word: "映画", meaning: "영화", example: "映画を見ます", category: "일상" },
  { word: "音楽", meaning: "음악", example: "音楽を聞く", category: "일상" },
  { word: "ご飯", meaning: "밥", example: "ご飯食べた？", category: "일상" },
  { word: "美味しい", meaning: "맛있다", example: "これ美味しい！", category: "일상" },
  { word: "楽しい", meaning: "재밌다", example: "楽しかった", category: "일상" },
  { word: "疲れた", meaning: "피곤하다", example: "ちょっと疲れた", category: "일상" },
  { word: "眠い", meaning: "졸리다", example: "眠いです", category: "일상" },
  { word: "忙しい", meaning: "바쁘다", example: "今忙しい", category: "일상" },
  { word: "暇", meaning: "한가하다", example: "暇だよ", category: "일상" },
];

const STORAGE_KEY = "savedWords";
const WRONG_WORDS_KEY = "wrongWords";
type CategoryFilter = "전체" | "여행" | "업무" | "일상";
type QuizType = "jp-to-kr" | "kr-to-jp";
type PageMode = "study" | "quiz";

type WrongWord = {
  word: string;
  meaning: string;
  example: string;
  category: string;
  quizType: QuizType;
  createdAt: string;
};

function saveWrongWord(w: Word, quizType: QuizType) {
  try {
    const raw = localStorage.getItem(WRONG_WORDS_KEY);
    const prev: WrongWord[] = raw ? JSON.parse(raw) : [];
    const alreadyExists = prev.some(
      (item) => item.word === w.word && item.quizType === quizType
    );
    if (alreadyExists) return;
    const next: WrongWord[] = [
      ...prev,
      {
        word: w.word,
        meaning: w.meaning,
        example: w.example,
        category: w.category,
        quizType,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(next));
  } catch {}
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getChoices(correct: Word, pool: Word[], quizType: QuizType): string[] {
  const others = pool.filter((w) => w.word !== correct.word);
  const shuffled = shuffle(others).slice(0, 3);
  const all = shuffle([...shuffled, correct]);
  return quizType === "jp-to-kr"
    ? all.map((w) => w.meaning)
    : all.map((w) => w.word);
}

export default function WordsPage() {
  const [savedWords, setSavedWords] = useState<Word[]>([]);
  const [mode, setMode] = useState<PageMode>("study");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("전체");

  // 퀴즈 상태
  const [quizType, setQuizType] = useState<QuizType>("jp-to-kr");
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedWords(JSON.parse(raw) as Word[]);
    } catch {}
  }, []);

  const isSaved = (w: Word) => savedWords.some((s) => s.word === w.word);

  const handleSave = (w: Word) => {
    if (isSaved(w)) return;
    const next = [...savedWords, w];
    setSavedWords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const filteredWords =
    categoryFilter === "전체"
      ? WORDS
      : WORDS.filter((w) => w.category === categoryFilter);

  const generateQuiz = useCallback(
    (pool: Word[], type: QuizType) => {
      if (pool.length < 4) return;
      const word = pool[Math.floor(Math.random() * pool.length)];
      setCurrentWord(word);
      setChoices(getChoices(word, pool, type));
      setSelected(null);
    },
    []
  );

  useEffect(() => {
    if (mode === "quiz") {
      generateQuiz(filteredWords, quizType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, categoryFilter, quizType]);

  const handleAnswer = (choice: string) => {
    if (selected !== null || !currentWord) return;
    setSelected(choice);
    const correctAnswer =
      quizType === "jp-to-kr" ? currentWord.meaning : currentWord.word;
    const isCorrect = choice === correctAnswer;
    if (!isCorrect) {
      saveWrongWord(currentWord, quizType);
    }
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
  };

  const handleNext = () => {
    generateQuiz(filteredWords, quizType);
  };

  const correctAnswer = currentWord
    ? quizType === "jp-to-kr"
      ? currentWord.meaning
      : currentWord.word
    : "";

  const CATEGORIES: CategoryFilter[] = ["전체", "여행", "업무", "일상"];

  return (
    <section>
      <div className="page-header">
        <h1>단어 학습</h1>
        <p className="muted" style={{ margin: 0 }}>
          단어를 확인하고 저장해 보세요.{" "}
          <span style={{ color: "#222" }}>저장 {savedWords.length}개</span>
        </p>
      </div>

      {/* 모드 전환 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          className="btn"
          onClick={() => setMode("study")}
          style={{
            flex: 1,
            background: mode === "study" ? "#222" : "transparent",
            color: mode === "study" ? "#fff" : "#222",
            border: "1.5px solid #222",
            fontWeight: 600,
          }}
        >
          학습 모드
        </button>
        <button
          className="btn"
          onClick={() => {
            setMode("quiz");
            setScore({ correct: 0, total: 0 });
          }}
          style={{
            flex: 1,
            background: mode === "quiz" ? "#222" : "transparent",
            color: mode === "quiz" ? "#fff" : "#222",
            border: "1.5px solid #222",
            fontWeight: 600,
          }}
        >
          퀴즈 모드
        </button>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="btn"
            onClick={() => {
              setCategoryFilter(cat);
              if (mode === "quiz") setScore({ correct: 0, total: 0 });
            }}
            style={{
              background: categoryFilter === cat ? "#555" : "transparent",
              color: categoryFilter === cat ? "#fff" : "#555",
              border: "1.5px solid #ccc",
              fontSize: "13px",
              padding: "6px 14px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ===== 학습 모드 ===== */}
      {mode === "study" && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredWords.map((w) => {
            const saved = isSaved(w);
            return (
              <li key={w.word} className="card" style={{ marginBottom: "14px" }}>
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
      )}

      {/* ===== 퀴즈 모드 ===== */}
      {mode === "quiz" && (
        <div>
          {filteredWords.length < 4 ? (
            <div
              className="card"
              style={{ textAlign: "center", color: "#888", padding: "40px 20px" }}
            >
              퀴즈를 위해 해당 카테고리에 단어가 4개 이상 필요합니다.
            </div>
          ) : (
            <>
              {/* 점수 & 퀴즈 타입 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#555" }}>
                  점수:{" "}
                  <strong style={{ color: "#222" }}>
                    {score.correct} / {score.total}
                  </strong>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuizType("jp-to-kr");
                      setScore({ correct: 0, total: 0 });
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: quizType === "jp-to-kr" ? "#222" : "transparent",
                      color: quizType === "jp-to-kr" ? "#fff" : "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    일→뜻
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setQuizType("kr-to-jp");
                      setScore({ correct: 0, total: 0 });
                    }}
                    style={{
                      fontSize: "12px",
                      padding: "5px 10px",
                      background: quizType === "kr-to-jp" ? "#222" : "transparent",
                      color: quizType === "kr-to-jp" ? "#fff" : "#222",
                      border: "1.5px solid #222",
                    }}
                  >
                    뜻→일
                  </button>
                </div>
              </div>

              {/* 문제 카드 */}
              {currentWord && (
                <div className="card" style={{ marginBottom: "20px" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <span className="badge">{currentWord.category}</span>
                  </div>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: 700,
                      textAlign: "center",
                      padding: "24px 0 8px",
                      letterSpacing: "2px",
                    }}
                  >
                    {quizType === "jp-to-kr" ? currentWord.word : currentWord.meaning}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "13px",
                      color: "#aaa",
                      marginBottom: "8px",
                    }}
                  >
                    {quizType === "jp-to-kr" ? "이 단어의 뜻은?" : "이 뜻의 일본어는?"}
                  </div>

                  {/* 보기 */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    {choices.map((choice) => {
                      const isCorrect = choice === correctAnswer;
                      const isSelected = choice === selected;
                      let bg = "transparent";
                      let color = "#222";
                      let border = "1.5px solid #ddd";

                      if (selected !== null) {
                        if (isCorrect) {
                          bg = "#e6f4ea";
                          color = "#1a7f37";
                          border = "1.5px solid #1a7f37";
                        } else if (isSelected) {
                          bg = "#fdecea";
                          color = "#c0392b";
                          border = "1.5px solid #c0392b";
                        }
                      }

                      return (
                        <button
                          key={choice}
                          onClick={() => handleAnswer(choice)}
                          style={{
                            background: bg,
                            color,
                            border,
                            borderRadius: "10px",
                            padding: "14px 10px",
                            fontSize: "16px",
                            fontWeight: 600,
                            cursor: selected !== null ? "default" : "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>

                  {/* 피드백 */}
                  {selected !== null && (
                    <div
                      style={{
                        marginTop: "18px",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: "18px",
                        color: selected === correctAnswer ? "#1a7f37" : "#c0392b",
                      }}
                    >
                      {selected === correctAnswer ? "정답! 🎉" : `오답 — 정답: ${correctAnswer}`}
                    </div>
                  )}

                  {/* 다음 문제 버튼 */}
                  {selected !== null && (
                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                      <button
                        className="btn"
                        onClick={handleNext}
                        style={{
                          background: "#222",
                          color: "#fff",
                          padding: "10px 32px",
                          fontWeight: 600,
                          fontSize: "15px",
                        }}
                      >
                        다음 문제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
