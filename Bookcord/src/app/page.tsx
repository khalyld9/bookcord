import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { getSessionProfile } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSessionProfile();

  if (session) {
    redirect(session.profile.role === "ADMIN" ? "/admin" : "/books");
  }

  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Reveal className="mb-6 flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          <span className="text-2xl font-bold">Bookcords</span>
        </Reveal>

        <Reveal as="header" delay={80}>
          <h1 className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
            Bookcords
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-4 max-w-xl text-lg font-normal text-muted-foreground">
            School library system for checking textbook stock and reserving
            titles.
          </p>
        </Reveal>

        <Reveal delay={240} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/login">
              Sign in
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/signup">Create an account</Link>
          </Button>
        </Reveal>

        <Reveal delay={320} className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link
            href="/login?desk=admin"
            className="font-semibold text-ochre-deep transition-colors hover:text-ochre"
          >
            Librarian sign in
          </Link>
          <Link
            href="/preview"
            className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore the guest preview
          </Link>
        </Reveal>
      </div>
    </main>
  );
}