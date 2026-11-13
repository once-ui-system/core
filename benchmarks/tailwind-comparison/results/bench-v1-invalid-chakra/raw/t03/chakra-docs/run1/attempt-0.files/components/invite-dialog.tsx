"use client"

import * as React from "react"
import { Button, Input, Stack } from "@chakra-ui/react"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) {
      setEmail("")
      setError(null)
    }
  }, [open])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = email.trim()
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like name@company.com.")
      inputRef.current?.focus()
      return
    }
    onOpenChange(false)
    toaster.create({
      title: "Invitation sent",
      description: `${value} will receive an email to join Lumen.`,
      type: "success",
    })
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      initialFocusEl={() => inputRef.current}
    >
      <DialogContent mx="4">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="4">
              <DialogDescription>
                Send an email invitation to join your Lumen workspace as a
                Member.
              </DialogDescription>
              <Field
                label="Email address"
                required
                invalid={error !== null}
                errorText={error}
              >
                <Input
                  ref={inputRef}
                  type="email"
                  name="email"
                  autoComplete="off"
                  placeholder="teammate@acmelabs.io"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter gap="2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
