import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const STAFF_COOKIE = "bookcord_staff_access";

function sessionToken() {
  const secret = process.env.STAFF_SESSION_SECRET ?? process.env.STAFF_PASSCODE ?? "";
  return createHmac("sha256", secret)
    .update("bookcord-store-staff")
    .digest("hex");
}

export function isValidStaffPasscode(value: string) {
  const expected = process.env.STAFF_PASSCODE ?? "";
  if (!/^\d{6}$/.test(value) || !/^\d{6}$/.test(expected)) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function grantStaffAccess() {
  const cookieStore = await cookies();
  cookieStore.set(STAFF_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearStaffAccess() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE);
}

export async function hasStaffAccess() {
  const value = (await cookies()).get(STAFF_COOKIE)?.value;
  const expected = sessionToken();
  if (!value || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
