import type { Metadata } from "next";
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

import TopNav from "@/components/TopNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header className="app-shell">
          <TopNav />
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
