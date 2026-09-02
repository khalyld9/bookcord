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
      description="Register your student account"
      actionLink={{ href: "/login", label: "Sign in instead" }}
    >
      <SignupForm yearLevels={yearLevels} strands={strands} />
    </AuthShell>
  );
}
