"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, useI18n } from "@/lib/i18n";
import { Banner, PrimaryButton } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

export default function OtpPage() {
  const { t, refreshUser } = useI18n();
  const router = useRouter();
  const [signup, setSignup] = useState<{ name: string; phone: string; devOtp?: string; resendInSeconds?: number } | null>(null);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [editing, setEditing] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("hc_signup");
    if (!raw) {
      router.replace("/");
      return;
    }
    const parsed = JSON.parse(raw);
    setSignup(parsed);
    setNewPhone(parsed.phone);
    setCooldown(parsed.resendInSeconds ?? 60);
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (txt.length === 6) {
      e.preventDefault();
      setDigits(txt.split(""));
      refs.current[5]?.focus();
    }
  };

  const verify = useCallback(
    async (code: string) => {
      if (!signup || busy) return;
      setBusy(true);
      setError(null);
      try {
        await api("/api/auth/verify", {
          method: "POST",
          body: JSON.stringify({ name: signup.name, phone: signup.phone, code }),
        });
        await refreshUser();
        sessionStorage.removeItem("hc_signup");
        router.push("/language");
      } catch (err) {
        const e = err as { message?: string; data?: { expired?: boolean; needResend?: boolean } };
        setError(e.message || "Verification failed");
        if (e.data?.needResend || e.data?.expired) setDigits(["", "", "", "", "", ""]);
      } finally {
        setBusy(false);
      }
    },
    [signup, busy, refreshUser, router]
  );

  // Auto-submit when all six digits are present.
  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6) verify(code);
  }, [digits, verify]);

  async function resend() {
    if (!signup || cooldown > 0) return;
    setError(null);
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: signup.name, phone: signup.phone, resend: true }),
      });
      const s = { ...signup, devOtp: data.devOtp };
      setSignup(s);
      sessionStorage.setItem("hc_signup", JSON.stringify(s));
      setCooldown(data.resendInSeconds ?? 60);
      setDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveEditedPhone() {
    if (!signup) return;
    setError(null);
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: signup.name, phone: newPhone }),
      });
      const s = { name: signup.name, phone: newPhone, devOtp: data.devOtp, resendInSeconds: data.resendInSeconds };
      setSignup(s);
      sessionStorage.setItem("hc_signup", JSON.stringify(s));
      setEditing(false);
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!signup) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-cream px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border-2 border-rose-100 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-extrabold text-rose-600">{t("otpTitle")}</h1>
        <p className="mb-4 text-ink/70">
          {t("otpSentTo")} <span className="font-bold">+91 {signup.phone}</span>
        </p>

        <div className="mb-4">
          <AudioButton text={t("otpAudio")} label={t("hearItShort")} />
        </div>

        {signup.devOtp && (
          <div className="mb-4 space-y-2">
            <Banner kind="dev" text={t("devModeBanner")} />
            <p className="rounded-xl border-2 border-dashed border-sage-400 bg-sage-50 p-3 text-center text-xl font-extrabold tracking-widest">
              {signup.devOtp}
            </p>
          </div>
        )}

        {editing ? (
          <div className="mb-4 space-y-3">
            <label className="block text-sm font-bold">{t("editNumber")}</label>
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="tel"
              className="w-full rounded-xl border-2 border-sage-200 px-4 py-3 text-lg"
            />
            <div className="flex gap-2">
              <button onClick={saveEditedPhone} className="flex-1 rounded-xl bg-sage-600 py-3 font-bold text-white">
                {t("save")}
              </button>
              <button onClick={() => setEditing(false)} className="rounded-xl border-2 border-sage-200 px-4 py-3 font-bold">
                {t("back")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex justify-between gap-1.5" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => e.key === "Backspace" && !digits[i] && i > 0 && refs.current[i - 1]?.focus()}
                inputMode="numeric"
                aria-label={`${t("digitWord")} ${i + 1}`}
                className="h-14 w-12 rounded-xl border-2 border-sage-200 text-center text-2xl font-extrabold outline-none focus:border-rose-400"
              />
            ))}
          </div>
        )}

        {error && (
          <p role="alert" className="mb-3 rounded-xl bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
            {error}
          </p>
        )}

        {busy && <p className="mb-3 text-center text-sm text-sage-700">{t("checkingWord")}</p>}

        <div className="flex items-center justify-between text-sm">
          <button
            onClick={resend}
            disabled={cooldown > 0}
            className="font-bold text-rose-600 disabled:text-ink/40"
          >
            {cooldown > 0 ? `${t("resendOtp")} (${cooldown}s)` : `↺ ${t("resendOtp")}`}
          </button>
          <button onClick={() => setEditing(true)} className="font-semibold text-sage-700 underline">
            {t("editNumber")}
          </button>
        </div>

        <div className="mt-5">
          <PrimaryButton tone="sage" onClick={() => verify(digits.join(""))} loading={busy} disabled={digits.join("").length < 6}>
            {t("continue")} ✓
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
