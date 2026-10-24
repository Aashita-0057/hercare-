"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, useI18n } from "@/lib/i18n";
import { Banner, Field, PageSpinner, PrimaryButton } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

export default function WelcomePage() {
  const { user, loadingUser, lang, t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already onboarded? Route onwards.
  useEffect(() => {
    if (!loadingUser && user) {
      router.replace("/home");
    }
  }, [user, loadingUser, router]);

  if (loadingUser || user) return <PageSpinner />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, phone }),
      });
      sessionStorage.setItem(
        "hc_signup",
        JSON.stringify({ name, phone, devOtp: data.devOtp, resendInSeconds: data.resendInSeconds })
      );
      router.push("/verify-otp");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const instructions = t("welcomeInstructions");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-cream px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-rose-500 text-4xl text-white shadow-lg" aria-hidden>
            ❤
          </div>
          <h1 className="text-3xl font-extrabold text-rose-600">HerCare+</h1>
          <p className="mt-1 text-lg font-semibold text-sage-700">{t("tagline")}</p>
          <div className="mt-3 flex justify-center">
            <AudioButton text={instructions} label={t("hearWelcomeBtn")} />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-3xl border-2 border-rose-100 bg-white p-6 shadow-sm">
          <Field
            label={`👤 ${t("enterName")}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
          <Field
            label={`📱 ${t("enterPhone")}`}
            hint={t("phoneHint")}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s+-]/g, ""))}
            inputMode="tel"
            autoComplete="tel"
            required
          />

          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              {error}
            </p>
          )}

          <PrimaryButton type="submit" loading={busy}>
            {t("continue")} →
          </PrimaryButton>
          <p className="text-center text-xs text-ink/60">{t("askOnlyNote")}</p>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60" lang={lang}>
          {t("emergencyAlwaysDial")} <a href="tel:112" className="font-extrabold text-danger">112</a> {t("noLoginNeededSuffix")}
        </p>
        <div className="mt-3">
          <Banner kind="info" text={t("chromeBanner")} />
        </div>
      </div>
    </div>
  );
}
