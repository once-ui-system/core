"use client"

import * as React from "react"
import { Loader2Icon, LockIcon, ShieldCheckIcon } from "lucide-react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const DEMO_EMAIL = "maya.okafor@northwind.example"
const DEMO_PASSWORD = "correct-horse-battery"
const DEMO_CODE = "482913"

export default function Page() {
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [otpOpen, setOtpOpen] = React.useState(false)
  const [signedIn, setSignedIn] = React.useState(false)

  const [email, setEmail] = React.useState(DEMO_EMAIL)
  const [password, setPassword] = React.useState("")
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  const [checking, setChecking] = React.useState(false)

  const [code, setCode] = React.useState("")
  const [codeError, setCodeError] = React.useState<string | null>(null)
  const [verifying, setVerifying] = React.useState(false)

  function resetAll() {
    setPassword("")
    setPasswordError(null)
    setCode("")
    setCodeError(null)
    setChecking(false)
    setVerifying(false)
  }

  function handleLoginOpenChange(open: boolean) {
    setLoginOpen(open)
    if (!open) {
      setOtpOpen(false)
      resetAll()
    }
  }

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError(null)
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.")
      return
    }
    setChecking(true)
    window.setTimeout(() => {
      setChecking(false)
      if (password !== DEMO_PASSWORD) {
        setPasswordError("Incorrect email or password. Hint: correct-horse-battery")
        return
      }
      setCode("")
      setCodeError(null)
      setOtpOpen(true)
    }, 600)
  }

  function verify(value: string) {
    if (value.length < 6 || verifying) return
    setVerifying(true)
    setCodeError(null)
    window.setTimeout(() => {
      setVerifying(false)
      if (value !== DEMO_CODE) {
        setCodeError("That code is not valid. Hint: 482913")
        setCode("")
        return
      }
      setOtpOpen(false)
      setLoginOpen(false)
      resetAll()
      setSignedIn(true)
      toast.success("Signed in", { description: `Welcome back, ${email}` })
    }, 600)
  }

  function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (code.length < 6) {
      setCodeError("Enter all 6 digits.")
      return
    }
    verify(code)
  }

  function handleOtpOpenChange(open: boolean) {
    setOtpOpen(open)
    if (!open) {
      setCode("")
      setCodeError(null)
      setVerifying(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {signedIn ? (
            <ShieldCheckIcon className="size-6" aria-hidden="true" />
          ) : (
            <LockIcon className="size-6" aria-hidden="true" />
          )}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {signedIn ? "You are signed in" : "Northwind Console"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {signedIn
              ? `Signed in as ${email} with two-factor verification.`
              : "Manage deployments, billing and team access. Sign in with your password and a one-time code."}
          </p>
        </div>
        {signedIn ? (
          <Button
            variant="outline"
            onClick={() => {
              setSignedIn(false)
              toast("Signed out")
            }}
          >
            Sign out
          </Button>
        ) : (
          <Button size="lg" onClick={() => setLoginOpen(true)}>
            Sign in
          </Button>
        )}
      </div>

      <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to your account</DialogTitle>
            <DialogDescription>
              Enter your email and password. We will ask for a verification code next.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} noValidate className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field data-invalid={passwordError ? true : undefined}>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={passwordError ? "login-password-error" : undefined}
              />
              {passwordError ? (
                <FieldError id="login-password-error" role="alert">
                  {passwordError}
                </FieldError>
              ) : null}
            </Field>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="submit" disabled={checking} className="w-full sm:w-auto">
                {checking ? (
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
                ) : null}
                {checking ? "Checking..." : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>

        {/* Stacked on top of the login dialog */}
        <Dialog open={otpOpen} onOpenChange={handleOtpOpenChange}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Two-step verification</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app for {email}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleOtpSubmit} noValidate className="grid gap-4">
              <Field data-invalid={codeError ? true : undefined}>
                <FieldLabel htmlFor="otp-code">Verification code</FieldLabel>
                <InputOTP
                  id="otp-code"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  disabled={verifying}
                  onChange={(value) => {
                    setCode(value)
                    setCodeError(null)
                  }}
                  onComplete={verify}
                  aria-invalid={codeError ? true : undefined}
                  aria-describedby={codeError ? "otp-error" : "otp-help"}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} aria-invalid={!!codeError} />
                    <InputOTPSlot index={1} aria-invalid={!!codeError} />
                    <InputOTPSlot index={2} aria-invalid={!!codeError} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} aria-invalid={!!codeError} />
                    <InputOTPSlot index={4} aria-invalid={!!codeError} />
                    <InputOTPSlot index={5} aria-invalid={!!codeError} />
                  </InputOTPGroup>
                </InputOTP>
                {codeError ? (
                  <FieldError id="otp-error" role="alert" className="text-center">
                    {codeError}
                  </FieldError>
                ) : (
                  <FieldDescription id="otp-help" className="text-center">
                    The code refreshes every 30 seconds.
                  </FieldDescription>
                )}
              </Field>
              <DialogFooter className="gap-2 sm:flex-col sm:space-x-0">
                <Button type="submit" disabled={verifying} className="w-full">
                  {verifying ? (
                    <Loader2Icon className="animate-spin" aria-hidden="true" />
                  ) : null}
                  {verifying ? "Verifying..." : "Verify and sign in"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => toast.info("New code sent", { description: "Check your authenticator app." })}
                >
                  Resend code
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Dialog>
    </main>
  )
}
