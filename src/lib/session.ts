import { cookies } from "next/headers";
import { getUser } from "@/lib/storage";

const SESSION_COOKIE = "docgen_session";
const ROLE_COOKIE = "docgen_role";
const SID_COOKIE = "docgen_sid";

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function createSession(userId: string, role: string, sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, getCookieOptions());
  cookieStore.set(ROLE_COOKIE, role, getCookieOptions());
  cookieStore.set(SID_COOKIE, sessionId, getCookieOptions());
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
  cookieStore.delete(SID_COOKIE);
}

export async function getSessionUser(allowInvalidated = false) {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionId = cookieStore.get(SID_COOKIE)?.value;
  
  if (!userId) return null;
  
  const user = await getUser(userId);
  if (!user) return null;

  // Enforce single session: if sid exists in DB and doesn't match current SID from cookie
  if (user.currentSessionId && sessionId !== user.currentSessionId) {
    if (allowInvalidated) {
      return { ...user, sessionInvalidated: true };
    }
    return null;
  }
  
  if (!sessionId) return null; // Fallback for old sessions without sid

  return user;
}
