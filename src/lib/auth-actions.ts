'use server';

/**
 * Server actions login CMS — Kompresa.
 * Memisahkan lapisan aksi dari lapisan helper auth agar
 * client component dapat memanggil tanpa menarik node:crypto.
 */
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const COOKIE_NAME = 'jk_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function adminEmail(): string {
  return (process.env.CMS_ADMIN_EMAIL?.trim() || 'admin@kompresa.com').toLowerCase();
}

function adminPassword(): string {
  return process.env.CMS_ADMIN_PASSWORD?.trim() || 'kompresaadmin2026';
}

function sessionSecret(): string {
  return (
    process.env.CMS_SESSION_SECRET?.trim() ||
    'kompresa-fallback-secret-0f766e-14b8a6'
  );
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function createSessionToken(email: string, name: string): string {
  const payload = {
    email: email.toLowerCase(),
    name,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', sessionSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export async function signInAction(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cleanEmail = String(email ?? '').trim().toLowerCase();
  const cleanPassword = String(password ?? '');

  const emailOk = safeEqual(cleanEmail, adminEmail());
  const passwordOk = safeEqual(cleanPassword, adminPassword());

  if (!emailOk || !passwordOk) {
    return { ok: false, error: 'Email atau kata sandi tidak sesuai. Periksa kembali lalu coba lagi.' };
  }

  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(cleanEmail, 'Admin Kompresa'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  return { ok: true };
}
