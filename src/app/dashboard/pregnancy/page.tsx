"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import Guard from "@/components/Guard";
import { Banner, PageSpinner, PrimaryButton } from "@/components/ui";
import AudioButton from "@/components/AudioButton";
import {
  PREGNANCY_WARNING_SIGNS,
  POSTPARTUM_WARNING_SIGNS,
  INFANT_WARNING_SIGNS,
} from "@/server/triage";

interface Profile {
  id: string;
  label: string;
  eddDate: string | null;
  status: string;
  weekInfo: { weeks: number; days: number; trimester: number } | null;
}
interface Maternal { id: string; date: string; bpHigh: number | null; bpLow: number | null; weightKg: number | null; ironTaken: boolean | null; notes: string | null }
interface InfantLog { id: string; babyLabel: string; type: string; value: string; takenAt: string }

const VACCINE_SCHEDULE = [
  { whenKey: "vAtBirth", vaccines: "BCG · OPV-0 · Hepatitis B-1" },
  { whenKey: "v6wk", vaccines: "Pentavalent-1 · OPV-1 · Rotavirus-1 · fIPV-1" },
  { whenKey: "v10wk", vaccines: "Pentavalent-2 · OPV-2 · Rotavirus-2" },
  { whenKey: "v14wk", vaccines: "Pentavalent-3 · OPV-3 · fIPV-2" },
  { whenKey: "v912mo", vaccines: "MR-1 · Typhoid conjugate" },
  { whenKey: "v1624mo", vaccines: "MR-2 · Hepatitis B booster" },
  { whenKey: "v56yr", vaccines: "DT booster" },
  { whenKey: "v10yr", vaccines: "TT" },
  { whenKey: "v16yr", vaccines: "Tdap" },
];

// Danger-sign translations are looked up by index; the triage constants stay the
// English source of truth so rules and UI can never drift apart.
const SIGN_KEYS = {
  pregnancy: ["sign_p1", "sign_p2", "sign_p3", "sign_p4", "sign_p5", "sign_p6", "sign_p7"],
  postpartum: ["sign_pp1", "sign_pp2", "sign_pp3", "sign_pp4", "sign_pp5"],
  infant: ["sign_b1", "sign_b2", "sign_b3", "sign_b4", "sign_b5", "sign_b6"],
} as const;

const PPC_KEYS = ["ppc1", "ppc2", "ppc3", "ppc4"] as const;

const TYPE_LABEL_KEY: Record<string, string> = {
  feeding: "typeFeeding", sleep: "typeSleep", vaccine: "typeVaccine", growth: "typeGrowth", appointment: "typeDoctor",
};

