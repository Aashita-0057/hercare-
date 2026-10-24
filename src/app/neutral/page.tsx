"use client";

import { useEffect, useState } from "react";

/**
 * Neutral decoy page for the panic/quick-exit button.
 * Deliberately boring and fully static-looking: no links back into the app,
 * no mention of health. Opening it is invisible to a casual onlooker.
 */
export default function NeutralPage() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-white text-slate-800">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <span className="text-xl font-extrabold">🌤 Weather Today</span>
        <span className="text-sm">{now}</span>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="rounded-3xl bg-white/70 p-8 text-center shadow">
          <p className="text-7xl">⛅</p>
          <p className="mt-2 text-5xl font-black">28°C</p>
          <p className="mt-1 font-semibold text-slate-500">Partly cloudy · Humidity 61% · Breeze from the west</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Mon", "🌦", "27°"],
            ["Tue", "☀️", "30°"],
            ["Wed", "☀️", "31°"],
            ["Thu", "⛈", "26°"],
          ].map(([d, e, tt]) => (
            <div key={d} className="rounded-2xl bg-white/70 p-4 text-center shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">{d}</p>
              <p className="text-3xl">{e}</p>
              <p className="font-extrabold">{tt}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          Simple forecast for everyone · updates every 30 minutes
        </p>
      </main>
    </div>
  );
}
