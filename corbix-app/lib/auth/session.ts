import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type AdminSession = {
  isAdmin: boolean;
};

const FALLBACK_SECRET = "0123456789abcdef0123456789abcdef";

export function getSessionOptions(): SessionOptions {
  return {
    password: process.env.SESSION_SECRET ?? FALLBACK_SECRET,
    cookieName: "corbix_admin_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  const store = await cookies();
  const session = await getIronSession<AdminSession>(store, getSessionOptions());
  if (typeof session.isAdmin !== "boolean") {
    session.isAdmin = false;
  }
  return session;
}

export function validateAdminCredentials(email: string, password: string) {
  const envEmail = process.env.ADMIN_EMAIL ?? "";
  const envPassword = process.env.ADMIN_PASSWORD ?? "";
  return email === envEmail && password === envPassword;
}

export async function saveSession(isAdmin: boolean) {
  const session = await getSession();
  session.isAdmin = isAdmin;
  await session.save();
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}
