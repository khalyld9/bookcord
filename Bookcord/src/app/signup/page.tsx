import { AuthShell } from "@/components/layout/auth-shell";
import { SignupForm } from "@/components/forms/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();

  const [yearLevelsResult, strandsResult] = await Promise.all([
    supabase
      .from("year_levels")
      .select("id, name")
      .order("name", { ascending: true }),

    supabase
      .from("strands")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  console.log("=================================");
  console.log("BOOKCORD SIGNUP DATABASE DEBUG");
  console.log("=================================");

  console.log("YEAR LEVELS:");
  console.log("DATA:", yearLevelsResult.data);
  console.log("ERROR:", yearLevelsResult.error);

  console.log("---------------------------------");

  console.log("STRANDS:");
  console.log("DATA:", strandsResult.data);
  console.log("ERROR:", strandsResult.error);

  console.log("=================================");

  return (
    <AuthShell
      title="Create an account"
      description="Register your student account"
    >
      <SignupForm
        yearLevels={yearLevelsResult.data ?? []}
        strands={strandsResult.data ?? []}
      />
    </AuthShell>
  );
}