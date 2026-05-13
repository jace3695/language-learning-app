"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/kana", label: "가나" },
  { href: "/words", label: "단어" },
  { href: "/sentences", label: "문장" },
  { href: "/grammar", label: "문법" },
  { href: "/review", label: "복습" },
  { href: "/progress", label: "진도" },
  { href: "/calendar", label: "달력" },
  { href: "/settings", label: "설정" },
  { href: "/writing", label: "쓰기" },
  { href: "/conversation", label: "AI 회화" },
  { href: "/speaking", label: "말하기" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="top-nav" aria-label="주요 메뉴">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "top-nav-link is-active" : "top-nav-link"}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
