"use client"

import * as React from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Eye, EyeOff, LogOut, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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

const DEMO_EMAIL = "maya.okafor@northwind.example"
const DEMO_PASSWORD = "correct-horse-9"
const DEMO_CODE = "482913"
const RESEND_SECONDS = 30

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export default function Page() {
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [otpOpen, setOtpOpen] = React.useState(false)
  const [signedIn, setSignedIn] = React.useState(false)

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loginError, setLoginError] = React.useState<string | null>(null)
  const [loginBusy, setLoginBusy] = React.useState(false)

  const [code, setCode] = React.useState("")
  const [otpError, setOtpError] = React.useState<string | null>(null)
  const [otpBusy, setOtpBusy] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  function resetAll() {
    setEmail("")
    setPassword("")
    setShowPassword(false)
    setLoginError(null)
    setCode("")
    setOtpError(null)
    setCooldown(0)
  }

  function handleLoginOpenChange(open: boolean) {
    setLoginOpen(open)
    if (!open) {
      setOtpOpen(false)
      resetAll()
    }
  }

  function handleOtpOpenChange(open: boolean) {
    setOtpOpen(open)
    if (!open) {
      setCode("")
      setOtpError(null)
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loginBusy) return
    const trimmed = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setLoginError("Enter a valid email address.")
      return
    }
    if (password.length < 8) {
      setLoginError("Password must be at least 8 characters.")
      return
    }
    setLoginError(null)
    setLoginBusy(true)
    await wait(800)
    setLoginBusy(false)
    if (trimmed.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setLoginError("Incorrect email or password. Please try again.")
      return
    }
    setCode("")
    setOtpError(null)
    setCooldown(RESEND_SECONDS)
    setOtpOpen(true)
  }

  async function verify(value: string) {
    if (otpBusy) return
    if (value.length < 6) {
      setOtpError("Enter all 6 digits of your code.")
      return
    }
    setOtpError(null)
    setOtpBusy(true)
    await wait(700)
    setOtpBusy(false)
    if (value !== DEMO_CODE) {
      setOtpError("That code is incorrect or has expired.")
      setCode("")
      return
    }
    setOtpOpen(false)
    setLoginOpen(false)
    resetAll()
    setSignedIn(true)
    toast.success("Signed in", { description: `Welcome back, Maya.` })
  }

  function handleResend() {
    if (cooldown > 0) return
    setCooldown(RESEND_SECONDS)
    setCode("")
    setOtpError(null)
    toast.info("New code sent", {
      description: "Check the authenticator app or SMS on your phone.",
    })
  }

  function handleSignOut() {
    setSignedIn(false)
    toast("Signed out")
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <div className="flex flex-col gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Northwind Console
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage invoices, shipments and team access for your workspace.
          </p>
        </div>

        <div className="mt-6" aria-live="polite">
          {signedIn ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                <p className="font-medium">Maya Okafor</p>
                <p className="text-muted-foreground">{DEMO_EMAIL}</p>
                <p className="mt-2 text-muted-foreground">
                  Two-step verification passed. Session valid for 12 hours.
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut aria-hidden="true" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => setLoginOpen(true)}>
              Sign in
            </Button>
          )}
        </div>
      </div>

      <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Northwind</DialogTitle>
            <DialogDescription>
              Enter your work email and password. We will ask for a
              verification code next.
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
                  placeholder={DEMO_EMAIL}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={loginError ? true : undefined}
                  aria-describedby={loginError ? "login-error" : undefined}
                  required
                />
              </Field>
              <Field data-invalid={loginError ? true : undefined}>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() =>
                      toast.info("Reset link sent", {
                        description: "If the account exists, an email is on its way.",
                      })
                    }
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    aria-invalid={loginError ? true : undefined}
                    aria-describedby={
                      loginError ? "login-error" : "login-hint"
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 size-9 text-muted-foreground"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {loginError ? (
                  <FieldError id="login-error">{loginError}</FieldError>
                ) : (
                  <FieldDescription id="login-hint">
                    Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
                  </FieldDescription>
                )}
              </Field>
              <Button type="submit" disabled={loginBusy} className="w-full">
                {loginBusy && <Spinner />}
                {loginBusy ? "Checking..." : "Continue"}
              </Button>
            </FieldGroup>
          </form>

          <Dialog open={otpOpen} onOpenChange={handleOtpOpenChange}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Two-step verification</DialogTitle>
                <DialogDescription>
                  Enter the 6-digit code from your authenticator app for{" "}
                  {DEMO_EMAIL}. Demo code: {DEMO_CODE}.
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
                    <FieldLabel htmlFor="otp-code">Verification code</FieldLabel>
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
                      disabled={otpBusy}
                      aria-invalid={otpError ? true : undefined}
                      aria-describedby={otpError ? "otp-error" : undefined}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} aria-invalid={!!otpError} />
                        <InputOTPSlot index={1} aria-invalid={!!otpError} />
                        <InputOTPSlot index={2} aria-invalid={!!otpError} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} aria-invalid={!!otpError} />
                        <InputOTPSlot index={4} aria-invalid={!!otpError} />
                        <InputOTPSlot index={5} aria-invalid={!!otpError} />
                      </InputOTPGroup>
                    </InputOTP>
                    {otpError && (
                      <FieldError id="otp-error" className="text-center">
                        {otpError}
                      </FieldError>
                    )}
                  </Field>

                  <DialogFooter className="sm:flex-col sm:justify-stretch">
                    <Button type="submit" disabled={otpBusy} className="w-full">
                      {otpBusy && <Spinner />}
                      {otpBusy ? "Verifying..." : "Verify and sign in"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={handleResend}
                      disabled={cooldown > 0 || otpBusy}
                    >
                      {cooldown > 0
                        ? `Resend code in ${cooldown}s`
                        : "Resend code"}
                    </Button>
                  </DialogFooter>
                </FieldGroup>
              </form>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </main>
  )
}
