import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** OAuth providers land here with a code; swap it for a session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let target = `${origin}/books`;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_user_id", data.user.id)
        .single();

      if (!profile) {
        // First Google sign-in: finish the student profile before entering.
        target = `${origin}/complete-profile`;
      } else if (profile.role === "ADMIN") {
        target = `${origin}/admin`;
      }
    }
  }

  return NextResponse.redirect(target);
}
