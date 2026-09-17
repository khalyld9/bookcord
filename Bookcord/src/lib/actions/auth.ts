"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

  if (user && !profile) {
    redirect("/complete-profile");
  }

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
   * Create the profile.
   *
   * If email confirmation is disabled, signUp returns a session and the
   * profile is inserted through the "profiles insert self" policy. When
   * confirmation is enabled there is no session yet: the visitor verifies
   * the email, signs in, and finishes the profile at /complete-profile
   * (the same path Google sign-ins use). No service-role key needed.
   */
  if (data.session) {
    const { error: profileError } = await supabase.from("profiles").insert({
      auth_user_id: data.user.id,
      full_name: fullName,
      student_id: studentId,
      email,
      year_level_id: parsed.data.year_level_id,
      strand_id: parsed.data.strand_id,
    });

    if (profileError && profileError.code !== "23505") {
      return {
        error: `Account was created, but your profile could not be created: ${profileError.message}`,
      };
    }

    revalidatePath("/", "layout");
    redirect("/books");
  }

  return {
    success: true,
    message:
      "Account created. Check your email to verify it, then sign in - you will finish your student profile on first login.",
  };
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  redirect("/login");
}

const completeProfileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name"),
  student_id: z.string().trim().min(1, "Student ID is required"),
  year_level_id: z.string().min(1, "Select a year level"),
  strand_id: z.string().min(1, "Select a strand"),
});

/**
 * First Google sign-in creates the auth account but no student profile.
 * The visitor (now signed in) completes it here; the "profiles insert
 * self" policy covers the insert.
 */
export async function completeProfile(
  _prevState: SignupState | null,
  formData: FormData,
) {
  const parsed = completeProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    student_id: formData.get("student_id"),
    year_level_id: formData.get("year_level_id"),
    strand_id: formData.get("strand_id"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid details",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in with Google first, then finish your profile." };
  }

  const { error } = await supabase.from("profiles").insert({
    auth_user_id: user.id,
    full_name: parsed.data.full_name,
    student_id: parsed.data.student_id,
    email: (user.email ?? "").toLowerCase(),
    year_level_id: parsed.data.year_level_id,
    strand_id: parsed.data.strand_id,
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/books");
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/books");
}
