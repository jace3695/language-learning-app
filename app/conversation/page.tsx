"use client";

import { useEffect, useState } from "react";

type Situation = "카페" | "여행" | "일상" | "업무" | "친구";

type ChatMessage =
  | {
      role: "user";
      text: string;
    }
  | {
      role: "assistant";
      reply: string;
      replyReading: string;
      replyKoreanPronunciation: string;
      correction: string;
      correctionReading: string;
      correctionKoreanPronunciation: string;
      explanation: string;
      originalUserText: string; // 어떤 입력에 대한 교정인지 비교용
    };

const SITUATIONS: Situation[] = ["카페", "여행", "일상", "업무", "친구"];
const APP_SETTINGS_KEY = "japaneseAppSettings";

type AppSettings = {
  ttsRate: number;
  repeatCount: number;
  showKoreanPronunciation: boolean;
  showReading: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  ttsRate: 1,
  repeatCount: 1,
  showKoreanPronunciation: true,
  showReading: true,
};

async function speakJapaneseFallback(text: string, settings: AppSettings) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  for (let i = 0; i < settings.repeatCount; i += 1) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    utter.rate = settings.ttsRate;
    await new Promise<void>((resolve) => {
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });
  }
}

async function speakJapanese(text: string, settings: AppSettings) {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("TTS API error");
    const { audioContent } = await res.json();
    if (!audioContent) throw new Error("No audioContent");

    for (let i = 0; i < settings.repeatCount; i += 1) {
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      audio.playbackRate = settings.ttsRate;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        audio.play().catch(reject);
      });
    }
  } catch {
    await speakJapaneseFallback(text, settings);
  }
}

