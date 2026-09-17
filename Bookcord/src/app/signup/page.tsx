import { AuthShell } from "@/components/layout/auth-shell";
import { SignupForm } from "@/components/forms/signup-form";
import { getProfileOptions } from "@/lib/data/profiles";

export default async function SignupPage() {
  // ICT strand and Grade 11 / Grade 12 only — the same filtered provider the
  // profile form uses.
  const { yearLevels, strands } = await getProfileOptions();

  return (
    <AuthShell
      title="Create an account"
      description="Register with your student details — ICT, Grade 11 or 12."
      actionLink={{ href: "/login", label: "Sign in" }}
      switchPrompt="Already have an account?"
    >
      <SignupForm yearLevels={yearLevels} strands={strands} />
    </AuthShell>
  );
}
