"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈", icon: "⌂" },
  { href: "/learn", label: "배우기", icon: "あ" },
  { href: "/conversation", label: "회화", icon: "話" },
  { href: "/review", label: "복습", icon: "↻" },
  { href: "/progress", label: "내 학습", icon: "✓" },
];

const learningPaths: Record<string, string[]> = {
  "/learn": ["/learn", "/kana", "/kana-writing", "/words", "/sentences", "/grammar", "/writing"],
  "/conversation": ["/conversation", "/speaking"],
  "/review": ["/review"],
  "/progress": ["/progress", "/calendar", "/settings"],
};

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="top-nav" aria-label="주요 메뉴">
      {navItems.map((item) => {
        const active =
          pathname === item.href || learningPaths[item.href]?.includes(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "top-nav-link is-active" : "top-nav-link"}
            aria-current={active ? "page" : undefined}
          >
            <span className="top-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
