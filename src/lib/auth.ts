/**
 * AUTH LOKAL — KompresNusa
 *
 * Menggantikan Neon Auth (butuh infra cloud) dengan sesi cookie
 * bertanda tangan HMAC-SHA256 — 100% berjalan mandiri di server.
 *
 * Kredensial admin dikonfigurasi lewat .env:
 *   CMS_ADMIN_EMAIL     — email login admin
 *   CMS_ADMIN_PASSWORD  — kata sandi admin (min. 8 karakter)
 *   CMS_SESSION_SECRET  — kunci HMAC sesi (opsional, ada fallback)
 */
import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

const COOKIE_NAME = 'jk_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export const ADMIN_LOGIN_PATH = '/admin/login';
export const AUTH_ROUTE_PATH = '/api/auth';

type SessionPayload = {
  email: string;
  name: string;
  exp: number; // epoch detik
};

export type AdminUser = {
  email: string;
  name: string;
};

function adminEmail(): string {
  return (process.env.CMS_ADMIN_EMAIL?.trim() || 'admin@juragankompresor.com').toLowerCase();
}

function adminPassword(): string {
  return process.env.CMS_ADMIN_PASSWORD?.trim() || 'kompresnusaadmin2026';
}

function sessionSecret(): string {
  return (
    process.env.CMS_SESSION_SECRET?.trim() ||
    'kompresnusa-fallback-secret-0f766e-14b8a6'
  );
}

export function authConfigured(): boolean {
  return true;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.trim().toLowerCase() === adminEmail());
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function createSessionToken(email: string, name: string): string {
  const payload: SessionPayload = {
    email: email.toLowerCase(),
    name,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const encoded = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload?.email || typeof payload.exp !== 'number') return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Ambil sesi dari cookie — TANPA cek role. */
export async function getSessionUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const payload = verifySessionToken(store.get(COOKIE_NAME)?.value);
  if (!payload) return null;
  return { email: payload.email, name: payload.name };
}

/** Ambil sesi admin — email harus terdaftar sebagai admin. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getSessionUser().catch(() => null);
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

export async function requireAdmin(): Promise<AdminUser | null> {
  const user = await getAdminUser();
  if (!user) {
    const { redirect } = await import('next/navigation');
    redirect('/admin/login');
  }
  return user;
}

export async function getCmsAdminSession(): Promise<AdminUser | null> {
  return getAdminUser();
}

/** Server action: keluar dari sesi admin. */
export async function signOutAction() {
  'use server';
  const store = await cookies();
  store.delete(COOKIE_NAME);
  const { redirect } = await import('next/navigation');
  redirect('/admin/login');
}

/** Endpoint GET ringan untuk /api/auth — status sesi. */
export async function GET() {
  const user = await getAdminUser().catch(() => null);
  return new Response(JSON.stringify({ authenticated: Boolean(user), user }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
