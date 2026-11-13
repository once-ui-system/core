"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTIONS, type Role } from "@/lib/data";

interface FormErrors {
  email?: string;
  role?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Enter an email address.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address, like name@company.com.";
  return undefined;
}

export function InviteMemberDialog({
  existingEmails,
  onInvite,
}: {
  existingEmails: string[];
  onInvite: (invite: { email: string; role: Role; message: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function reset() {
    setEmail("");
    setRole("");
    setMessage("");
    setErrors({});
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FormErrors = {};
    let emailError = validateEmail(email);
    if (
      !emailError &&
      existingEmails.some((e) => e.toLowerCase() === email.trim().toLowerCase())
    ) {
      emailError = "This person is already on your team.";
    }
    if (emailError) next.email = emailError;
    if (!role) next.role = "Choose a role for this person.";
    setErrors(next);
    if (next.email || next.role || !role) return;

    onInvite({ email: email.trim(), role, message: message.trim() });
    toast.success(`Invitation sent to ${email.trim()}`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <SendIcon data-icon="inline-start" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They&apos;ll get an email with a link to join your Lumen workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <FieldGroup className="gap-5">
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="teammate@acmelabs.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "invite-email-error" : undefined}
                aria-required="true"
              />
              {errors.email ? (
                <FieldError id="invite-email-error">{errors.email}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={errors.role ? true : undefined}>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value as Role);
                  if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                }}
                name="role"
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
                    {ASSIGNABLE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.role ? (
                <FieldError id="invite-role-error">{errors.role}</FieldError>
              ) : (
                <FieldDescription>
                  {role ? ROLE_DESCRIPTIONS[role] : "Roles control what they can see and change."}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="invite-message">
                Message <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="invite-message"
                name="message"
                placeholder="Hi! I've set up our Lumen workspace and would love your help triaging issues."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                rows={3}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
