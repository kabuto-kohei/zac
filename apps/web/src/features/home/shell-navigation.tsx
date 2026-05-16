"use client";

import Link from "next/link";
import { useAuthStatus } from "./auth-state";
import type { Tab } from "./app-shell";

const publicNavItems: Array<{ id: Tab; href: string; label: string }> = [
  { id: "home", href: "/", label: "カレンダー" },
  { id: "explore", href: "/explore", label: "ジム" },
];

const memberNavItems: Array<{ id: Tab; href: string; label: string }> = [
  ...publicNavItems,
  { id: "me", href: "/me", label: "アカウント" },
];

export function ShellNavigation({ activeTab }: { activeTab: Tab }) {
  const { authenticated, checking } = useAuthStatus();
  const navItems = checking || !authenticated ? publicNavItems : memberNavItems;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <Link
          aria-current={item.id === activeTab ? "page" : undefined}
          className={item.id === activeTab ? "nav-item active" : "nav-item"}
          href={item.href}
          key={item.id}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
