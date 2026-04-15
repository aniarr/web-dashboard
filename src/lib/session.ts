import { cookies } from "next/headers";
import { getUser } from "@/lib/storage";

const SESSION_COOKIE = "docgen_session";
const ROLE_COOKIE = "docgen_role";

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function createSession(userId: string, role: "member" | "admin") {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, getCookieOptions());
  cookieStore.set(ROLE_COOKIE, role, getCookieOptions());
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;
  return getUser(userId);
}
