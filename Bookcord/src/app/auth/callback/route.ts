import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/** Exchange Supabase email/OAuth callbacks for a cookie-backed session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const flowId = searchParams.get("sb_flow_id");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const recovery = searchParams.get("next") === "/reset-password";

  let target = `${origin}/books`;
  const supabase = await createClient();
  let userId: string | null = null;
  let authError = false;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );
    userId = data.user?.id ?? null;
    authError = Boolean(error);
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    userId = data.user?.id ?? null;
    authError = Boolean(error);
  } else {
    authError = true;
  }

  if (authError || !userId) {
    const fallback = recovery
      ? `${origin}/forgot-password?error=invalid-link`
      : `${origin}/login`;
    return NextResponse.redirect(fallback);
  }

  if (recovery || type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", userId)
    .single();

  if (!profile) {
    // Verified auth account without a profile: finish setup before entering.
    target = `${origin}/complete-profile`;
  } else if (profile.role === "ADMIN") {
    target = `${origin}/admin`;
  }

  return NextResponse.redirect(target);
}
