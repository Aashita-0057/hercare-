"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, api } from "@/lib/i18n";
import { useSpeech } from "@/lib/useSpeech";
import { X, Mic, Send, Phone } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
  emergency?: boolean;
}

const SUGGESTION_KEYS = ["assistantSug1", "assistantSug2", "assistantSug3", "assistantSug4"];

export default function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, speak, dir } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const { listening, transcript, start } = useSpeech(lang);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: `${t("assistantGreeting")} ${t("assistantDisclaimer")}`,
        },
      ]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  if (!open) return null;

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setInput("");
    setBusy(true);
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    try {
      const data = await api("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ messages: next.slice(-8), lang }),
      });
      const reply: Msg = { role: "assistant", content: data.reply, emergency: Boolean(data.emergency) };
      setMessages((m) => [...m, reply]);
      if (autoSpeak) speak(data.spokenText || data.reply);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: t("assistantOfflineError") },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      dir={dir}
      role="dialog"
      aria-label={t("aiAssistant")}
      className="fixed inset-0 z-[60] flex flex-col bg-white sm:inset-auto sm:bottom-4 sm:end-4 sm:h-[70vh] sm:w-[420px] sm:rounded-2xl sm:border-2 sm:border-sage-200 sm:shadow-2xl"
    >
      {/* header */}
      <div className="flex items-center gap-2 rounded-t-2xl bg-sage-600 px-4 py-3 text-white">
        <span aria-hidden>✨</span>
        <h2 className="flex-1 font-extrabold">{t("aiAssistant")}</h2>
        <label className="flex items-center gap-1 text-xs font-semibold">
          <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} className="h-4 w-4" />
          🔊
        </label>
        <button onClick={onClose} aria-label={t("back")} className="rounded-full p-1 hover:bg-white/20">
          <X size={20} />
        </button>
      </div>

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-cream p-4">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] ${
            m.role === "user" ? "ms-auto bg-rose-500 text-white" : "me-auto border border-sage-200 bg-white"
          }`}>
            {m.content}
            {m.emergency && (
              <div className="mt-3 rounded-xl border-4 border-danger bg-white p-3 text-center">
                <p className="mb-2 font-extrabold text-danger">{t("assistantMayBeEmergency")}</p>
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 text-lg font-extrabold text-white"
                >
                  <Phone size={20} /> {t("callEmergency")} (112)
                </a>
                <p className="mt-2 text-xs">{t("assistantStaySafe")}</p>
              </div>
            )}
          </div>
        ))}
        {busy && <p className="text-sm text-ink/50">{t("assistantThinking")}</p>}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTION_KEYS.map((s) => (
              <button key={s} onClick={() => send(t(s))} className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50">
                {t(s)}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* input */}
      <div className="flex items-center gap-1.5 border-t border-sage-100 p-2.5">
        <button
          onClick={listening ? undefined : start}
          aria-label={t("micListen")}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
            listening ? "animate-pulse bg-danger text-white" : "bg-rose-100 text-rose-600 hover:bg-rose-200"
          }`}
        >
          <Mic size={20} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={t("askAnything")}
          aria-label={t("askAnything")}
          className="min-w-0 flex-1 rounded-xl border-2 border-sage-200 px-3 py-2.5 text-[15px] outline-none focus:border-rose-400"
        />
        <button
          onClick={() => send(input)}
          aria-label={t("assistantSend")}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-600 text-white hover:bg-sage-700"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
