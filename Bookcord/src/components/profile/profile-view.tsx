import Link from "next/link";
import {
  BadgeCheck,
  History,
  LibraryBig,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { PasswordForm } from "@/components/forms/password-form";
import { ProfileForm } from "@/components/forms/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reveal } from "@/components/motion/reveal";
import { formatDate, initials } from "@/lib/utils";

export type ProfileActivity = {
  activeIssues: number;
  copiesBorrowed: number;
  returned: number;
};

export type ProfileViewOption = { id: string; name: string };

export type ProfileViewData = {
  fullName: string;
  email: string;
  studentId: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  memberSince: string | null;
  yearLevelId: string;
  yearLevelName: string | null;
  strandId: string;
  strandName: string | null;
  yearLevels: ProfileViewOption[];
  strands: ProfileViewOption[];
  activity: ProfileActivity;
  /** Changes when the profile is saved, so the form picks up new defaults. */
  revision: string;
};

function Panel({
  title,
  description,
  icon: Icon,
  delay = 0,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal
      as="section"
      delay={delay}
      className="rounded-3xl bg-card p-6 shadow-shelf ring-1 ring-border sm:p-8"
    >
      <header className="mb-6 flex flex-col gap-1.5">
        <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {Icon ? (
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          ) : null}
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      {children}
    </Reveal>
  );
}

function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-espresso-foreground/25 bg-espresso-foreground/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-espresso-muted">
      {children}
    </span>
  );
}

function ProfileHero({ profile }: { profile: ProfileViewData }) {
  const affiliation = [profile.yearLevelName, profile.strandName]
    .filter(Boolean)
    .join(" · ");

  const stats = [
    { label: "Checked out", value: profile.activity.activeIssues },
    { label: "Copies checked out", value: profile.activity.copiesBorrowed },
    { label: "Returned", value: profile.activity.returned },
  ];

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-espresso p-6 text-espresso-foreground shadow-shelf sm:p-8 lg:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <Avatar className="size-20 rounded-2xl ring-1 ring-espresso-foreground/25">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
            ) : null}
            <AvatarFallback className="bg-espresso-foreground/15 font-display text-2xl font-medium text-espresso-foreground">
              {initials(profile.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-espresso-muted">
              Account — Profile
            </p>
            <h1 className="mt-2 truncate font-display text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
              {profile.fullName}
            </h1>
            <p className="mt-1.5 truncate text-sm text-espresso-muted">
              {profile.email}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <HeroChip>
                {profile.role === "ADMIN" ? "Administrator" : "Student"}
              </HeroChip>
              <HeroChip>
                {profile.status === "ACTIVE" ? "Active" : "Disabled"}
              </HeroChip>
              {affiliation ? <HeroChip>{affiliation}</HeroChip> : null}
            </div>
          </div>
        </div>

        <dl className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-2xl bg-espresso-foreground/20 ring-1 ring-espresso-foreground/20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-espresso/70 px-4 py-4 backdrop-blur-sm sm:px-5"
            >
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-espresso-muted">
                {stat.label}
              </dt>
              <dd className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ProfileView({ profile }: { profile: ProfileViewData }) {
  const account = [
    { label: "Email", value: profile.email },
    { label: "Student ID", value: profile.studentId ?? "—" },
    { label: "Year level", value: profile.yearLevelName ?? "—" },
    { label: "Strand", value: profile.strandName ?? "—" },
    { label: "Role", value: profile.role === "ADMIN" ? "Administrator" : "Student" },
    { label: "Member since", value: formatDate(profile.memberSince) },
  ];

  const activityLinks = [
    { href: "/my-books", label: "Currently checked out", value: profile.activity.activeIssues },
    { href: "/history", label: "Copies checked out all time", value: profile.activity.copiesBorrowed },
    { href: "/history", label: "Returned", value: profile.activity.returned },
  ];

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <ProfileHero profile={profile} />
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Panel
            delay={100}
            title="Your details"
            description="Shown to librarians when you check out a textbook."
            icon={UserRound}
          >
            <ProfileForm
              revision={profile.revision}
              defaultValues={{
                fullName: profile.fullName,
                studentId: profile.studentId ?? "",
                yearLevelId: profile.yearLevelId,
                strandId: profile.strandId,
                avatarUrl: profile.avatarUrl ?? "",
              }}
              yearLevels={profile.yearLevels}
              strands={profile.strands}
            />
          </Panel>

          <Panel
            delay={200}
            title="Password"
            description="Use at least 8 characters."
            icon={ShieldCheck}
          >
            <PasswordForm />
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel delay={150} title="Account" icon={BadgeCheck}>
            <dl className="flex flex-col gap-4">
              {account.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="text-sm font-medium break-words">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel delay={250} title="Library activity" icon={LibraryBig}>
            <ul className="flex flex-col divide-y divide-border">
              {activityLinks.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3 py-3">
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-ochre-deep"
                  >
                    {item.label}
                  </Link>
                  <span className="font-display text-xl font-medium tabular-nums tracking-[-0.02em]">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/history"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
            >
              <History className="size-4" strokeWidth={1.75} aria-hidden="true" />
              View book history
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}
