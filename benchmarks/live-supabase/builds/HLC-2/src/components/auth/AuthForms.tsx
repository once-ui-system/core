"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import type { FormState } from "@/app/(site)/auth/actions";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

function Messages({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error) return <p role="alert" className="text-sm text-destructive">{state.error}</p>;
  if (state.message) return <p role="status" className="text-sm text-muted-foreground">{state.message}</p>;
  return null;
}

function AuthForm({
  action,
  next,
  submit,
  children,
}: {
  action: Action;
  next?: string;
  submit: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-6">
      {next && <input type="hidden" name="next" value={next} />}
      <FieldGroup>{children}</FieldGroup>
      <Messages state={state} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait..." : submit}
      </Button>
    </form>
  );
}

function EmailField() {
  return (
    <Field>
      <Label htmlFor="email">Email</Label>
      <Input id="email" name="email" type="email" autoComplete="email" required />
    </Field>
  );
}

export function SignInForm({ action, next, error }: { action: Action; next?: string; error?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <AuthForm action={action} next={next} submit="Sign in">
        <EmailField />
        <Field>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
      </AuthForm>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <FieldDescription className="text-center">
        New here?{" "}
        <Link href="/auth/sign-up" className="text-primary hover:underline">
          Create an account
        </Link>
      </FieldDescription>
    </div>
  );
}

export function SignUpForm({ action }: { action: Action }) {
  return (
    <AuthForm action={action} submit="Create account">
      <EmailField />
      <Field>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <FieldDescription>At least 8 characters.</FieldDescription>
      </Field>
    </AuthForm>
  );
}

export function ForgotPasswordForm({ action }: { action: Action }) {
  return (
    <AuthForm action={action} submit="Send reset link">
      <EmailField />
    </AuthForm>
  );
}

export function UpdatePasswordForm({ action }: { action: Action }) {
  return (
    <AuthForm action={action} submit="Save new password">
      <Field>
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
    </AuthForm>
  );
}
