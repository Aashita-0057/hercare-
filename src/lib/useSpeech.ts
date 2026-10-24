"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { localeFor, LANG_MAP } from "./languages";

/* Minimal Web Speech API typings (not in standard TS lib). */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionLike) | null;
}

/**
 * One-shot speech recognition. Microphone access happens ONLY while the
 * user has the session open (tapped the mic); nothing runs in background.
 */
export function useSpeech(lang: string) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const supported = useRef(Boolean(getRecognitionCtor())).current;

  useEffect(() => () => recRef.current?.stop(), []);

  const start = useCallback(() => {
    setError(null);
    setTranscript(null);
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("unsupported");
      return;
    }
    if (!LANG_MAP[lang]?.voice) {
      setError("no-voice-for-language");
      return;
    }
    const rec = new Ctor();
    rec.lang = localeFor(lang);
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e) => {
      const first = e.results[0];
      setTranscript(String(first[0].transcript));
    };
    rec.onend = () => setListening(false);
    rec.onerror = (err) => {
      setError("mic-error");
      setListening(false);
      void err;
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop(), []);

  return { supported, listening, transcript, error, start, stop };
}