export default function PregnancyPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"mother" | "baby" | "guide">("mother");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [maternal, setMaternal] = useState<Maternal[]>([]);
  const [infants, setInfants] = useState<InfantLog[]>([]);
  const [loading, setLoading] = useState(true);

  // profile form
  const [edd, setEdd] = useState("");
  const [status, setStatus] = useState("antenatal");
  // maternal form
  const [bpH, setBpH] = useState(""); const [bpL, setBpL] = useState("");
  const [wt, setWt] = useState(""); const [iron, setIron] = useState(true);
  // infant form
  const [iType, setIType] = useState("feeding"); const [iVal, setIVar] = useState(""); const [baby, setBaby] = useState("Baby");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api("/api/pregnancy");
      setProfile(d.profile); setMaternal(d.maternal); setInfants(d.infants);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const post = async (payload: Record<string, unknown>, successMsg = "") => {
    setError(""); setNotice(""); setBusy(true);
    try {
      const d = await api("/api/pregnancy", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (d.bpWarning) setNotice(t("bpHighWarning"));
      else if (successMsg) setNotice(successMsg);
      await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const signSection = (titleKey: string, signs: readonly string[], keys: readonly string[]) => (
    <section key={titleKey} className="rounded-2xl border-4 border-danger bg-white p-4">
      <h2 className="mb-2 flex items-center justify-between font-black text-danger">
        {t(titleKey)}
        <AudioButton
          text={`${t(titleKey)}. ${keys.map((k) => t(k)).join(". ")}. ${t("whyCallNote")}`}
          label={t("hearSigns")}
        />
      </h2>
      <ul className="list-disc space-y-1.5 ps-5 text-sm font-semibold">
        {signs.map((s, i) => <li key={s}>{keys[i] ? t(keys[i]) : s}</li>)}
      </ul>
    </section>
  );

  return (
    <Guard>
      <div className="space-y-4">
        <Link href="/dashboard" className="text-sm font-bold text-sage-700">← {t("dashboard")}</Link>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-extrabold">🤰 {t("pregnancyCard")}</h1>
          <AudioButton text={t("pregAudioIntro")} label={t("hearIt")} />
        </div>

        <p className="text-sm text-ink/70">{t("pregIntro")}</p>

        {loading ? (
          <PageSpinner />
        ) : (
          <>
            {/* Profile / week estimate */}
            {!profile ? (
              <section className="rounded-2xl border-2 border-sage-300 bg-white p-4">
                <h2 className="mb-2 font-extrabold">{t("startPregRecord")}</h2>
                <p className="mb-3 text-xs text-ink/60">{t("eddUnknownHelp")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink/70">{t("eddLabel")}</span>
                    <input type="date" value={edd} onChange={(e) => setEdd(e.target.value)}
                      className="w-full rounded-xl border-2 border-sage-200 px-4 py-3" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-ink/70">{t("stageLabel")}</span>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 font-semibold">
                      <option value="antenatal">{t("optAntenatal")}</option>
                      <option value="postpartum">{t("optPostpartum")}</option>
                    </select>
                  </label>
                </div>
                <PrimaryButton tone="sage" loading={busy} className="mt-3 w-full"
                  onClick={() => edd ? post({ action: "profile", eddDate: edd, status }) : setError(t("needEddError"))}>
                  {t("saveOpenTracker")}
                </PrimaryButton>
              </section>
            ) : (
              <section className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-rose-500">
                  {profile.status === "antenatal" ? t("pregnancyWord") : t("postpartumWord")} · {profile.label}
                </p>
                {profile.weekInfo && profile.status === "antenatal" && (
                  <p className="mt-1 text-lg font-extrabold">
                    ≈ {profile.weekInfo.weeks} {t("weeksWord")} {profile.weekInfo.days}d · {profile.weekInfo.trimester} {t("trimesterWord")}
                    <span className="ms-2 text-xs font-semibold text-ink/60">{t("estimateFromDue")}</span>
                  </p>
                )}
                {profile.eddDate && (
                  <p className="text-sm text-ink/70">{t("dueDateLabel")}: {new Date(profile.eddDate).toLocaleDateString()}</p>
                )}
                <AudioButton
                  text={`${t("weekEstimate")}. ${profile.weekInfo ? `${profile.weekInfo.weeks} ${t("weeksWord")}. ` : ""}${t("pregEstimateNote")}`}
                  label={t("hearIt")}
                />
              </section>
            )}

            {error && <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-bold text-danger">{error}</p>}
            {notice && <p role="status" className="rounded-xl bg-caution/10 px-3 py-2 text-sm font-bold text-caution">{notice}</p>}

            {/* Tabs */}
            <div role="tablist" className="flex gap-2">
              {([["mother", `🤰 ${t("tabMother")}`], ["baby", `👶 ${t("tabBaby")}`], ["guide", `⚠️ ${t("tabGuide")}`]] as const).map(([v, l]) => (
                <button key={v} role="tab" aria-selected={tab === v} onClick={() => setTab(v)}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-extrabold ${
                    tab === v ? "border-sage-600 bg-sage-600 text-white" : "border-sage-200 bg-white"
                  }`}>
                  {l}
                </button>
              ))}
            </div>

            {tab === "mother" && (
              <section className="space-y-3 rounded-2xl border-2 border-sage-200 bg-white p-4">
                <h2 className="font-extrabold">{t("motherTracker")}</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <input inputMode="numeric" placeholder={t("bpTopPh")} value={bpH} onChange={(e) => setBpH(e.target.value)}
                    className="rounded-xl border-2 border-sage-200 px-3 py-2.5" />
                  <input inputMode="numeric" placeholder={t("bpBottomPh")} value={bpL} onChange={(e) => setBpL(e.target.value)}
                    className="rounded-xl border-2 border-sage-200 px-3 py-2.5" />
                  <input inputMode="decimal" placeholder={t("weightPh")} value={wt} onChange={(e) => setWt(e.target.value)}
                    className="rounded-xl border-2 border-sage-200 px-3 py-2.5" />
                  <button onClick={() => setIron((i) => !i)}
                    className={`rounded-xl border-2 px-2 py-2.5 text-xs font-bold ${iron ? "border-sage-500 bg-sage-100" : "border-sage-200 bg-white text-ink/50"}`}>
                    {iron ? t("ironTakenBtn") : t("ironNotBtn")}
                  </button>
                </div>
                <PrimaryButton tone="sage" loading={busy} className="w-full"
                  onClick={() => post({ action: "maternal", bpHigh: bpH || undefined, bpLow: bpL || undefined, weightKg: wt || undefined, ironTaken: iron }, t("recordSaved"))}>
                  {t("saveCheckin")}
                </PrimaryButton>
                <p className="text-[11px] text-ink/50">{t("bpHomeNote")}</p>
                {maternal.length > 0 && (
                  <ul className="space-y-1.5">
                    {maternal.slice(0, 10).map((m) => (
                      <li key={m.id} className={`rounded-lg px-3 py-1.5 text-xs ${m.bpHigh && m.bpHigh >= 140 ? "bg-caution/15 font-bold text-caution" : "bg-sage-50"}`}>
                        {new Date(m.date).toLocaleDateString()} · {t("bpWord")} {m.bpHigh ?? "—"}/{m.bpLow ?? "—"} · {m.weightKg ?? "—"} kg · {t("ironWord")} {m.ironTaken === null ? "—" : m.ironTaken ? "✓" : "✗"}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {tab === "baby" && (
              <section className="space-y-3 rounded-2xl border-2 border-sage-200 bg-white p-4">
                <h2 className="font-extrabold">{t("babyLogTitle")}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input placeholder={t("babyNamePh")} value={baby} onChange={(e) => setBaby(e.target.value)}
                    className="rounded-xl border-2 border-sage-200 px-3 py-2.5" />
                  <select value={iType} onChange={(e) => setIType(e.target.value)}
                    className="rounded-xl border-2 border-sage-200 bg-white px-3 py-2.5 font-semibold">
                    <option value="feeding">{t("typeFeeding")}</option>
                    <option value="sleep">{t("typeSleep")}</option>
                    <option value="vaccine">{t("typeVaccine")}</option>
                    <option value="growth">{t("typeGrowth")}</option>
                    <option value="appointment">{t("typeDoctor")}</option>
                  </select>
                </div>
                <input placeholder={t("babyValuePh")} value={iVal}
                  onChange={(e) => setIVar(e.target.value)}
                  className="w-full rounded-xl border-2 border-sage-200 px-3 py-2.5" />
                <PrimaryButton tone="sage" loading={busy} className="w-full"
                  onClick={() => iVal.trim()
                    ? post({ action: "infant", babyLabel: baby || "Baby", type: iType, value: iVal }, t("recordSaved"))
                    : setError(t("needBabyNoteError"))}>
                  {t("addBabyLog")}
                </PrimaryButton>

                <details className="rounded-xl border-2 border-sage-200 p-3">
                  <summary className="cursor-pointer text-sm font-bold">{t("vacSummary")}</summary>
                  <table className="mt-2 w-full text-xs">
                    <tbody>
                      {VACCINE_SCHEDULE.map((v) => (
                        <tr key={v.whenKey} className="border-b border-sage-100">
                          <td className="py-1.5 pe-2 font-bold whitespace-nowrap">{t(v.whenKey)}</td>
                          <td className="py-1.5">{v.vaccines}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[11px] text-ink/60">{t("vacCardNote")}</p>
                </details>

                {infants.length > 0 && (
                  <ul className="space-y-1.5">
                    {infants.slice(0, 12).map((i) => (
                      <li key={i.id} className="rounded-lg bg-sage-50 px-3 py-1.5 text-xs">
                        <b>{t(TYPE_LABEL_KEY[i.type] ?? "other")}</b> · {i.babyLabel}: {i.value} <span className="text-ink/50">({fmt(i.takenAt)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {tab === "guide" && (
              <div className="space-y-3">
                {signSection("dangerTitleP", PREGNANCY_WARNING_SIGNS, SIGN_KEYS.pregnancy)}
                {signSection("dangerTitlePP", POSTPARTUM_WARNING_SIGNS, SIGN_KEYS.postpartum)}
                {signSection("dangerTitleB", INFANT_WARNING_SIGNS, SIGN_KEYS.infant)}
                <div className="rounded-2xl border-2 border-sage-300 bg-sage-50 p-4">
                  <a href="tel:112" className="block rounded-xl bg-danger px-4 py-3 text-center font-black text-white">
                    {t("callDangerNow")}
                  </a>
                  <p className="mt-2 text-xs text-ink/60">{t("whyCallNote")}</p>
                </div>
                <p className="text-center text-[11px] text-ink/50">{t("reviewedNote")}</p>
              </div>
            )}

            {/* Postpartum care cards */}
            <section className="rounded-2xl border-2 border-rose-200 bg-white p-4">
              <h2 className="mb-2 flex items-center justify-between font-extrabold">
                {t("postpartumCareTitle")}
                <AudioButton text={PPC_KEYS.map((k) => `${t(`${k}t`)}. ${t(`${k}b`)}`).join(" ")} label={t("hearIt")} />
              </h2>
              <div className="space-y-2">
                {PPC_KEYS.map((k) => (
                  <details key={k} className="rounded-xl bg-rose-50 p-3">
                    <summary className="cursor-pointer text-sm font-bold">{t(`${k}t`)}</summary>
                    <p className="mt-2 text-sm leading-relaxed text-ink/80">{t(`${k}b`)}</p>
                  </details>
                ))}
              </div>
            </section>

            <Banner kind="info" text={t("pregBanner")} />
          </>
        )}
      </div>
    </Guard>
  );
}
