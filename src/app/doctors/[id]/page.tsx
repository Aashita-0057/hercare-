"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, useI18n } from "@/lib/i18n";
import FacilityCard from "@/components/FacilityCard";
import { PageSpinner } from "@/components/ui";
import { kindLabel } from "@/lib/useFacilities";

export default function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [data, setData] = useState<{ facility: unknown; verifications: { field: string; value: string; verifiedBy: string; verifiedAt: string }[] } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(`/api/doctors/${id}`)
      .then(setData)
      .catch(() => setMissing(true));
  }, [id]);

  if (missing)
    return (
      <div className="py-16 text-center">
        <p className="mb-4 font-bold">{t("noResults")}</p>
        <Link href="/doctors" className="rounded-xl bg-rose-500 px-5 py-2.5 font-bold text-white">
          {t("findDoctor")}
        </Link>
      </div>
    );

  if (!data) return <PageSpinner />;

  const f = data.facility as { photoPermission?: string | null; confidentialityInfo?: string | null; hasWomenWard?: boolean } & Record<string, never>;
  const kindL = (k: string) => (k.startsWith("lit:") ? k.slice(4) : t(k));

  return (
    <div className="space-y-4">
      <Link href="/doctors" className="text-sm font-bold text-sage-700">
        ← {t("findDoctor")}
      </Link>

      <FacilityCard f={data.facility as never} />

      <section className="rounded-2xl border-2 border-sage-200 bg-white p-4 text-sm">
        <h2 className="mb-2 font-extrabold">{t("facTypeHeading")} {kindL(kindLabel((data.facility as { kind: string }).kind))}</h2>
        {(f as { services?: string[] }).services && (f as { services?: string[] }).services!.length > 0 && (
          <>
            <h3 className="font-bold text-sage-700">{t("servicesAvailHeading")}</h3>
            <ul className="mt-1 list-inside list-disc">
              {(f as { services?: string[] }).services!.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </>
        )}
        {(f as { qualifications?: string | null }).qualifications && (
          <p className="mt-2">
            <span className="font-bold">{t("qualsWord")}</span> {(f as { qualifications?: string }).qualifications}
          </p>
        )}
        {(f as { doctorName?: string | null }).doctorName && (
          <p>
            <span className="font-bold">{t("doctorWord")}</span> Dr. {(f as { doctorName?: string }).doctorName}
            {(f as { isFemaleDoctor?: boolean }).isFemaleDoctor ? ` ${t("femaleWord")}` : ""}
          </p>
        )}
        {f.hasWomenWard && <p className="mt-1 font-semibold text-sage-700">{t("womenWardNote")}</p>}
        {f.confidentialityInfo && (
          <p className="mt-2 rounded-xl bg-rose-50 p-2 text-xs">🔒 {t("confidentialityWord")} {f.confidentialityInfo}</p>
        )}
        {f.photoPermission && <p className="mt-2 text-[11px] text-ink/50">{t("photoRightsWord")} {f.photoPermission}</p>}
      </section>

      <section className="rounded-2xl border-2 border-sage-200 bg-white p-4">
        <h2 className="mb-2 font-extrabold">{t("verifHistoryTitle")}</h2>
        {data.verifications.length === 0 ? (
          <p className="text-sm text-ink/60">{t("unverifiedTrustNote")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.verifications.map((v, i) => (
              <li key={i} className="rounded-lg bg-sage-50 p-2">
                <span className="font-bold">{v.field}</span> → “{v.value}” · {t("checkedByNote")} {v.verifiedBy} on{" "}
                {new Date(v.verifiedAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-ink/50">{t("wrongTellAdmin")}</p>
      </section>
    </div>
  );
}
