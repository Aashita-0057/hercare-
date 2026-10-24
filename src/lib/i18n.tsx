"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { dirFor, localeFor } from "./languages";
import { translate } from "./translations";

export interface ApiUser {
  id: string;
  name: string;
  phone: string;
  languageCode: string;
  dialect?: string | null;
  previousDailySpend?: number | null;
  hasPin?: boolean;
}

interface Ctx {
  user: ApiUser | null;
  loadingUser: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  lang: string;
  dir: "ltr" | "rtl";
  setLanguage: (code: string) => Promise<void>;
  t: (key: string) => string;
  speak: (text: string) => void;
  stopSpeak: () => void;
  speaking: boolean;
  spokenText: string | null;
  online: boolean;
}

const I18nContext = createContext<Ctx | null>(null);

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <AppProviders>");
  return ctx;
}

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status, data });
  return data;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [lang, setLangState] = useState<string>("en");
  const [speaking, setSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize language from localStorage on client mount
  useEffect(() => {
    const saved = localStorage.getItem("hc_lang");
    if (saved) {
      setLangState(saved);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api("/api/auth/me");
      setUser(user);
      if (user?.languageCode) {
        setLangState(user.languageCode);
        localStorage.setItem("hc_lang", user.languageCode);
      }
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const dir = useMemo(() => dirFor(lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    refreshUser();
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [refreshUser]);

  const setLanguage = useCallback(async (code: string) => {
    setLangState(code);
    localStorage.setItem("hc_lang", code);
    document.documentElement.lang = code;
    document.documentElement.dir = dirFor(code);
    try {
      await api("/api/auth/language", {
        method: "POST",
        body: JSON.stringify({ languageCode: code }),
      });
    } catch {
      // Offline or guest mode, stored in localStorage
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = localeFor(lang);
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(u.lang.slice(0, 2).toLowerCase()));
      if (match) u.voice = match;
      u.rate = 0.95;
      u.onend = () => {
        setSpeaking(false);
        setSpokenText(null);
      };
      utterRef.current = u;
      setSpeaking(true);
      setSpokenText(text);
      window.speechSynthesis.speak(u);
    },
    [lang]
  );

  const stopSpeak = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
    setSpokenText(null);
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  const logout = useCallback(async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ user, loadingUser, refreshUser, logout, lang, dir, setLanguage, t, speak, stopSpeak, speaking, spokenText, online }),
    [user, loadingUser, refreshUser, logout, lang, dir, setLanguage, t, speak, stopSpeak, speaking, spokenText, online]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
