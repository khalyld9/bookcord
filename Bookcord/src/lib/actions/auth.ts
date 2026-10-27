"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeEmailHtml, sendTransactionalEmail } from "@/lib/email";
import {
  isSupabaseConfigured,
  SUPABASE_CONFIG_ERROR,
} from "@/lib/supabase/config";
import {
  clearStaffAccess,
  grantStaffAccess,
  isValidStaffPasscode,
} from "@/lib/staff-access";

function isStudentNumberConflict(error: {
  code?: string | null;
  message?: string;
  details?: string | null;
}) {
  if (error.code !== "23505") return false;
  const description = `${error.message ?? ""} ${error.details ?? ""}`;
  return /profiles_student_id_unique|student_id/i.test(description);
}

async function requestOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

async function sendWelcomeEmail(email: string, fullName: string) {
  const safeName = escapeEmailHtml(fullName);
  const siteUrl = await requestOrigin();
  await sendTransactionalEmail({
    to: email,
    subject: "Welcome to Bookcords",
    text: `Hi ${fullName}, your Bookcords bookstore account is ready. Browse the catalog at ${siteUrl}/books`,
    html: `<p>Hi ${safeName},</p><p>Your Bookcords bookstore account is ready.</p><p><a href="${siteUrl}/books">Browse the catalog</a></p>`,
    idempotencyKey: `welcome/${email.toLowerCase()}`,
  });
}

export async function staffLogin(
  _prevState: { error: string },
  formData: FormData,
) {
  const passcode = String(formData.get("passcode") ?? "");
  if (!/^\d{6}$/.test(passcode)) {
    return { error: "Enter the six-digit admin passcode." };
  }
  if (!(await isValidStaffPasscode(passcode))) {
    return { error: "Incorrect admin passcode." };
  }

  await grantStaffAccess();
  redirect("/admin");
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function login(
  _prevState: { error: string },
  formData: FormData,
) {
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_CONFIG_ERROR };
  }

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
      .min(2, "Enter your student number")
      .max(50, "Student number must be 50 characters or fewer"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirm_password: z.string(),

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
  if (!isSupabaseConfigured()) {
    return { error: SUPABASE_CONFIG_ERROR };
  }

  const parsed = signupSchema.safeParse({
    full_name: formData.get("full_name"),
    student_id: formData.get("student_id"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
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
    options: {
      emailRedirectTo: `${await requestOrigin()}/auth/callback`,
      data: {
        full_name: fullName,
        student_id: studentId,
      },
    },
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
   * If email confirmation is disabled, signUp returns a session and this
   * trusted server action creates the matching profile with the service
   * client. This avoids depending on the new session cookie being readable
   * during the same request while still fixing auth_user_id to data.user.id.
   * When confirmation is enabled there is no session yet: the visitor
   * verifies the email, signs in, and finishes at /complete-profile.
   */
  if (data.session) {
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .insert({
        auth_user_id: data.user.id,
        full_name: fullName,
        student_id: studentId,
        email,
      })
      .select("id")
      .single();

    if (profileError) {
      if (isStudentNumberConflict(profileError)) {
        return { error: "That student number is already registered." };
      }
      if (profileError.code !== "23505") {
        return {
          error: `Account was created, but your profile could not be created: ${profileError.message}`,
        };
      }
    }

    if (profile) await sendWelcomeEmail(email, fullName);

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
  await clearStaffAccess();
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  redirect("/login");
}

export type PasswordResetRequestState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function requestPasswordReset(
  _previous: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const parsed = z.string().trim().email("Enter a valid email address").safeParse(
    formData.get("email"),
  );
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const email = parsed.data.toLowerCase();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await requestOrigin()}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: "Could not send the reset email. Try again shortly." };

  // Keep the response enumeration-safe while leaving a security notice for
  // an existing account to see after its next successful sign-in.
  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (profile) {
      await admin.from("notifications").insert({
        profile_id: profile.id,
        type: "PASSWORD_RESET",
        title: "Password reset requested",
        body: "A password reset email was requested for your account.",
        href: "/profile",
      });
    }
  } catch {
    // Auth email delivery must not depend on optional in-app notifications.
  }

  return {
    success: true,
    message: "If an account exists for that email, a reset link is on its way.",
  };
}

const completeProfileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name"),
  student_id: z
    .string()
    .trim()
    .min(2, "Enter your student number")
    .max(50, "Student number must be 50 characters or fewer"),
});

/**
 * A verified auth account without a profile completes it here. The user is
 * resolved from Supabase Auth, then the trusted server action inserts only
 * that user's profile through the service client.
 */
export async function completeProfile(
  _prevState: SignupState | null,
  formData: FormData,
) {
  const parsed = completeProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    student_id: formData.get("student_id"),
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
    return { error: "Sign in first, then finish your profile." };
  }

  const email = (user.email ?? "").toLowerCase();
  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .insert({
      auth_user_id: user.id,
      full_name: parsed.data.full_name,
      student_id: parsed.data.student_id,
      email,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      if (isStudentNumberConflict(error)) {
        return { error: "That student number is already registered." };
      }
      redirect("/books");
    }
    return { error: error.message };
  }

  if (profile && email) await sendWelcomeEmail(email, parsed.data.full_name);

  revalidatePath("/", "layout");
  redirect("/books");
}
