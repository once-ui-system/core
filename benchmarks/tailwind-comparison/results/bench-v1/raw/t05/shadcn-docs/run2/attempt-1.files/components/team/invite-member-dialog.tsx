"use client"

import { useState } from "react"
import { SendIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  INVITABLE_ROLES,
  ROLE_DESCRIPTIONS,
  type Member,
  type Role,
} from "@/lib/data"

type Errors = {
  email?: string
  role?: string
  message?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MESSAGE_LIMIT = 280

function validate(
  email: string,
  role: string,
  message: string,
  existing: Member[]
): Errors {
  const errors: Errors = {}
  const trimmed = email.trim()
  if (!trimmed) {
    errors.email = "Enter an email address."
  } else if (!EMAIL_PATTERN.test(trimmed)) {
    errors.email = "Enter a valid email address, like name@company.com."
  } else if (
    existing.some((m) => m.email.toLowerCase() === trimmed.toLowerCase())
  ) {
    errors.email = "This person is already on the team."
  }
  if (!role) {
    errors.role = "Choose a role for the new member."
  }
  if (message.length > MESSAGE_LIMIT) {
    errors.message = `Keep the message under ${MESSAGE_LIMIT} characters.`
  }
  return errors
}

export function InviteMemberDialog({
  existing,
  onInvite,
}: {
  existing: Member[]
  onInvite: (input: { email: string; role: Role; message: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)

  function reset() {
    setEmail("")
    setRole("")
    setMessage("")
    setErrors({})
    setSubmitted(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  function revalidate(nextEmail: string, nextRole: string, nextMessage: string) {
    if (submitted) {
      setErrors(validate(nextEmail, nextRole, nextMessage, existing))
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(email, role, message, existing)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onInvite({
      email: email.trim(),
      role: role as Role,
      message: message.trim(),
    })
    toast.success("Invitation sent", {
      description: `${email.trim()} was invited as ${role}.`,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlusIcon data-icon="inline-start" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>
              They&apos;ll get an email with a link to join your Lumen
              workspace.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                name="email"
                type="email"
                autoComplete="off"
                placeholder="teammate@acmelabs.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  revalidate(e.target.value, role, message)
                }}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "invite-email-error" : undefined}
                aria-required="true"
              />
              <FieldError id="invite-email-error">{errors.email}</FieldError>
            </Field>

            <Field data-invalid={errors.role ? true : undefined}>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value)
                  revalidate(email, value, message)
                }}
              >
                <SelectTrigger
                  id="invite-role"
                  className="w-full"
                  aria-invalid={errors.role ? true : undefined}
                  aria-describedby={errors.role ? "invite-role-error" : undefined}
                  aria-required="true"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {INVITABLE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {role ? (
                <FieldDescription>
                  {ROLE_DESCRIPTIONS[role as Role]}
                </FieldDescription>
              ) : null}
              <FieldError id="invite-role-error">{errors.role}</FieldError>
            </Field>

            <Field data-invalid={errors.message ? true : undefined}>
              <FieldLabel htmlFor="invite-message">
                Message{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="invite-message"
                name="message"
                rows={3}
                placeholder="Hey! We're tracking our Q4 launch in Lumen. Join us."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  revalidate(email, role, e.target.value)
                }}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={
                  errors.message ? "invite-message-error" : undefined
                }
              />
              <FieldError id="invite-message-error">{errors.message}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <SendIcon data-icon="inline-start" />
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
