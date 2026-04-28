"use client";

import { useEffect, useState } from "react";

type JapaneseAppSettings = {
  ttsRate: number;
  repeatCount: number;
  showKoreanPronunciation: boolean;
  showReading: boolean;
};

const SETTINGS_STORAGE_KEY = "japaneseAppSettings";

const DEFAULT_SETTINGS: JapaneseAppSettings = {
  ttsRate: 1,
  repeatCount: 1,
  showKoreanPronunciation: true,
  showReading: true,
};

const TTS_RATE_OPTIONS: Array<{ value: JapaneseAppSettings["ttsRate"]; label: string }> = [
  { value: 0.8, label: "0.8 느리게" },
  { value: 1, label: "1.0 보통" },
  { value: 1.2, label: "1.2 빠르게" },
];

const REPEAT_COUNT_OPTIONS: Array<{ value: JapaneseAppSettings["repeatCount"]; label: string }> = [
  { value: 1, label: "1회" },
  { value: 2, label: "2회" },
  { value: 3, label: "3회" },
];

function isValidTtsRate(value: unknown): value is JapaneseAppSettings["ttsRate"] {
  return value === 0.8 || value === 1 || value === 1.2;
}

function isValidRepeatCount(value: unknown): value is JapaneseAppSettings["repeatCount"] {
  return value === 1 || value === 2 || value === 3;
}

function parseSettings(raw: string | null): JapaneseAppSettings {
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return DEFAULT_SETTINGS;
    }

    const parsedObj = parsed as Partial<JapaneseAppSettings>;

    const mergedSettings: JapaneseAppSettings = {
      ...DEFAULT_SETTINGS,
      ...parsedObj,
    };

    return {
      ...mergedSettings,
      ttsRate: isValidTtsRate(mergedSettings.ttsRate) ? mergedSettings.ttsRate : DEFAULT_SETTINGS.ttsRate,
      repeatCount: isValidRepeatCount(mergedSettings.repeatCount)
        ? mergedSettings.repeatCount
        : DEFAULT_SETTINGS.repeatCount,
      showKoreanPronunciation:
        typeof mergedSettings.showKoreanPronunciation === "boolean"
          ? mergedSettings.showKoreanPronunciation
          : DEFAULT_SETTINGS.showKoreanPronunciation,
      showReading:
        typeof mergedSettings.showReading === "boolean"
          ? mergedSettings.showReading
          : DEFAULT_SETTINGS.showReading,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<JapaneseAppSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    const nextSettings = parseSettings(raw);
    setSettings(nextSettings);
    setIsSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSettingsLoaded) return;

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings, isSettingsLoaded]);

  const handleResetSettings = () => {
    if (typeof window === "undefined") return;

    const shouldReset = window.confirm("설정을 기본값으로 되돌릴까요?");
    if (!shouldReset) return;

    setSettings(DEFAULT_SETTINGS);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  };

  return (
    <section>
      <div className="page-header">
        <h1>설정</h1>
        <p className="muted" style={{ marginBottom: 0 }}>
          학습에 필요한 기본 옵션을 여기서 관리할 수 있어요.
        </p>
      </div>

      <div className="card" style={{ display: "grid", gap: "14px" }}>
        <div>
          <label htmlFor="tts-rate" style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
            음성 재생 속도
          </label>
          <select
            id="tts-rate"
            value={settings.ttsRate}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (!isValidTtsRate(value)) return;
              setSettings((prev) => ({ ...prev, ttsRate: value }));
            }}
            style={{ width: "100%" }}
          >
            {TTS_RATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="repeat-count" style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
            문장/단어 반복 재생 횟수
          </label>
          <select
            id="repeat-count"
            value={settings.repeatCount}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (!isValidRepeatCount(value)) return;
              setSettings((prev) => ({ ...prev, repeatCount: value }));
            }}
            style={{ width: "100%" }}
          >
            {REPEAT_COUNT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="show-korean-pronunciation"
            style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}
          >
            <input
              id="show-korean-pronunciation"
              type="checkbox"
              checked={settings.showKoreanPronunciation}
              onChange={(event) => {
                const checked = event.target.checked;
                setSettings((prev) => ({ ...prev, showKoreanPronunciation: checked }));
              }}
            />
            한글 발음 참고 표시
          </label>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            단어/문장/말하기 등에서 한글 발음 참고를 표시할 때 사용할 설정입니다.
          </p>
        </div>

        <div>
          <label htmlFor="show-reading" style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
            <input
              id="show-reading"
              type="checkbox"
              checked={settings.showReading}
              onChange={(event) => {
                const checked = event.target.checked;
                setSettings((prev) => ({ ...prev, showReading: checked }));
              }}
            />
            읽기 표시
          </label>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            reading/요미가나 표시를 보여줄 때 사용할 설정입니다.
          </p>
        </div>
      </div>

      <div className="card">
        <button type="button" className="btn btn-danger" onClick={handleResetSettings} style={{ width: "100%" }}>
          설정 초기화
        </button>
      </div>
    </section>
  );
}
