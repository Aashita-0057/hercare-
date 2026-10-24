"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

export function Spinner() {
  return <Loader2 className="animate-spin text-rose-500" size={28} aria-label="Loading" />;
}

export function PageSpinner() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spinner />
    </div>
  );
}

/** Big tappable homepage block card with icon, title, subtitle. */
export function BigCard({
  href,
  title,
  subtitle,
  emoji,
  tone = "rose",
  extra,
}: {
  href?: string;
  onClick?: () => void;
  title: string;
  subtitle: string;
  emoji: string;
  tone?: "rose" | "sage" | "cream" | "plum" | "rosedeep";
  extra?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    rose: "bg-rose-100 border-rose-200 hover:bg-rose-200",
    sage: "bg-sage-100 border-sage-200 hover:bg-sage-200",
    cream: "bg-cream border-sage-200 hover:bg-sage-50",
    plum: "bg-rose-700 border-rose-700 text-white hover:bg-rose-600",
    rosedeep: "bg-rose-500 border-rose-500 text-white hover:bg-rose-600",
  };
  const cls = `block w-full rounded-2xl border-2 p-5 text-start shadow-sm transition ${tones[tone]}`;
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden>
          {emoji}
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-extrabold leading-snug">{title}</h3>
          <p className={`text-sm ${tone === "plum" || tone === "rosedeep" ? "text-white/85" : "text-ink/70"}`}>{subtitle}</p>
        </div>
        <span className="text-2xl" aria-hidden>
          {">"}
        </span>
      </div>
      {extra}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={cls}>
      {inner}
    </div>
  );
}

/** Honest banners: dev-mode / sample data / notice. */
export function Banner({ kind, text }: { kind: "dev" | "sample" | "caution" | "info"; text: string }) {
  const map = {
    dev: "bg-sage-600 text-white",
    sample: "bg-caution text-white",
    caution: "bg-danger text-white",
    info: "bg-rose-100 text-rose-700",
  } as const;
  return (
    <p role="note" className={`rounded-xl px-4 py-2 text-center text-xs font-bold ${map[kind]}`}>
      {text}
    </p>
  );
}

export function Field({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-ink">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border-2 border-sage-200 bg-white px-4 py-3 text-lg outline-none focus:border-rose-400"
      />
      {hint && <span className="mt-1 block text-xs text-ink/60">{hint}</span>}
    </label>
  );
}

export function PrimaryButton({
  children,
  loading,
  tone = "rose",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; tone?: "rose" | "sage" | "danger" }) {
  const tones = {
    rose: "bg-rose-500 hover:bg-rose-600 text-white",
    sage: "bg-sage-600 hover:bg-sage-700 text-white",
    danger: "bg-danger hover:bg-danger-dark text-white",
  } as const;
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`w-full rounded-xl px-5 py-3 text-lg font-extrabold shadow transition disabled:opacity-60 ${tones[tone]} ${className}`}
    >
      {loading ? "…" : children}
    </button>
  );
}

/** 404-style fallback for unknown routes. */
export function NotFoundish() {
  const { t } = useI18n();
  return (
    <div className="grid place-items-center gap-4 py-20 text-center">
      <p className="text-5xl" aria-hidden>
        🌼
      </p>
      <p className="text-lg font-bold">{t("notFoundPage")}</p>
      <Link href="/home" className="rounded-xl bg-rose-500 px-6 py-3 font-bold text-white">
        {t("goHome")}
      </Link>
    </div>
  );
}
