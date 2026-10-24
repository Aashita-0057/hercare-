"use client";

import { useState } from "react";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import { Banner, PrimaryButton } from "@/components/ui";
import AudioButton from "@/components/AudioButton";

// Emoji stays with the category; the label is translated via cat_* keys.
const CATEGORIES = [
  { v: "harassment", emoji: "😨" },
  { v: "stalking", emoji: "👁" },
  { v: "domestic_violence", emoji: "🏠" },
  { v: "cyber_abuse", emoji: "📱" },
  { v: "workplace", emoji: "💼" },
  { v: "medical_neglect", emoji: "🏥" },
  { v: "other", emoji: "📄" },
];

export default function ReportPage() {
  const { t } = useI18n();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod] = useState("any");
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const submit = async () => {
    setError("");
    if (!category) return setError(t("errChooseCat"));
    if (description.trim().length < 10) return setError(t("errDescribe"));
    if (!consented) return setError(t("errConsent"));
    setLoading(true);
    try {
      const res = await api("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description, occurredAt, location, contact, preferredMethod: method, consented }),
      });
      setReference(res.reference);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (reference) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border-4 border-sage-400 bg-white p-6 text-center">
          <p className="text-4xl">✅</p>
          <h1 className="mt-2 text-xl font-extrabold text-sage-700">{t("reportReceived")}</h1>
          <p className="mt-2 inline-block rounded-xl bg-sage-50 px-4 py-2 font-mono text-2xl font-black tracking-wider">
            {reference}
          </p>
          <p className="mt-3 text-sm text-ink/70">{t("refKeepSafe")}</p>
          <p className="mt-2 text-sm font-semibold text-danger">{t("dangerWait")}</p>
          <div className="mt-4">
            <Link href="/safety" className="font-bold text-rose-600">{t("backToSafety")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/safety" className="text-sm font-bold text-sage-700">← {t("safety")}</Link>
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-extrabold">📝 {t("reportHarassment")}</h1>
        <AudioButton text={t("reportAudio")} label={t("hearIt")} />
      </div>

      <Banner kind="caution" text={t("thisIsNotEmergency")} />

      <fieldset className="rounded-2xl border-2 border-rose-200 bg-white p-4">
        <legend className="px-1 text-sm font-bold">{t("chooseOne")}</legend>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <label
              key={c.v}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold ${
                category === c.v ? "border-rose-400 bg-rose-50" : "border-sage-200"
              }`}
            >
              <input
                type="radio"
                name="category"
                checked={category === c.v}
                onChange={() => setCategory(c.v)}
                className="h-5 w-5 accent-rose-500"
              />
              {c.emoji} {t(`cat_${c.v}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-ink">{t("storyOwn")}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder={t("storyPh2")}
          className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 text-base outline-none focus:border-rose-400"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink">{t("whenLabel")}</span>
          <input
            type="text"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            placeholder={t("whenPh")}
            className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 outline-none focus:border-rose-400"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink">{t("whereLabel")}</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("wherePh")}
            className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 outline-none focus:border-rose-400"
          />
        </label>
      </div>

      <details className="rounded-2xl border-2 border-sage-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold">
          {t("contactSummary")}
        </summary>
        <div className="mt-3 space-y-3">
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t("contactPh")}
            className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 outline-none focus:border-rose-400"
          />
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink/70">{t("methodLabel")}</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-2.5 font-semibold"
            >
              {[
                { v: "any", k: "methodAny" },
                { v: "call", k: "methodCall" },
                { v: "sms", k: "methodSms" },
                { v: "whatsapp", k: "methodWhatsapp" },
                { v: "email", k: "methodEmail" },
              ].map((m) => (
                <option key={m.v} value={m.v}>{t(m.k)}</option>
              ))}
            </select>
          </label>
        </div>
      </details>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-semibold">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-rose-500"
        />
        {t("consentLabel")}
      </label>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-2 text-sm font-bold text-danger">{error}</p>
      )}

      <PrimaryButton onClick={submit} loading={loading} className="w-full">
        {t("submitReport")}
      </PrimaryButton>

      <details className="rounded-2xl bg-white p-4 text-xs leading-relaxed text-ink/70">
        <summary className="cursor-pointer font-bold text-ink">{t("privacyHonest")}</summary>
        <ul className="mt-2 list-disc space-y-2 ps-5">
          {[t("anonHint"), t("pnLogged"), t("pnDemo"), t("pnDevice"), t("privNote3")].map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </details>

      <p className="text-center text-xs text-ink/50">{t("noForce")}</p>
    </div>
  );
}
