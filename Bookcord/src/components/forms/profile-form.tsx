"use client";

import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";

import { updateProfile, type ProfileState } from "@/lib/actions/profile";

type Option = { id: string; name: string };

type ProfileFormProps = {
  defaultValues: {
    fullName: string;
    studentId: string;
    yearLevelId: string;
    strandId: string;
    avatarUrl: string;
  };
  yearLevels: Option[];
  strands: Option[];
  /** Bumping this remounts the form so saved values become the new defaults. */
  revision: string;
};

const initialState: ProfileState = {};

const fieldClasses =
  "w-full rounded-full border border-input bg-background px-5 py-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ochre focus:ring-4 focus:ring-ochre/15";

const labelClasses =
  "mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground";

export function ProfileForm({
  defaultValues,
  yearLevels,
  strands,
  revision,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form key={revision} action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="profile-full-name" className={labelClasses}>
          Full name
        </label>
        <input
          id="profile-full-name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          defaultValue={defaultValues.fullName}
          placeholder="Juan Dela Cruz"
          className={fieldClasses}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-student-id" className={labelClasses}>
            Student ID
          </label>
          <input
            id="profile-student-id"
            name="student_id"
            type="text"
            defaultValue={defaultValues.studentId}
            placeholder="2026-00001"
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="profile-avatar" className={labelClasses}>
            Avatar URL
          </label>
          <input
            id="profile-avatar"
            name="avatar_url"
            type="url"
            defaultValue={defaultValues.avatarUrl}
            placeholder="https://…"
            className={fieldClasses}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-year-level" className={labelClasses}>
            Year level
          </label>
          <select
            id="profile-year-level"
            name="year_level_id"
            defaultValue={defaultValues.yearLevelId}
            className={fieldClasses}
          >
            <option value="">Not set</option>
            {yearLevels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="profile-strand" className={labelClasses}>
            Strand
          </label>
          <select
            id="profile-strand"
            name="strand_id"
            defaultValue={defaultValues.strandId}
            className={fieldClasses}
          >
            <option value="">Not set</option>
            {strands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {state.success && state.message ? (
        <p className="rounded-2xl bg-sage/10 px-4 py-3 text-sm text-sage">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        style={{ backgroundImage: "var(--gradient-cta)" }}
        className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-primary-foreground shadow-cta transition-all hover:brightness-105 active:translate-y-px disabled:opacity-70 sm:w-auto sm:px-8"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <Save className="size-4" strokeWidth={2} />
        )}
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
