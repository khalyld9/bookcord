import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSessionProfile();

  if (session) {
    redirect(session.profile.role === "ADMIN" ? "/admin" : "/books");
  }

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          <span className="text-2xl font-bold">Bookcord</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Bookcord
        </h1>

        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          School library system for checking textbook stock and reserving
          titles.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/login">
              Sign in
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/signup">Create an account</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}