"use client";

import { useEffect, useState } from "react";

type LearningScope = "kana" | "words" | "sentences" | "speaking" | "conversation";
type ScopeSettingKey = "ttsRate" | "repeatCount" | "repeatDelayMs" | "showKoreanPronunciation" | "showReading";

type SettingsScopes = Record<ScopeSettingKey, LearningScope[]>;

type JapaneseAppSettings = {
  ttsRate: number;
  repeatCount: number;
  repeatDelayMs: number;
  showKoreanPronunciation: boolean;
  showReading: boolean;
  scopes: SettingsScopes;
};

const SETTINGS_STORAGE_KEY = "japaneseAppSettings";

const ALL_SCOPES: LearningScope[] = ["kana", "words", "sentences", "speaking", "conversation"];
const NON_KANA_SCOPES: LearningScope[] = ["words", "sentences", "speaking", "conversation"];

const SCOPE_LABELS: Record<LearningScope, string> = {
  kana: "가나",
  words: "단어",
  sentences: "문장",
  speaking: "말하기",
  conversation: "AI 회화",
};

const DEFAULT_SCOPES: SettingsScopes = {
  ttsRate: [...ALL_SCOPES],
  repeatCount: [...ALL_SCOPES],
  repeatDelayMs: [...ALL_SCOPES],
  showKoreanPronunciation: [...NON_KANA_SCOPES],
  showReading: [...NON_KANA_SCOPES],
};

const DEFAULT_SETTINGS: JapaneseAppSettings = {
  ttsRate: 1,
  repeatCount: 1,
  repeatDelayMs: 500,
  showKoreanPronunciation: true,
  showReading: true,
  scopes: DEFAULT_SCOPES,
};

const TTS_RATE_OPTIONS: Array<{ value: JapaneseAppSettings["ttsRate"]; label: string }> = [
  { value: 0.5, label: "0.5 아주 느리게" },
  { value: 0.6, label: "0.6" },
  { value: 0.7, label: "0.7" },
  { value: 0.8, label: "0.8 느리게" },
  { value: 0.9, label: "0.9" },
  { value: 1, label: "1.0 보통" },
  { value: 1.1, label: "1.1" },
  { value: 1.2, label: "1.2 빠르게" },
];

const REPEAT_COUNT_OPTIONS: Array<{ value: JapaneseAppSettings["repeatCount"]; label: string }> = [
  { value: 1, label: "1회" },
  { value: 2, label: "2회" },
  { value: 3, label: "3회" },
];

const REPEAT_DELAY_OPTIONS: Array<{ value: JapaneseAppSettings["repeatDelayMs"]; label: string }> = [
  { value: 0, label: "바로 반복" },
  { value: 300, label: "0.3초" },
  { value: 500, label: "0.5초" },
  { value: 1000, label: "1초" },
  { value: 1500, label: "1.5초" },
  { value: 2000, label: "2초" },
];

function isValidTtsRate(value: unknown): value is JapaneseAppSettings["ttsRate"] {
  return value === 0.5 || value === 0.6 || value === 0.7 || value === 0.8 || value === 0.9 || value === 1 || value === 1.1 || value === 1.2;
}

function isValidRepeatCount(value: unknown): value is JapaneseAppSettings["repeatCount"] {
  return value === 1 || value === 2 || value === 3;
}

function isValidRepeatDelayMs(value: unknown): value is JapaneseAppSettings["repeatDelayMs"] {
  return value === 0 || value === 300 || value === 500 || value === 1000 || value === 1500 || value === 2000;
}

function sanitizeScopes(scopes: Partial<SettingsScopes> | undefined): SettingsScopes {
  return {
    ttsRate: sanitizeScopeList(scopes?.ttsRate, DEFAULT_SCOPES.ttsRate),
    repeatCount: sanitizeScopeList(scopes?.repeatCount, DEFAULT_SCOPES.repeatCount),
    repeatDelayMs: sanitizeScopeList(scopes?.repeatDelayMs, DEFAULT_SCOPES.repeatDelayMs),
    showKoreanPronunciation: sanitizeScopeList(scopes?.showKoreanPronunciation, DEFAULT_SCOPES.showKoreanPronunciation),
    showReading: sanitizeScopeList(scopes?.showReading, DEFAULT_SCOPES.showReading),
  };
}

