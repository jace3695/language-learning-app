import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "일본어 공부",
  description: "일본어 학습 웹앱",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "일본어 공부",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const navItems = [
  { href: "/", label: "홈" },
  { href: "/words", label: "단어" },
  { href: "/sentences", label: "문장" },
  { href: "/writing", label: "쓰기" },
  { href: "/conversation", label: "AI 회화" },
  { href: "/kana", label: "가나" },
  { href: "/kana-writing", label: "가나 쓰기" },
  { href: "/review", label: "복습" },
  { href: "/speaking", label: "말하기" },
  { href: "/settings", label: "설정" },
  { href: "/progress", label: "진도" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header>
          <nav>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
