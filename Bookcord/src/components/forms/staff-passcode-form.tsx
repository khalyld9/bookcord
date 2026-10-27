"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { KeyRound } from "lucide-react";

import { staffLogin } from "@/lib/actions/auth";

const initialState = { error: "" };

export function StaffPasscodeForm() {
  const [state, formAction, pending] = useActionState(staffLogin, initialState);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const formRef = useRef<HTMLFormElement>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const lastSubmitted = useRef("");

  const passcode = digits.join("");

  useEffect(() => {
    if (passcode.length !== 6 || pending || lastSubmitted.current === passcode) {
      return;
    }
    lastSubmitted.current = passcode;
    formRef.current?.requestSubmit();
  }, [passcode, pending]);

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    );
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const next = Array.from({ length: 6 }, (_, index) => pasted[index] ?? "");
    setDigits(next);
    inputs.current[Math.min(pasted.length, 6) - 1]?.focus();
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Enter your 6-digit admin passcode</p>
        <div className="grid grid-cols-6 gap-2 sm:gap-3" role="group" aria-label="Admin passcode">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              type="password"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              pattern="[0-9]"
              maxLength={1}
              required
              autoFocus={index === 0}
              value={digit}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              aria-label={`Admin passcode digit ${index + 1}`}
              className="aspect-square min-w-0 rounded-xl border border-input bg-card text-center font-mono text-xl font-semibold text-foreground outline-none transition-all focus:border-ochre focus:ring-4 focus:ring-ochre/15 sm:text-2xl"
            />
          ))}
        </div>
        <input type="hidden" name="passcode" value={passcode} />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-espresso text-base font-semibold text-espresso-foreground shadow-cta transition-all hover:brightness-110 active:translate-y-px disabled:opacity-70"
      >
        <KeyRound className="size-4" strokeWidth={2} />
        {pending ? "Checking…" : "Open admin dashboard"}
      </button>
    </form>
  );
}
