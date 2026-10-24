"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageSpinner } from "./ui";

/** Client-side auth gate: redirects to onboarding when no session exists.
 *  The real protection is server-side — every sensitive API re-checks the
 *  session cookie. This only manages the user experience. */
export default function Guard({ children }: { children: React.ReactNode }) {
  const { user, loadingUser } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) router.replace("/");
  }, [user, loadingUser, router]);

  if (loadingUser || !user) return <PageSpinner />;
  return <>{children}</>;
}
