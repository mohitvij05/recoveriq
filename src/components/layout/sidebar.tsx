"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  ListChecks,
  Brain,
  BarChart3,
  ScrollText,
  FlaskConical,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/revenue-at-risk", label: "Revenue at Risk", icon: AlertTriangle },
  { href: "/recovery-queue", label: "Recovery Queue", icon: ListChecks },
  { href: "/decisions", label: "AI Decision Center", icon: Brain },
  { href: "/analytics", label: "Recovery Analytics", icon: BarChart3 },
  { href: "/audit", label: "Audit Trail", icon: ScrollText },
  { href: "/simulation", label: "Simulation Lab", icon: FlaskConical },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-6">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          RecoverIQ
        </p>
        <p className="mt-1 text-xs text-muted">
          AI that knows when to recover — and when to stop.
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-surface-raised hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
