"use client"

import * as React from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "sonner"
import { CheckCircle2Icon, LockKeyholeIcon, ShieldCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"

const DEMO_EMAIL = "amara.okafor@northwind.example"
const DEMO_PASSWORD = "Northwind-2026"
const DEMO_CODE = "428193"
const RESEND_SECONDS = 30

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export default function Page() {
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [otpOpen, setOtpOpen] = React.useState(false)
  const [signedIn, setSignedIn] = React.useState(false)

  const [email, setEmail] = React.useState(DEMO_EMAIL)
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(true)
  const [loginError, setLoginError] = React.useState<string | null>(null)
  const [loginPending, setLoginPending] = React.useState(false)

  const [code, setCode] = React.useState("")
  const [otpError, setOtpError] = React.useState<string | null>(null)
  const [otpPending, setOtpPending] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loginPending) return
    setLoginError(null)
    if (!email.trim() || !password) {
      setLoginError("Enter your email and password to continue.")
      return
    }
    setLoginPending(true)
    await wait(700)
    setLoginPending(false)
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setLoginError("That email and password combination doesn't match our records.")
      return
    }
    setCode("")
    setOtpError(null)
    setCooldown(RESEND_SECONDS)
    setOtpOpen(true)
  }

  async function verify(value: string) {
    if (otpPending) return
    setOtpError(null)
    if (value.length !== 6) {
      setOtpError("Enter all 6 digits of your code.")
      return
    }
    setOtpPending(true)
    await wait(700)
    setOtpPending(false)
    if (value !== DEMO_CODE) {
      setOtpError("That code is incorrect or has expired. Try again.")
      setCode("")
      return
    }
    setOtpOpen(false)
    setLoginOpen(false)
    setPassword("")
    setCode("")
    setSignedIn(true)
    toast.success("Signed in", { description: `Welcome back, ${email}.` })
  }

  function handleResend() {
    if (cooldown > 0) return
    setCooldown(RESEND_SECONDS)
    setCode("")
    setOtpError(null)
    toast("New code sent", { description: "Check your authenticator or SMS messages." })
  }

  function handleSignOut() {
    setSignedIn(false)
    toast("Signed out")
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <section
        aria-labelledby="page-title"
        className="flex w-full max-w-md flex-col items-center gap-6 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {signedIn ? (
            <CheckCircle2Icon className="size-6" aria-hidden="true" />
          ) : (
            <LockKeyholeIcon className="size-6" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 id="page-title" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {signedIn ? "You're signed in" : "Northwind Console"}
          </h1>
          <p className="text-sm text-muted-foreground text-balance sm:text-base">
            {signedIn
              ? `Session active for ${email}. Two-step verification completed.`
              : "Manage deployments, billing and team access. Sign in with your password and a one-time code."}
          </p>
        </div>
        {signedIn ? (
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        ) : (
          <Button size="lg" onClick={() => setLoginOpen(true)}>
            Sign in
          </Button>
        )}
      </section>

      {/* Step 1: password */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to Northwind</DialogTitle>
            <DialogDescription>
              Enter your credentials. We'll ask for a verification code next.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} noValidate>
            <FieldGroup className="gap-5">
              <Field data-invalid={loginError ? true : undefined}>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={loginError ? true : undefined}
                  required
                />
              </Field>
              <Field data-invalid={loginError ? true : undefined}>
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={loginError ? true : undefined}
                  aria-describedby={loginError ? "login-error" : "login-hint"}
                  required
                />
                {loginError ? (
                  <FieldError id="login-error">{loginError}</FieldError>
                ) : (
                  <FieldDescription id="login-hint">
                    Demo password: <code className="font-mono">{DEMO_PASSWORD}</code>
                  </FieldDescription>
                )}
              </Field>
              <Field orientation="horizontal">
                <Checkbox
                  id="login-remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                <FieldLabel htmlFor="login-remember" className="font-normal">
                  Keep me signed in on this device
                </FieldLabel>
              </Field>
              <Button type="submit" disabled={loginPending} className="w-full">
                {loginPending && <Spinner />}
                {loginPending ? "Checking..." : "Continue"}
              </Button>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      {/* Step 2: OTP, stacked on top of the login dialog */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-full bg-muted sm:mx-0">
              <ShieldCheckIcon className="size-5" aria-hidden="true" />
            </div>
            <DialogTitle>Two-step verification</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app for {email}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void verify(code)
            }}
            noValidate
          >
            <FieldGroup className="gap-5">
              <Field data-invalid={otpError ? true : undefined}>
                <FieldLabel htmlFor="otp-code" className="sr-only">
                  Verification code
                </FieldLabel>
                <div className="flex justify-center">
                  <InputOTP
                    id="otp-code"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(v) => {
                      setCode(v)
                      if (otpError) setOtpError(null)
                    }}
                    onComplete={(v) => void verify(v)}
                    disabled={otpPending}
                    aria-invalid={otpError ? true : undefined}
                    aria-describedby={otpError ? "otp-error" : "otp-hint"}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} aria-invalid={otpError ? true : undefined} />
                      <InputOTPSlot index={1} aria-invalid={otpError ? true : undefined} />
                      <InputOTPSlot index={2} aria-invalid={otpError ? true : undefined} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} aria-invalid={otpError ? true : undefined} />
                      <InputOTPSlot index={4} aria-invalid={otpError ? true : undefined} />
                      <InputOTPSlot index={5} aria-invalid={otpError ? true : undefined} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpError ? (
                  <FieldError id="otp-error" className="text-center">
                    {otpError}
                  </FieldError>
                ) : (
                  <FieldDescription id="otp-hint" className="text-center">
                    Demo code: <code className="font-mono">{DEMO_CODE}</code>
                  </FieldDescription>
                )}
              </Field>
              <Button type="submit" disabled={otpPending || code.length !== 6} className="w-full">
                {otpPending && <Spinner />}
                {otpPending ? "Verifying..." : "Verify and sign in"}
              </Button>
            </FieldGroup>
          </form>
          <DialogFooter className="items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOtpOpen(false)}
              disabled={otpPending}
            >
              Back to password
            </Button>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={cooldown > 0 || otpPending}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
