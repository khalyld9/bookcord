import { AuthShell } from "@/components/layout/auth-shell";
import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create an account"
      actionLink={{ href: "/login", label: "Sign in" }}
    >
      <SignupForm />
    </AuthShell>
  );
}
