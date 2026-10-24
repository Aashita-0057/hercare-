/**
 * Clinically conservative rules used alongside the AI model.
 * These rules — not the AI — are the emergency-detection safeguard.
 * Red-flag symptoms ALWAYS escalate, even if other answers would
 * produce a lower risk colour. This tool never diagnoses.
 */

export type SymptomId =
  | "blurry_vision"
  | "joint_pain"
  | "dizziness"
  | "fever"
  | "weakness"
  | "headache"
  | "breathing"
  | "chest_pain"
  | "bleeding"
  | "consciousness"
  | "stroke_signs"
  | "other";

export const SYMPTOMS: { id: SymptomId; label: string; emoji: string }[] = [
  { id: "blurry_vision", label: "Blurry vision", emoji: "👁️" },
  { id: "joint_pain", label: "Joint pain", emoji: "🦵" },
  { id: "dizziness", label: "Dizziness", emoji: "😵" },
  { id: "fever", label: "Fever", emoji: "🌡️" },
  { id: "weakness", label: "Weakness", emoji: "🥱" },
  { id: "headache", label: "Headache", emoji: "🤕" },
  { id: "breathing", label: "Breathing difficulty", emoji: "😮‍💨" },
  { id: "chest_pain", label: "Chest pain", emoji: "❤️‍🩹" },
  { id: "bleeding", label: "Severe bleeding", emoji: "🩸" },
  { id: "consciousness", label: "Fainting / not conscious", emoji: "💫" },
  { id: "stroke_signs", label: "Face droop / one-side weakness / slurred speech", emoji: "🧠" },
  { id: "other", label: "Other symptoms", emoji: "❓" },
];

const RED: SymptomId[] = ["breathing", "chest_pain", "bleeding", "consciousness", "stroke_signs"];
const YELLOW: SymptomId[] = ["fever", "dizziness", "weakness", "blurry_vision", "joint_pain", "headache"];

export type TriageLevel = "green" | "yellow" | "red";

export function triage(symptoms: SymptomId[]): TriageLevel {
  if (symptoms.some((s) => RED.includes(s))) return "red";
  if (symptoms.length === 0) return "green";
  if (symptoms.some((s) => YELLOW.includes(s))) return "yellow";
  return "green";
}

/**
 * Red-flag keyword detection for the AI assistant, in English, Hindi and
 * a few common languages. Detection is intentionally broad — false
 * positives simply show the emergency option, never block routine help.
 */
const RED_FLAG_PHRASES = [
  // English
  "severe bleeding", "heavy bleeding", "can't breathe", "cannot breathe", "breathing difficulty",
  "chest pain", "unconscious", "passed out", "not conscious", "stroke", "slurred speech",
  "face drooping", "severe pain", "labour pain", "water broke", "fits", "seizure",
  "bleeding a lot", "poisoned", "suicide", "overdose",
  // Hindi (latin + devanagari)
  "saans nahi", "sans nahi aa", "khoon beh", "behoshi", "muh tedha", "aurat ko dard",
  "साँस नहीं", "खून", "बेहोश", "दरद ज़्यादा", "टीका लगना", "मिर्गी",
  // Others (common transliterations)
  "shwas tulta", "श्वास", "swasash nahi",
];

export function detectRedFlag(text: string): boolean {
  const lower = text.toLowerCase();
  return RED_FLAG_PHRASES.some((p) => lower.includes(p));
}

/** Pregnancy-specific escalation guidance (medically reviewed copy). */
export const PREGNANCY_WARNING_SIGNS = [
  "Heavy vaginal bleeding during pregnancy or after delivery",
  "Severe headache with blurred vision or swelling of face/hands",
  "Reduced or no fetal movement after 24 weeks",
  "Fever above 38°C, especially with rigors",
  "Leaking fluid before 37 weeks (water breaking early)",
  "Convulsions or loss of consciousness",
  "Severe abdominal pain that does not pass",
];

export const POSTPARTUM_WARNING_SIGNS = [
  "Bleeding that soaks more than one pad per hour",
  "Fever, foul-smelling discharge, or breast redness with pain",
  "Thoughts of harming yourself or the baby — seek help immediately",
  "Severe mood swings, not sleeping, or feeling unable to care for the baby",
  "Calf pain/swelling or chest pain (possible clot)",
];

export const INFANT_WARNING_SIGNS = [
  "Fast or difficult breathing, grunting, chest pulling in",
  "Blue lips or colour", "Not feeding or too weak to feed",
  "Convulsion or unusual sleepiness / difficult to wake",
  "Fewer than 6 wet nappies a day, sunken eyes", "Vomiting everything / diarrhoea with dry mouth",
];
