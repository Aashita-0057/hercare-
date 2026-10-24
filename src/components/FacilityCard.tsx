"use client";

import { useState } from "react";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import type { FacilityDTO } from "@/app/api/doctors/route";
import { kindLabel } from "@/lib/useFacilities";
import { Building2, Heart, Phone, MapPin } from "lucide-react";

// feeLabel returns a translation key (or raw fee text for confirmed paid fees).
export function feeLabel(f: FacilityDTO): { text: string; cls: string } {
  if (!f.feeVerified) return { text: "feeNotVerified", cls: "text-caution" };
  if (f.freeConfirmed) return { text: "feeFree", cls: "text-sage-700 font-extrabold" };
  return { text: f.feeText, cls: "font-bold" };
}

function shareText(f: FacilityDTO, t: (k: string) => string): string {
  const feeKey = feeLabel(f).text;
  return [
    `${f.name}${f.doctorName ? ` — Dr. ${f.doctorName}` : ""}`,
    f.specialty ? `${t("shareSpecialtyLabel")}: ${f.specialty}` : "",
    `${t("shareAddrLabel")}: ${f.address}, ${f.village ? f.village + ", " : ""}${f.block ? f.block + ", " : ""}${f.district}, ${f.state}`,
    f.phone ? `${t("sharePhoneLabel")}: ${f.phone}` : "",
    f.openingHours ? `${t("shareHoursLabel")}: ${f.openingHours}` : "",
    feeKey !== "feeNotVerified" ? `${t("shareFeeLabel")}: ${t(feeKey)}` : t("shareFeeUnverified"),
    f.mapUrl ? `${t("shareDirLabel")}: ${f.mapUrl}` : "",
    t("sharedFromApp"),
  ]
    .filter(Boolean)
    .join("\n");
}

export default function FacilityCard({ f }: { f: FacilityDTO }) {
  const { t, user } = useI18n();
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const fee = feeLabel(f);
  // kindLabel returns a kl_* key, or "lit:x" for kinds not in the dictionary.
  const kindL = (k: string) => (k.startsWith("lit:") ? k.slice(4) : t(k));

  async function save() {
    if (!user) return;
    try {
      await api("/api/favorites", { method: "POST", body: JSON.stringify({ facilityId: f.id }) });
      setSaved(true);
    } catch {
      /* stays unsaved */
    }
  }

  return (
    <article className="rounded-2xl border-2 border-sage-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        {/* Photograph or neutral placeholder — never a fake photo */}
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-sage-100 bg-sage-50">
          {f.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.photoUrl} alt={`${f.name} building`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid h-full w-full place-items-center text-sage-400" title={t("noPhotoNote")}>
              <Building2 size={32} aria-hidden />
              <span className="mt-0.5 text-[9px]">{t("noPhotoNote")}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold leading-snug">
            <Link href={`/doctors/${f.id}`} className="hover:text-rose-600">
              {f.name}
            </Link>
          </h3>
          <p className="text-xs font-semibold text-sage-700">
            {kindL(f.kind)} · {f.ownership === "government" ? t("government") : f.ownership === "private" ? t("private") : f.ownership}
            {f.specialty ? ` · ${f.specialty}` : ""}
            {f.isFemaleDoctor || f.femaleDoctorAvail ? ` ${t("femaleDoctorTag")}` : ""}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-ink/70">
            <MapPin size={12} className="me-1 inline" aria-hidden />
            {f.address}
            {f.village ? `, ${f.village}` : ""}, {f.block ? `${f.block}, ` : ""}{f.district}, {f.state}
          </p>
          <p className={`mt-1 text-sm ${fee.cls}`}>💰 {t(fee.text)}</p>
          {f.openingHours && <p className="text-xs text-ink/70">🕐 {f.openingHours}</p>}
          {f.qualifications && <p className="text-xs text-ink/70">🎓 {f.qualifications}</p>}
          {f.languagesSpoken.length > 0 && (
            <p className="text-xs text-ink/70">🗣 {t("speaksWord")} {f.languagesSpoken.join(", ")}</p>
          )}
          <p className="mt-1 text-[11px] text-ink/50">
            {f.lastVerifiedAt ? `${t("verifiedOnWord")} ${new Date(f.lastVerifiedAt).toLocaleDateString()}` : t("notFieldVerified")}
            {f.isSample && ` ${t("sampleRecordTag")}`}
          </p>
        </div>
      </div>

      {/* large action buttons */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {f.phone ? (
          <a
            href={`tel:${f.phone}`}
            className="col-span-1 flex items-center justify-center gap-1.5 rounded-xl bg-sage-600 px-3 py-3 text-sm font-extrabold text-white hover:bg-sage-700"
          >
            <Phone size={17} /> {t("callNow")}
          </a>
        ) : (
          <span className="col-span-1 flex items-center justify-center rounded-xl bg-sage-100 px-3 py-3 text-xs text-ink/50">
            {t("noPhoneListed")}
          </span>
        )}
        <a
          href={f.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${f.name} ${f.address} ${f.district}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-sage-200 px-3 py-3 text-sm font-bold hover:bg-sage-50"
        >
          🧭 {t("directions")}
        </a>
        <button
          onClick={save}
          disabled={!user || saved}
          className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-rose-200 px-3 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
        >
          <Heart size={16} style={{ fill: saved ? "currentColor" : "none" }} /> {saved ? t("saved") : t("saveBtn")}
        </button>
        <button
          onClick={() => setShareOpen((o) => !o)}
          aria-expanded={shareOpen}
          className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-sage-200 px-3 py-3 text-sm font-bold hover:bg-sage-50"
        >
          🔗 {t("share")}
        </button>
      </div>

      {/* review-before-send sharing */}
      {shareOpen && (
        <div className="mt-3 rounded-xl border-2 border-dashed border-sage-300 bg-cream p-3">
          <p className="mb-2 text-xs font-bold uppercase text-sage-700">{t("shareReview")}</p>
          <textarea
            readOnly
            rows={6}
            value={shareText(f, t)}
            className="mb-2 w-full rounded-lg border border-sage-200 bg-white p-2 text-xs"
            aria-label="Message preview"
          />
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText(f, t))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#25D366] px-3 py-2 text-sm font-bold text-white"
            >
              {t("whatsapp")}
            </a>
            <a
              href={`sms:?&body=${encodeURIComponent(shareText(f, t))}`}
              className="rounded-lg border-2 border-sage-300 px-3 py-2 text-sm font-bold"
            >
              {t("smsText")}
            </a>
            <button
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(shareText(f, t));
              }}
              className="rounded-lg border-2 border-sage-300 px-3 py-2 text-sm font-bold"
            >
              📋 {t("copyBtn")}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
