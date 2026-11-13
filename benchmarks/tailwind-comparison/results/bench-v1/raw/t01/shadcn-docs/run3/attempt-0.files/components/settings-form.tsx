"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const notificationOptions = [
  {
    id: "notify-assigned",
    label: "Issue assigned to me",
    description: "Email me when someone assigns an issue to me.",
    defaultChecked: true,
  },
  {
    id: "notify-digest",
    label: "Weekly digest",
    description: "A Monday summary of activity across your projects.",
    defaultChecked: true,
  },
  {
    id: "notify-product",
    label: "Product updates",
    description: "News about new Lumen features.",
    defaultChecked: false,
  },
];

export function SettingsForm() {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your name and email are visible to teammates in the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-role">Role</Label>
            <Input id="profile-role" value={user.role} readOnly disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose which emails you receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {notificationOptions.map((option) => (
              <li
                key={option.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Label htmlFor={option.id}>{option.label}</Label>
                  <p
                    id={`${option.id}-desc`}
                    className="mt-1.5 text-sm text-muted-foreground"
                  >
                    {option.description}
                  </p>
                </div>
                <Switch
                  id={option.id}
                  defaultChecked={option.defaultChecked}
                  aria-describedby={`${option.id}-desc`}
                />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
