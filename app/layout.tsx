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
  { href: "/", label: "Home" },
  { href: "/words", label: "Words" },
  { href: "/sentences", label: "Sentences" },
  { href: "/writing", label: "Writing" },
  { href: "/conversation", label: "Conversation" },
  { href: "/kana", label: "Kana" },
  { href: "/review", label: "Review" },
  { href: "/speaking", label: "Speaking" },
  { href: "/settings", label: "Settings" },
  { href: "/progress", label: "Progress" },
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
