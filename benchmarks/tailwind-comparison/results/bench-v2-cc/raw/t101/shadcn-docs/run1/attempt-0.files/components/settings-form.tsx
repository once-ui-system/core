"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { user } from "@/lib/data"

const notificationOptions = [
  {
    id: "notify-assigned",
    label: "Issues assigned to me",
    hint: "Email me when an issue is assigned to me.",
    initial: true,
  },
  {
    id: "notify-digest",
    label: "Weekly analytics digest",
    hint: "A Monday summary of events and open issues.",
    initial: true,
  },
  {
    id: "notify-status",
    label: "Project status changes",
    hint: "Tell me when a project is paused or archived.",
    initial: false,
  },
]

export function SettingsForm() {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [notify, setNotify] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notificationOptions.map((o) => [o.id, o.initial]))
  )

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success("Settings saved", {
      description: `Changes for ${name} were stored.`,
    })
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to your team in Lumen.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="profile-role">Role</Label>
            <Input id="profile-role" value={user.role} readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose which emails Lumen sends you.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {notificationOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col">
                <Label htmlFor={option.id}>{option.label}</Label>
                <span id={`${option.id}-hint`} className="text-xs text-muted-foreground">
                  {option.hint}
                </span>
              </div>
              <Switch
                id={option.id}
                size="sm"
                aria-describedby={`${option.id}-hint`}
                checked={notify[option.id]}
                onCheckedChange={(checked) =>
                  setNotify((prev) => ({ ...prev, [option.id]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-2 pt-2">
          <Button type="submit" size="sm">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
