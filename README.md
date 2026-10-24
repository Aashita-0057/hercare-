# HerCare+ 🌸

A multilingual women's healthcare, safety and wellness web app for India — built for the Smart India Hackathon prompt. Mobile-first, low-bandwidth friendly, 22 scheduled languages + English, voice in/out, and a strict rule: **the app never invents doctors, numbers or fees — all directory content in this build is clearly-labelled sample data.**

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (custom rose/sage/cream design tokens in `globals.css`) |
| Icons | lucide-react |
| Database | SQLite via Prisma 6.19 for development; Postgres is a one-line provider switch (`prisma/schema.prisma`) + `DATABASE_URL` change |
| Auth | Phone + OTP only (no passwords), httpOnly session cookie |
| Voice | Web Speech API (browser STT + TTS) — no server cost |

## Quick start (Windows / any OS)

```bash
npm install
npx prisma db push      # creates dev.db from schema
npx prisma db seed      # loads SAMPLE facilities, articles (en+hi), helplines, stories
npm run dev             # http://localhost:3000
```

The first run of `npx prisma generate` is implicit in `db push`. Node.js 20+ required (tested on 24.x).

## What works out of the box (no configuration)

- **Registration + OTP** in **DEV MODE**: no SMS credentials exist, so the OTP is shown on-screen under a loud banner. It is still a *real* OTP flow — hashed (scrypt), 5-minute expiry, 60 s resend cooldown, 5 wrong attempts max, 3 sends/hour per phone. In production (`NODE_ENV=production`) the dev code display is hard-disabled.
- **Language selection** — all 22 scheduled languages + English, native scripts, RTL for Urdu/Kashmiri/Sindhi. Full UI dictionaries: English, Hindi. Core-string dictionaries: Bengali, Marathi, Tamil, Telugu, Gujarati, Punjabi, Urdu. Everything else falls back to English **and the language screen says so honestly**.
- **Find Your Doctor** — offline-friendly State→District→Block→Village manual search (no GPS required), facility-type filters, honest fee states (`Free` only when confirmed, `Fee not verified` otherwise), placeholder art instead of fake photos, WhatsApp/SMS/copy share with preview, last-viewed list cached in `localStorage` for offline use.
- **Daily Wellness Journal** — 4-digit PIN (hashed server-side), separate 120-second sliding-window cookie, auto-lock, quick exit, 🍃/🪨 calendar, craving tracker, savings estimate, withdrawal-safety guide, SOS screen.
- **Safety** — 112/181/1098 etc. accessible **without login**, anonymous harassment report with consent + privacy-limitation disclosures, nearby help directory, evidence guide.
- **3-part Dashboard** — periods (predictions labelled estimates), pregnancy/newborn (maternal BP/weight/iron log with high-BP flag, infant log, IIP vaccine reminder, danger-sign cards), elder-care visual symptom checker with conservative GREEN/YELLOW/RED rules (`src/server/triage.ts`) — red always escalates to 112 and the colour never overrides emergency advice.
- **AI assistant** — rule-based red-flag detection runs *before and independent of* any model; without an API key the app answers from vetted written knowledge templates.
- **Global voice search** — mic activates only on tap; transcript is shown for review/correction before searching.

## External service integration points (documented, currently unconfigured)

Set these in `.env` (see `.env.example`). **Nothing fake is presented as operational — unconfigured services announce themselves as DEV MODE.**

### 1. SMS OTP — MSG91 (v2 "flow" API)
```
MSG91_AUTH_KEY=your_key
MSG91_SMS_FLOW_ID=flow_id      # a flow whose message uses {{otp}}
MSG91_SENDER_ID=HERCR+
```
`src/server/sms.ts` sends our generated code through the flow. Any OTP provider works — replace `sendOtpSms()`.

### 2. AI assistant — any OpenAI-compatible endpoint
```
AI_API_KEY=sk-...
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```
`src/server/assistant.ts` calls it with a strict safety system prompt; responses are re-checked by the emergency rule afterwards.

### 3. Database → PostgreSQL (production)
1. `provider = "postgresql"` in `prisma/schema.prisma`
2. `DATABASE_URL=postgresql://…`
3. `npx prisma db push`
4. Re-add `mode: "insensitive"` to the `contains` filters in `src/app/api/doctors/route.ts` (removed for SQLite).

## Honesty rules baked into the code

- Every seeded facility carries `isSample: true` → amber **DEMO DATA** banners everywhere it appears.
- Fee label logic in `src/app/api/doctors/route.ts` + `FacilityCard.tsx`: never shows "Free" unless `freeConfirmed`.
- No photo → neutral building icon, never a stock photo of a fake person.
- Recovery stories are `isIllustrative: true` and labelled — no fabricated testimonials presented as real.
- Helplines (112, 181, 1098, Kiran, MNAM Quitline, iCall) are the real public government numbers.

## Screens (43 routes)

Onboarding: `/` → `/verify-otp` → `/language` · Shell: `/home`, `/about`, `/neutral` (quick-exit decoy) · Doctor: `/doctors`, `/doctors/[id]` · Awareness: `/awareness`, `/awareness/[slug]` · Journal: `/journal`, `/journal/stories`, `/journal/guide`, `/journal/directory` · Safety: `/safety`, `/safety/report`, `/safety/nearby` · Dashboard: `/dashboard`, `/dashboard/periods`, `/dashboard/pregnancy`, `/dashboard/elder` · Account: `/profile`, `/profile/saved`, `/profile/privacy` · `/search` · APIs under `/api/*`.

## Known limitations (stated, not hidden)

- Quick exit does not erase browser history or protect a shared unlocked phone (the UI says so).
- Voice input availability depends on the browser's Speech Recognition support (Chrome/Edge best).
- The report form stores data in the app DB; a real deployment needs an attached response team.
- Dev-mode rate limiting is in-memory (per server process); production should use Redis/DB-backed counters.