export default function ConversationPage() {
  const [situation, setSituation] = useState<Situation>("일상");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_SETTINGS_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return; // 빈 입력 전송 방지
    if (loading) return; // 로딩 중 중복 전송 방지

    // 사용자 메시지 먼저 화면에 추가
    const userMsg: ChatMessage = { role: "user", text };
    const nextMessages: ChatMessage[] = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          message: text,
          history: messages, // 이전 대화 맥락 전달
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          (data && (data as { error?: string }).error) ||
          `응답을 받지 못했습니다. (status ${res.status})`;
        throw new Error(msg);
      }

      const ai = data as {
        reply?: string;
        replyReading?: string;
        replyKoreanPronunciation?: string;
        correction?: string;
        correctionReading?: string;
        correctionKoreanPronunciation?: string;
        explanation?: string;
      };

      const aiMsg: ChatMessage = {
        role: "assistant",
        reply: ai.reply ?? "",
        replyReading: ai.replyReading ?? "",
        replyKoreanPronunciation: ai.replyKoreanPronunciation ?? "",
        correction: ai.correction ?? "",
        correctionReading: ai.correctionReading ?? "",
        correctionKoreanPronunciation: ai.correctionKoreanPronunciation ?? "",
        explanation: ai.explanation ?? "",
        originalUserText: text,
      };
      setMessages([...nextMessages, aiMsg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME 한글/일본어 조합 중에는 전송 안 함
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  const handleReset = () => {
    if (loading) return;
    setMessages([]);
    setError(null);
  };

  const isCorrectionDifferent = (original: string, corrected: string) =>
    corrected.trim() !== "" && corrected.trim() !== original.trim();

  const handleSpeak = async (text: string, audioKey: string) => {
    if (!text || playingAudioKey) return;
    setPlayingAudioKey(audioKey);
    try {
      await speakJapanese(text, settings);
    } finally {
      setPlayingAudioKey(null);
    }
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#7b8c7b",
    marginBottom: "4px",
    letterSpacing: "0.01em",
  };

  const sectionDividerStyle: React.CSSProperties = {
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #dce8dc",
  };

  const readingTextStyle: React.CSSProperties = {
    color: "#4f5b4f",
    fontSize: "13px",
    lineHeight: 1.5,
  };

  return (
    <section>
      <div className="page-header">
        <h1>AI 회화</h1>
        <p className="muted" style={{ margin: 0 }}>
          상황을 선택하고 일본어로 대화를 연습해 보세요.
        </p>
      </div>

      {/* 1) 상황 선택 영역 (상단 분리) */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <label
            htmlFor="situation"
            style={{ fontSize: "13px", color: "#555" }}
          >
            상황
          </label>
          <select
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value as Situation)}
            disabled={loading}
          >
            {SITUATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={handleReset}
            disabled={loading || messages.length === 0}
            className="btn btn-danger"
            style={{ marginLeft: "auto" }}
          >
            대화 초기화
          </button>
        </div>
      </div>

      {/* 2) 대화 영역 (학습용 채팅 박스) */}
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: "10px",
          background: "#fafafa",
          padding: "12px",
          minHeight: "280px",
          maxHeight: "520px",
          overflowY: "auto",
          marginBottom: "12px",
        }}
      >
        {messages.length === 0 && !loading && !error ? (
          <div
            style={{
              textAlign: "center",
              color: "#888",
              fontSize: "14px",
              padding: "40px 8px",
            }}
          >
            아직 대화가 없습니다.
            <br />
            일본어로 메시지를 입력해 보세요.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {messages.map((m, idx) => {
              if (m.role === "user") {
                // 사용자 메시지: 오른쪽 정렬 말풍선
                return (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      margin: "8px 0",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        border: "1px solid #cfd8ff",
                        borderRadius: "12px",
                        padding: "10px 12px",
                        background: "#f3f6ff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6b7ab0",
                          marginBottom: "2px",
                        }}
                      >
                        나
                      </div>
                      <div style={{ fontSize: "15px" }}>{m.text}</div>
                    </div>
                  </li>
                );
              }

              const corrected = isCorrectionDifferent(
                m.originalUserText,
                m.correction
              );

              // AI 메시지: 왼쪽 정렬, 답변/교정/설명 섹션 구분
              return (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    margin: "8px 0",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "90%",
                      border: "1px solid #d6e9d6",
                      borderRadius: "12px",
                      padding: "14px 14px",
                      background: "#f5faf5",
                      lineHeight: 1.6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#5e8f5e",
                        marginBottom: "6px",
                      }}
                    >
                      AI
                    </div>

                    {/* 1) AI 답변 */}
                    <div>
                      <div style={sectionLabelStyle}>답변</div>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleSpeak(m.reply, `reply-${idx}`)}
                        disabled={!m.reply || playingAudioKey !== null}
                        style={{ marginBottom: "8px", fontSize: "12px", padding: "4px 8px" }}
                      >
                        {playingAudioKey === `reply-${idx}` ? "재생 중..." : "🔊 답변 듣기"}
                      </button>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#223322",
                          lineHeight: 1.55,
                        }}
                      >
                        {m.reply || "—"}
                      </div>
                    </div>

                    {/* 2) 읽기 */}
                    {settings.showReading && m.replyReading && (
                      <div style={sectionDividerStyle}>
                        <div style={sectionLabelStyle}>읽기</div>
                        <div style={readingTextStyle}>{m.replyReading}</div>
                      </div>
                    )}

                    {/* 3) 한글 발음 참고 */}
                    {settings.showKoreanPronunciation && m.replyKoreanPronunciation && (
                      <div style={sectionDividerStyle}>
                        <div style={sectionLabelStyle}>한글 발음 참고</div>
                        <div style={readingTextStyle}>
                          {m.replyKoreanPronunciation}
                        </div>
                      </div>
                    )}

                    {/* 4) 교정 */}
                    {m.correction && (
                      <div style={sectionDividerStyle}>
                        <div style={sectionLabelStyle}>
                          교정 {corrected ? "(수정됨)" : "(자연스러움)"}
                        </div>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleSpeak(m.correction, `correction-${idx}`)}
                          disabled={!m.correction || playingAudioKey !== null}
                          style={{ marginBottom: "8px", fontSize: "12px", padding: "4px 8px" }}
                        >
                          {playingAudioKey === `correction-${idx}` ? "재생 중..." : "🔊 교정 듣기"}
                        </button>
                        <div
                          style={{
                            color: "#233223",
                            fontSize: "15px",
                            fontWeight: 600,
                            lineHeight: 1.55,
                          }}
                        >
                          {m.correction}
                        </div>
                      </div>
                    )}

                    {/* 5) 교정 읽기 */}
                    {settings.showReading && m.correctionReading && (
                      <div style={sectionDividerStyle}>
                        <div style={sectionLabelStyle}>교정 읽기</div>
                        <div style={readingTextStyle}>{m.correctionReading}</div>
                      </div>
                    )}

                    {/* 6) 교정 한글 발음 참고 */}
                    {settings.showKoreanPronunciation && m.correctionKoreanPronunciation && (
                      <div style={sectionDividerStyle}>
                        <div style={sectionLabelStyle}>교정 한글 발음 참고</div>
                        <div style={readingTextStyle}>
                          {m.correctionKoreanPronunciation}
                        </div>
                      </div>
                    )}

                    {/* 7) 설명 */}
                    {m.explanation && (
                      <div style={sectionDividerStyle}>
                        <div style={sectionLabelStyle}>설명</div>
                        <div
                          style={{ color: "#4c5d4c", fontSize: "14px", lineHeight: 1.6 }}
                        >
                          {m.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {loading && (
          <p
            className="muted"
            style={{ marginTop: "8px", textAlign: "center" }}
          >
            AI가 응답 중...
          </p>
        )}
        {error && (
          <p
            role="alert"
            style={{
              color: "#c00",
              marginTop: "8px",
              padding: "8px",
              border: "1px solid #f2caca",
              borderRadius: "8px",
              background: "#fff4f4",
            }}
          >
            에러: {error}
          </p>
        )}
      </div>

      {/* 3) 입력 영역 */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            loading ? "AI가 응답 중입니다..." : "일본어로 입력하세요"
          }
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          onClick={handleSend}
          disabled={loading || input.trim() === ""}
          className="btn"
        >
          {loading ? "전송 중..." : "전송"}
        </button>
      </div>
    </section>
  );
}
