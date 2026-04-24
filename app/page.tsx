import Link from "next/link";

const actions = [
  {
    href: "/words",
    label: "단어 학습",
    desc: "자주 쓰는 일본어 단어를 확인하고 저장해 보세요.",
  },
  {
    href: "/sentences",
    label: "문장 학습",
    desc: "상황별 문장을 익히고 저장해 두세요.",
  },
  {
    href: "/conversation",
    label: "AI 회화",
    desc: "상황을 골라 일본어로 대화를 연습해 보세요.",
  },
  {
    href: "/review",
    label: "복습",
    desc: "저장한 단어와 문장을 다시 확인해 보세요.",
  },
];

export default function HomePage() {
  return (
    <section>
      <div
        style={{
          textAlign: "center",
          padding: "12px 0 24px",
        }}
      >
        <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>
          일본어 학습 앱
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          단어 · 문장 · 회화를 차근차근 연습해 보세요.
        </p>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="card"
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              marginBottom: 0,
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              {a.label}
            </div>
            <div className="muted" style={{ margin: 0 }}>
              {a.desc}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
