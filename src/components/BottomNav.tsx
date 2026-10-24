"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Home, Stethoscope, LayoutDashboard, ShieldHalf, User } from "lucide-react";

const ITEMS = [
  { href: "/home", key: "home", Icon: Home },
  { href: "/doctors", key: "findDoctor", Icon: Stethoscope },
  { href: "/dashboard", key: "dashboard", Icon: LayoutDashboard },
  { href: "/safety", key: "safety", Icon: ShieldHalf },
  { href: "/profile", key: "profile", Icon: User },
];

export default function BottomNav() {
  const { t } = useI18n();
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-100 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-3xl">
        {ITEMS.map(({ href, key, Icon }) => {
          const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[12px] font-semibold ${
                active ? "text-rose-600" : "text-ink/60 hover:text-rose-500"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={24} strokeWidth={active ? 2.6 : 2} aria-hidden />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
