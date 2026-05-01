"use client";

import Link from "next/link";
import { useAuthStatus } from "./auth-state";
import { ZacIcon, type ZacIconKey } from "./zac-icons";
import type { Tab } from "./app-shell";

const publicNavItems: Array<{ id: Tab; href: string; label: string; icon?: ZacIconKey; textIcon?: string }> = [
  { id: "home", href: "/", label: "ホーム", textIcon: "⌂" },
  { id: "explore", href: "/explore", label: "探す", icon: "gym" },
];

const memberNavItems: Array<{ id: Tab; href: string; label: string; icon?: ZacIconKey; textIcon?: string }> = [
  ...publicNavItems,
  { id: "plans", href: "/plans", label: "予定", icon: "sessionPlan" },
  { id: "logs", href: "/logs", label: "記録", icon: "climbLog" },
  { id: "me", href: "/me", label: "マイ", textIcon: "○" },
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
          {item.icon ? (
            <ZacIcon decorative icon={item.icon} size={24} />
          ) : (
            <span aria-hidden="true">{item.textIcon}</span>
          )}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
