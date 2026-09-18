import { AuthShell } from "@/components/layout/auth-shell";
import { GoogleSignInButton } from "@/components/forms/oauth-buttons";
import { SignupForm } from "@/components/forms/signup-form";
import { getProfileOptions } from "@/lib/data/profiles";

export default async function SignupPage() {
  // ICT strand and Grade 11 / Grade 12 only, the same filtered provider the
  // profile form uses.
  const { yearLevels, strands } = await getProfileOptions();

  return (
    <AuthShell
      title="Create an account"
      actionLink={{ href: "/login", label: "Sign in" }}
    >
      <GoogleSignInButton />

      <div className="my-8 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or with email
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <SignupForm yearLevels={yearLevels} strands={strands} />
    </AuthShell>
  );
}
