import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { prisma } from "./db";

/**
 * Admin session handling.
 *
 * A signed, httpOnly JWT cookie — no session table to keep, and it survives
 * serverless cold starts. Only church staff ever authenticate; visitors never
 * have accounts, by design.
 */
const COOKIE_NAME = "dvmi_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Failing loudly beats silently signing every session with a known string.
    throw new Error("AUTH_SECRET is not set. Generate one with: openssl rand -base64 32");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  email: string;
};

/** Verify an email/password pair against the stored admin user. */
export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) {
    // Hash anyway so a missing account and a wrong password take the same time.
    await bcrypt.compare(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
    return null;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function createSession(userId: string, email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** The current session, or null when signed out or the token is bad. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    return { sub: payload.sub as string, email: payload.email as string };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
