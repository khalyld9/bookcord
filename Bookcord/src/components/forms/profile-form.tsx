"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, Save, Upload } from "lucide-react";

import { updateProfile, type ProfileState } from "@/lib/actions/profile";
import { initials } from "@/lib/utils";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultValues.avatarUrl || null,
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  function handleAvatarPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName(null);
      return;
    }
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoving(false);
  }

  return (
    <form key={revision} action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-espresso font-display text-lg font-medium text-espresso-foreground ring-1 ring-border"
        >
          {previewUrl && !removing ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob previews cannot go through next/image
            <img
              src={previewUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            initials(defaultValues.fullName)
          )}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label
            htmlFor="profile-avatar"
            className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-ochre"
          >
            <Upload className="size-4" aria-hidden="true" />
            Choose a photo
          </label>
          <input
            id="profile-avatar"
            name="avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarPick}
            className="sr-only"
          />
          <p className="text-xs text-muted-foreground">
            {fileName
              ? fileName
              : "PNG, JPG or WebP up to 2 MB. It shows up on your profile and in the header."}
          </p>

          {defaultValues.avatarUrl ? (
            <label className="flex w-fit items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                name="remove_avatar"
                checked={removing}
                onChange={(event) => {
                  setRemoving(event.target.checked);
                  if (event.target.checked) {
                    setFileName(null);
                    setPreviewUrl(null);
                  } else {
                    setPreviewUrl(defaultValues.avatarUrl || null);
                  }
                }}
                className="size-3.5 accent-[oklch(0.44_0.17_29)]"
              />
              Remove current photo
            </label>
          ) : null}
        </div>
      </div>

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
        className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-sm font-semibold text-espresso-foreground shadow-cta transition-all hover:brightness-110 active:translate-y-px disabled:opacity-70 sm:w-auto sm:px-8"
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
