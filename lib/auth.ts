import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "wr_admin";
export const CLIENT_COOKIE = "wr_client";
const ADMIN_SECONDS = 12 * 60 * 60;
const CLIENT_SECONDS = 30 * 24 * 60 * 60;
const WINDOW_MS = 15 * 60 * 1000;

function sessionSecret() {
  const value = process.env.SESSION_SECRET || process.env.DEMO_SESSION_SECRET;
  if (!value || Buffer.byteLength(value) < 32) throw new Error("Set SESSION_SECRET to a random value of at least 32 characters.");
  return value;
}
function sign(value: string) { return createHmac("sha256", sessionSecret()).update(value).digest("base64url"); }
function safeEqual(a: string, b: string) {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isLoopbackOrigin(value: string) {
  try { const url = new URL(value); return url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname); } catch { return false; }
}
/** APP_ORIGIN may list several comma-separated origins (custom domain + www + Railway domain). */
export function allowedOrigins(): string[] {
  const list = (process.env.APP_ORIGIN ?? "").split(",").map((item) => item.trim().replace(/\/$/, "")).filter(Boolean);
  if (process.env.RAILWAY_PUBLIC_DOMAIN) list.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
  return list.filter((value) => {
    try { const url = new URL(value); return url.origin === value && (url.protocol === "https:" || isLoopbackOrigin(value)); } catch { return false; }
  });
}
export function primaryOrigin(): string {
  const [first] = allowedOrigins();
  if (!first) throw new Error("Set APP_ORIGIN to the site's public https origin.");
  return first;
}
export function originAllowed(request: Request, requireOrigin = true) {
  const origin = request.headers.get("origin");
  if (!origin) return !requireOrigin;
  return allowedOrigins().includes(origin);
}

function secureCookie() {
  const local = process.env.NODE_ENV !== "production" && process.env.DEMO_INSECURE_COOKIES === "true" &&
    allowedOrigins().every(isLoopbackOrigin);
  return !local;
}
export function cookieHeader(name: string, value: string, maxAge: number) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureCookie() ? "; Secure" : ""}`;
}

// Simple in-memory brute-force limits (one replica).
const attempts = new Map<string, { count: number; resetAt: number }>();
export function tooManyAttempts(bucket: string, max: number) {
  const now = Date.now();
  const entry = attempts.get(bucket);
  if (!entry || entry.resetAt <= now) { attempts.set(bucket, { count: 0, resetAt: now + WINDOW_MS }); return false; }
  return entry.count >= max;
}
export function recordFailure(bucket: string) {
  const now = Date.now();
  const entry = attempts.get(bucket);
  if (!entry || entry.resetAt <= now) attempts.set(bucket, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count++;
}
export function clientKey(request: Request) {
  return (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
}

// --- Admin -----------------------------------------------------------------
export function adminPasswordMatches(candidate: unknown) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || configured.length < 8) throw new Error("Set ADMIN_PASSWORD (at least 8 characters) to enable the admin page.");
  if (typeof candidate !== "string" || candidate.length > 256) return false;
  return safeEqual(candidate, configured);
}
function passwordFingerprint() {
  return createHash("sha256").update(process.env.ADMIN_PASSWORD ?? "").digest("base64url").slice(0, 12);
}
export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + ADMIN_SECONDS;
  const payload = `admin.${passwordFingerprint()}.${expires}`;
  return { value: `${payload}.${sign(payload)}`, maxAge: ADMIN_SECONDS };
}
export async function isAdmin(): Promise<boolean> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "admin" || !/^\d+$/.test(parts[2])) return false;
  try {
    const payload = parts.slice(0, 3).join(".");
    if (!safeEqual(parts[3], sign(payload))) return false;
    // Changing ADMIN_PASSWORD signs every admin out.
    if (parts[1] !== passwordFingerprint()) return false;
  } catch { return false; }
  return Number(parts[2]) > Math.floor(Date.now() / 1000);
}

// --- Clients ---------------------------------------------------------------
function codeFingerprint(code: string) {
  return createHash("sha256").update(code).digest("base64url").slice(0, 12);
}
export function codesMatch(candidate: unknown, code: string) {
  if (typeof candidate !== "string") return false;
  return safeEqual(candidate.trim().toUpperCase().replace(/[\s-]/g, ""), code);
}
export function createClientSession(clientId: string, portalCode: string) {
  const expires = Math.floor(Date.now() / 1000) + CLIENT_SECONDS;
  const payload = `client.${clientId}.${codeFingerprint(portalCode)}.${expires}`;
  return { value: `${payload}.${sign(payload)}`, maxAge: CLIENT_SECONDS };
}
/** Returns the session's client id; the caller must check the code fingerprint against the current code. */
export async function clientSession(): Promise<{ clientId: string; codeFingerprint: string } | null> {
  const value = (await cookies()).get(CLIENT_COOKIE)?.value;
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 5 || parts[0] !== "client" || !/^[0-9a-f-]{36}$/i.test(parts[1]) || !/^\d+$/.test(parts[3])) return null;
  try {
    if (!safeEqual(parts[4], sign(parts.slice(0, 4).join(".")))) return null;
  } catch { return null; }
  if (Number(parts[3]) <= Math.floor(Date.now() / 1000)) return null;
  return { clientId: parts[1], codeFingerprint: parts[2] };
}
export function sessionMatchesCode(session: { codeFingerprint: string }, code: string) {
  return safeEqual(session.codeFingerprint, codeFingerprint(code));
}
