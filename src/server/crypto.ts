import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Hash an OTP/session token so plaintext never sits in the database. */
export function hashSecret(input: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(input, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyHash(input: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(input, salt, 32);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function generateOtp(): string {
  // Cryptographically random 6-digit code.
  const n = parseInt(randomBytes(3).toString("hex"), 16);
  return String(n % 1000000).padStart(6, "0");
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
