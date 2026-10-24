"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useSpeech } from "@/lib/useSpeech";
import { Mic, Search, X } from "lucide-react";

const DOCTOR_WORDS = ["doctor", "hospital", "clinic", "डॉक्टर", "अस्पताल", "डिस्पेंसरी", "gynecologist", "gyn", "phc", "health centre", "मरीज", "इलाज के लिए", "davakhana", "aspataal"];
const SAFETY_WORDS = ["safety", "help", "harass", "emergency", "suraksha", "सुरक्षा", "सहायता", "उत्पीड़न", "madi"];
const ADDICTION_WORDS = ["addiction", "quit", "rehab", "drug", "alcohol", "smoking", "lat", "नशा", "छोड़"];

export default function VoiceSearch() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const { listening, transcript, error, start, stop } = useSpeech(lang);
  const [review, setReview] = useState(false);

  // When speech lands, let the user see / correct it before searching.
  useEffect(() => {
    if (transcript) {
      setQ(transcript);
      setReview(true);
    }
  }, [transcript]);

  const runSearch = (query: string) => {
    const s = query.toLowerCase();
    setReview(false);
    if (!s.trim()) return;
    if (DOCTOR_WORDS.some((w) => s.includes(w))) router.push(`/doctors?q=${encodeURIComponent(query)}`);
    else if (SAFETY_WORDS.some((w) => s.includes(w))) router.push(`/safety?q=${encodeURIComponent(query)}`);
    else if (ADDICTION_WORDS.some((w) => s.includes(w))) router.push(`/journal`);
    else router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(q);
        }}
        className="flex items-center gap-1 rounded-full border border-sage-200 bg-white pe-1"
        role="search"
      >
        <Search size={18} className="ms-2 shrink-0 text-sage-500" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchHint")}
          aria-label={t("search")}
          className="w-full bg-transparent py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={listening ? stop : start}
          aria-label={t("micListen")}
          title={t("micListen")}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
            listening ? "animate-pulse bg-danger text-white" : "bg-rose-100 text-rose-600 hover:bg-rose-200"
          }`}
        >
          {listening ? <X size={16} /> : <Mic size={16} />}
        </button>
      </form>

      {error === "no-voice-for-language" && (
        <p className="absolute z-40 mt-1 w-full rounded-lg bg-caution/95 px-3 py-2 text-xs text-white shadow">
          {t("micUnsupported")}
        </p>
      )}
      {error === "unsupported" && (
        <p className="absolute z-40 mt-1 w-full rounded-lg bg-caution/95 px-3 py-2 text-xs text-white shadow">
          Voice input not available in this browser — please type. (Chrome/Edge support it.)
        </p>
      )}
      {error === "mic-error" && (
        <p className="absolute z-40 mt-1 w-full rounded-lg bg-caution/95 px-3 py-2 text-xs text-white shadow">
          Microphone error — check permission, or type instead.
        </p>
      )}

      {listening && (
        <p className="absolute z-40 mt-1 w-full rounded-lg bg-sage-600 px-3 py-2 text-xs text-white shadow" role="status">
          🔴 {t("listening")}
        </p>
      )}

      {review && transcript && (
        <div className="absolute z-40 mt-1 w-full rounded-xl border border-rose-200 bg-white p-2 shadow-lg">
          <p className="mb-1 text-[11px] font-semibold uppercase text-rose-500">You said — is this correct?</p>
          <p className="mb-2 text-sm font-medium">{transcript}</p>
          <div className="flex gap-2">
            <button onClick={() => runSearch(q)} className="flex-1 rounded-lg bg-sage-600 py-2 text-sm font-bold text-white">
              {t("search")}
            </button>
            <button
              onClick={() => {
                setReview(false);
                setQ("");
              }}
              className="rounded-lg border border-sage-200 px-3 py-2 text-sm"
            >
              {t("back")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
