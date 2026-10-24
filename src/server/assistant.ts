/**
 * AI health assistant backend.
 *
 * 1. Emergency red flags are detected by the RULES in triage.ts — never by
 *    the model alone — and short-circuit every answer with call-112 guidance.
 * 2. If AI_API_KEY is configured, an OpenAI-compatible model answers with a
 *    strict safety system prompt (no diagnosis, no medication dosing, always
 *    Indian context, escalate emergencies, never contact third parties).
 * 3. Without an API key the assistant runs in built-in knowledge mode using
 *    vetted educational templates. The UI states which mode is active.
 */

import { detectRedFlag } from "./triage";
import { prisma } from "./db";
import { translate } from "@/lib/translations";
import { LANG_MAP } from "@/lib/languages";

export interface AssistantResult {
  reply: string;
  emergency: boolean;
  spokenText?: string;
  mode: "ai" | "knowledge";
}

const SYSTEM_PROMPT = `You are HerCare+, a compassionate women's health companion for users in India, many of them rural, first-time phone users, speaking one of 22 Indian languages.
Rules you never break:
- Never diagnose. Never suggest specific medicine doses. Explain possibilities in plain language and point to verified care.
- If the user describes a possible emergency (severe bleeding, breathing difficulty, chest pain, unconsciousness, stroke signs, severe pregnancy bleeding, self-harm), your FIRST sentence must tell them to call 112 now.
- Never shame, blame or pressure. Never tell a survivor of abuse to report to anyone against her will. Never contact family or third parties.
- Respect cultural context; be warm and brief; answer in the user's language when you can.
- You are not a lawyer, not a doctor, not an emergency dispatcher.`;

interface KB {
  match: RegExp;
  answer: string;
}

const KNOWLEDGE: KB[] = [
  {
    match: /anemia|anaemia|khoon|खून की कमी|hemoglobin/i,
    answer: `Anemia means the blood carries less oxygen — it is very common in women and is usually treatable.
Signs: tiredness, paleness, breathlessness on climbing stairs, dizziness, brittle nails.
What helps: green leafy vegetables (palak, methi), beans and chana, jaggery with groundnut, citrus (aamla, nimbu) with meals, cooking in iron kadhai. Tea/coffee within 2 hours of meals reduces iron absorption.
Important: an ASHA worker or anganwadi can arrange a free hemoglobin test, and iron tablets are given free at government facilities in many districts. See a doctor if you feel very breathless or faint.
Want me to find the nearest testing facility? Tap Find Doctor and choose Government + General physician.`,
  },
  {
    match: /period|menstrual|maasik|मासिक|mahavari|cramp/i,
    answer: `Periods are a normal sign that your body is working. Cycle length anywhere from 21 to 35 days is normal; bleeding 2–7 days.
For pain: rest, a hot water bottle on the lower belly, gentle walking, and paracetamol as per the strip's label if needed — a pharmacist or doctor can confirm what suits you.
See a health worker if: bleeding soaks a pad every hour, pain stops daily work even with medicine, cycles suddenly change for 3 months, or you bleed after sex.
Change pads/cloth every 4–6 hours, wash with soap and water and dry cloth in sunlight. Periods are NOT impure — that myth keeps women from care.`,
  },
  {
    match: /pregnan|garbh|गर्भ|delivery|labour|trimester/i,
    answer: `Every pregnancy deserves at least 4 antenatal checkups (many get 8+). Government facilities offer free or ₹20-registration antenatal care, iron-folic acid tablets, andJanani Suraksha Yojana support for institutional delivery.
Go IMMEDIATELY to a health facility if there is: heavy bleeding, severe headache with blurred vision, swelling of face/hands, baby stops moving (after 24 weeks), leaking fluid early, or convulsions.
First months: rest, small frequent meals for nausea, no tobacco/alcohol, and folic acid tablets from the Anganwadi/PHC.
Shall I help you find a government facility with a female doctor near you?`,
  },
  {
    match: /sad|depress|rona|cry|alone|thak|postpartum|suicide|hopeless|उदास|अकेला/i,
    answer: `Thank you for telling me — feeling very sad, anxious, or exhausted after delivery is more common than people say (about 1 in 7 mothers). It is an illness, not a weakness, and it gets better with support.
Today: tell one person you trust how you feel; try to sleep when the baby sleeps; eat one warm meal with someone beside you.
Please speak to a health worker or counsellor soon — Kiran mental health helpline 1800-599-0019 (free, 24×7, many Indian languages) or iCall 9152987821 (Mon–Sat).
If you have thoughts of harming yourself, call 112 now. I will never contact your family without you asking — and I won't pressure you to tell anyone either.`,
  },
  {
    match: /quit|addiction|nasha|नशा|smok|alcohol|cigarette|tobacco|gutkha|drug|rehab/i,
    answer: `Deciding to cut down or quit is a brave, healthy step — and most women need some help to do it; that is normal, not failure.
What works: set a date, remove triggers from sight, drink water when a craving hits (cravings peak and fall within ~15 minutes), tell one supportive person, and use the Daily Wellness Journal here to mark good days (🍃) and difficult days (🪨) without shame.
Free help: National Tobacco Quitline 1800-11-2356; de-addiction centres at government medical colleges (find them under Recovery Support in the Journal).
⚠️ Alcohol and sleeping-pill withdrawal can be dangerous to stop suddenly at home — a doctor can make it safe. Ask about that before stopping on your own.`,
  },
  {
    match: /harass|abus|eve teasing|stalk|unsafe|panic|safety|suraksha|उत्पीड़न|touch/i,
    answer: `I am really glad you told someone. Whatever happened is NOT your fault — not your dress, your route, or your trust.
You can:
• Call 112 if you feel danger right now.
• Women's helpline 181 (free; state availability may vary).
• Open the Safety tab here for a report form you can fill ANONYMOUSLY, and Nearby Help for support centres.
If it happened online or at work, saving screenshots/messages safely can help later — but your immediate safety comes first. I will not contact anyone about you; the choice and the timing are fully yours.`,
  },
  {
    match: /doctor|hospital|clinic|paas|nearby/i,
    answer: `I can help you find care. Open Find Your Doctor and:
1. Choose your State, District and Block — typing your village works too, no GPS needed.
2. Filter: Government / Female doctor / Gynecologist / PHC.
3. Every card shows a tap-to-call button, timings and whether the fee is verified.
If you tell me your district and what kind of doctor you need, I will point you the right way in the app.`,
  },
  {
    match: /menopaus|period stop|abodh|hot flash/i,
    answer: `Menopause (periods stopping for 12 months, often 45–55) is a normal stage, not an illness. Hot flushes, poor sleep and mood changes are common.
Help: cool clothing and water handy, daily walk or yoga, calcium-rich food (curd, ragi, sesame), and still use contraception until 1 year without periods if you do not want pregnancy.
See a doctor for: bleeding AFTER menopause (important — always get this checked), flushing that wrecks daily life, or severe low mood. Government facilities have a pre-consultation slot per OPD day.`,
  },
  {
    match: /breast|lump|kanker|cancer|cervical|screening/i,
    answer: `Checking yourself is easy and private:
• Breast self-awareness: once a month, a week after periods end. Look in the mirror, then feel each breast in circles — new lump, skin change, or nipple discharge → see a doctor. Most lumps are NOT cancer, but all new lumps deserve a check.
• Cervical screening: VIA/VAT test is free at government facilities for women 30–49 — ask your ANM or visit a district hospital OPD once in 5 years.
• Oral cancer: if you use tobacco/gutkha, get a free mouth check at a PHC yearly.
Early checks save lives and are far less painful than late treatment.`,
  },
];

