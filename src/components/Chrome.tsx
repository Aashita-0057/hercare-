"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import BottomNav from "./BottomNav";
import QuickExit from "./QuickExit";
import AssistantPanel from "./AssistantPanel";
import OfflineBar from "./OfflineBar";

/** Routes that show the bare app shell (no header/nav): onboarding + decoy. */
function isChromeless(path: string) {
  return path === "/" || path.startsWith("/verify-otp") || path.startsWith("/neutral");
}

const SENSITIVE = ["/journal", "/safety"];

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const [assistantOpen, setAssistantOpen] = useState(false);
  const chromeless = isChromeless(pathname);
  const sensitive = SENSITIVE.some((p) => pathname.startsWith(p));

  if (chromeless) {
    return (
      <>
        {children}
        <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onOpenAssistant={() => setAssistantOpen(true)} />
      <OfflineBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
      {sensitive && <QuickExit />}
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