function sanitizeScopeList(value: unknown, fallback: LearningScope[]): LearningScope[] {
  if (!Array.isArray(value)) return fallback;

  const uniqueValid = Array.from(new Set(value.filter((scope): scope is LearningScope => ALL_SCOPES.includes(scope as LearningScope))));
  return uniqueValid.length > 0 ? uniqueValid : fallback;
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

    const parsedObj = parsed as Partial<JapaneseAppSettings> & { scopes?: Partial<SettingsScopes> };

    const mergedSettings: JapaneseAppSettings = {
      ...DEFAULT_SETTINGS,
      ...parsedObj,
      scopes: sanitizeScopes({
        ...DEFAULT_SCOPES,
        ...(parsedObj.scopes ?? {}),
      }),
    };

    return {
      ...mergedSettings,
      ttsRate: isValidTtsRate(mergedSettings.ttsRate) ? mergedSettings.ttsRate : DEFAULT_SETTINGS.ttsRate,
      repeatCount: isValidRepeatCount(mergedSettings.repeatCount)
        ? mergedSettings.repeatCount
        : DEFAULT_SETTINGS.repeatCount,
      repeatDelayMs: isValidRepeatDelayMs(mergedSettings.repeatDelayMs)
        ? mergedSettings.repeatDelayMs
        : DEFAULT_SETTINGS.repeatDelayMs,
      showKoreanPronunciation:
        typeof mergedSettings.showKoreanPronunciation === "boolean"
          ? mergedSettings.showKoreanPronunciation
          : DEFAULT_SETTINGS.showKoreanPronunciation,
      showReading:
        typeof mergedSettings.showReading === "boolean"
          ? mergedSettings.showReading
          : DEFAULT_SETTINGS.showReading,
      scopes: sanitizeScopes(mergedSettings.scopes),
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

  const toggleScope = (settingKey: ScopeSettingKey, scope: LearningScope) => {
    setSettings((prev) => {
      const currentScopes = prev.scopes[settingKey];
      const hasScope = currentScopes.includes(scope);

      if (hasScope) {
        if (currentScopes.length <= 1) {
          return prev;
        }
        return {
          ...prev,
          scopes: {
            ...prev.scopes,
            [settingKey]: currentScopes.filter((item) => item !== scope),
          },
        };
      }

      return {
        ...prev,
        scopes: {
          ...prev.scopes,
          [settingKey]: [...currentScopes, scope],
        },
      };
    });
  };

  const renderScopeOptions = (settingKey: ScopeSettingKey, scopes: LearningScope[]) => (
    <div style={{ marginTop: "10px" }}>
      <p className="muted" style={{ margin: "0 0 6px" }}>적용 범위</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "8px" }}>
        {scopes.map((scope) => {
          const inputId = `${settingKey}-scope-${scope}`;
          const checked = settings.scopes[settingKey].includes(scope);
          return (
            <label
              key={scope}
              htmlFor={inputId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 10px",
                borderRadius: "8px",
                border: checked ? "1px solid var(--primary, #2563eb)" : "1px solid var(--border, #e5e7eb)",
                backgroundColor: checked ? "rgba(37, 99, 235, 0.08)" : "transparent",
                cursor: "pointer",
              }}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={() => {
                  toggleScope(settingKey, scope);
                }}
              />
              {SCOPE_LABELS[scope]}
            </label>
          );
        })}
      </div>
    </div>
  );

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
          {renderScopeOptions("ttsRate", ALL_SCOPES)}
        </div>

        <div>
          <label htmlFor="repeat-delay" style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}>
            반복 재생 간격
          </label>
          <select
            id="repeat-delay"
            value={settings.repeatDelayMs}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (!isValidRepeatDelayMs(value)) return;
              setSettings((prev) => ({ ...prev, repeatDelayMs: value }));
            }}
            style={{ width: "100%" }}
          >
            {REPEAT_DELAY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {renderScopeOptions("repeatDelayMs", ALL_SCOPES)}
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
          {renderScopeOptions("repeatCount", ALL_SCOPES)}
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
          {renderScopeOptions("showKoreanPronunciation", NON_KANA_SCOPES)}
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
          {renderScopeOptions("showReading", NON_KANA_SCOPES)}
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
