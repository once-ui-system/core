"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPassword,
  signIn,
  signUp,
  updatePassword,
  type FormState,
} from "@/app/auth/actions";

type Action = (s: FormState, fd: FormData) => Promise<FormState>;

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role="status" className={state.error ? "text-sm text-destructive" : "text-sm text-primary"}>
      {state.error ?? state.message}
    </p>
  );
}

function Form({
  action,
  submit,
  password = true,
  email = true,
  newPassword = false,
}: {
  action: Action;
  submit: string;
  password?: boolean;
  email?: boolean;
  newPassword?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const next = useSearchParams().get("next") ?? "";
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {email && (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      )}
      {password && (
        <div className="space-y-2">
          <Label htmlFor="password">{newPassword ? "New password" : "Password"}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={newPassword ? "new-password" : "current-password"}
          />
        </div>
      )}
      <Status state={state} />
      <Button type="submit" className="w-full" disabled={pending}>
        {submit}
      </Button>
    </form>
  );
}

export function AuthForms() {
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  return (
    <div className="space-y-4">
      {mode === "in" && <Form action={signIn} submit="Sign in" />}
      {mode === "up" && <Form action={signUp} submit="Create account" />}
      {mode === "forgot" && <Form action={forgotPassword} submit="Send reset link" password={false} />}
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        {mode !== "in" && (
          <button type="button" className="text-primary hover:underline" onClick={() => setMode("in")}>
            Sign in
          </button>
        )}
        {mode !== "up" && (
          <button type="button" className="text-primary hover:underline" onClick={() => setMode("up")}>
            Create an account
          </button>
        )}
        {mode !== "forgot" && (
          <button type="button" className="text-primary hover:underline" onClick={() => setMode("forgot")}>
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}

export function UpdatePasswordForm() {
  return <Form action={updatePassword} submit="Set new password" email={false} newPassword />;
}
