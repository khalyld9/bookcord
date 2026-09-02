"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function login(
  _prevState: { error: string },
  formData: FormData,
) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Invalid login details",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: "Invalid email or password",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role, status")
        .eq("auth_user_id", user.id)
        .single()
    : { data: null };

  if (profile?.status === "DISABLED") {
    await supabase.auth.signOut();

    return {
      error:
        "This account has been disabled. Contact an administrator.",
    };
  }

  revalidatePath("/", "layout");

  redirect(profile?.role === "ADMIN" ? "/admin" : "/books");
}

const signupSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Enter your full name"),

    student_id: z
      .string()
      .trim()
      .min(1, "Student ID is required"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirm_password: z.string(),

    year_level_id: z
      .string()
      .min(1, "Select a year level"),

    strand_id: z
      .string()
      .min(1, "Select a strand"),
  })
  .refine(
    (data) => data.password === data.confirm_password,
    {
      message: "Passwords do not match",
      path: ["confirm_password"],
    },
  );

export type SignupState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function signup(
  _prevState: SignupState,
  formData: FormData,
) {
  const parsed = signupSchema.safeParse({
    full_name: formData.get("full_name"),
    student_id: formData.get("student_id"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    year_level_id: formData.get("year_level_id"),
    strand_id: formData.get("strand_id"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Invalid registration details",
    };
  }

  const supabase = await createClient();

  const email = parsed.data.email.toLowerCase().trim();
  const fullName = parsed.data.full_name.trim();
  const studentId = parsed.data.student_id.trim();

  /*
   * Create Supabase Auth account.
   */
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
  });

  if (error) {
    console.error("SUPABASE SIGNUP ERROR:", error);

    return {
      error: error.message,
    };
  }

  if (!data.user) {
    console.error("SUPABASE SIGNUP: No user returned");

    return {
      error:
        "Unable to create your account. Please try again.",
    };
  }

  /*
   * Create the user's profile.
   *
   * The server action runs while the visitor is still anonymous
   * (email confirmation is enabled, so signUp does not return a
   * session). The normal Supabase client is therefore subject to the
   * "profiles insert self" RLS policy and cannot insert the row.
   *
   * Use the service-role admin client instead, which is trusted
   * server-side code and bypasses RLS.
   */
  let profileError: { message: string } | null = null;

  try {
    const admin = createAdminClient();

    ({ error: profileError } = await admin.from("profiles").insert({
      auth_user_id: data.user.id,
      full_name: fullName,
      student_id: studentId,
      email,
      year_level_id: parsed.data.year_level_id,
      strand_id: parsed.data.strand_id,
      role: "USER",
    }));
  } catch (err) {
    console.error(
      "ADMIN CLIENT ERROR (is SUPABASE_SERVICE_ROLE_KEY set?):",
      err,
    );

    return {
      error:
        "Your Supabase service role key is missing from the server environment. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server.",
    };
  }

  if (profileError) {
    console.error("PROFILE INSERT ERROR:", profileError);

    return {
      error:
        `Account was created, but your profile could not be created: ${profileError.message}`,
    };
  }

  revalidatePath("/", "layout");

  /*
   * Email confirmation is enabled.
   */
  if (!data.session) {
    return {
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account before logging in.",
    };
  }

  /*
   * Email confirmation is disabled.
   */
  redirect("/books");
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  redirect("/login");
}