const FALLBACK = `I understood you, but I am strongest on: periods and hygiene, pregnancy and newborn care, anemia and nutrition, menopause, quitting habits (alcohol/tobacco), safety after harassment, breast and cervical checks, and finding nearby doctors.
Ask one of those — or tap Find Your Doctor / the Safety tab. Remember: I am not a doctor; for anything sudden or severe, call 112.`;

function knowledgeAnswer(text: string): string {
  for (const kb of KNOWLEDGE) {
    if (kb.match.test(text)) return kb.answer;
  }
  return FALLBACK;
}

export async function askAssistant(messages: { role: string; content: string }[], lang: string): Promise<AssistantResult> {
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const def = LANG_MAP[lang];
  const langName = def ? `${def.name} (${def.native})` : "English";

  // ---- 1. Rule-based emergency check (always first, model-independent) ----
  if (detectRedFlag(last)) {
    const emergencyReply = translate(lang, "assistantEmergencyReply");
    return { reply: emergencyReply, emergency: true, spokenText: emergencyReply, mode: "knowledge" };
  }

  // ---- 2. Real AI model if configured ----
  if (process.env.AI_API_KEY) {
    try {
      const langDirective =
        lang && lang !== "en"
          ? `\n\nCRITICAL: The user's chosen language is ${langName}. Write your ENTIRE reply in ${langName}, using its native script. Do not answer in English.`
          : "";
      const res = await fetch(`${process.env.AI_API_BASE_URL || "https://api.openai.com/v1"}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [{ role: "system", content: SYSTEM_PROMPT + langDirective }, ...messages.slice(-10)],
          temperature: 0.4,
          max_tokens: 500,
        }),
      });
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        // Defence in depth: even the model's answer passes the red-flag rule.
        const emergency = detectRedFlag(content);
        return { reply: content, emergency, spokenText: content, mode: "ai" };
      }
    } catch {
      /* fall through to knowledge mode */
    }
  }

  // ---- 3. Built-in vetted knowledge mode ----
  // If a specific article matches, link it into the reply.
  const articleHint = await findArticleHint(last);
  const suffix = translate(lang, "assistantKnowledgeSuffix").replaceAll("{lang}", langName);
  const reply = knowledgeAnswer(last) + articleHint + `\n\n${suffix}`;
  return { reply, emergency: false, spokenText: reply, mode: "knowledge" };
}

async function findArticleHint(q: string): Promise<string> {
  try {
    const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 2);
    if (!words.length) return "";
    const art = await prisma.articleTranslation.findFirst({
      where: { OR: words.map((w) => ({ title: { contains: w } })) },
      include: { article: true },
    });
    if (art) return `\n📖 Read more: open "${art.title}" in Awareness Today.`;
  } catch {
    /* db optional */
  }
  return "";
}

export function assistantMode(): "ai" | "knowledge" {
  return process.env.AI_API_KEY ? "ai" : "knowledge";
}
