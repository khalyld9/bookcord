import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

const STAFF_COOKIE = "bookcord_staff_access";

function sessionToken() {
  const secret =
    process.env.STAFF_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "";
  return createHmac("sha256", secret)
    .update("bookcord-store-staff")
    .digest("hex");
}

export async function isValidStaffPasscode(value: string) {
  if (!/^\d{6}$/.test(value)) return false;

  const candidateHash = createHash("sha256").update(value).digest("hex");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("app_settings")
    .select("value_hash")
    .eq("key", "admin_passcode")
    .maybeSingle();

  if (error || !data?.value_hash || data.value_hash.length !== candidateHash.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(candidateHash),
    Buffer.from(data.value_hash),
  );
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
