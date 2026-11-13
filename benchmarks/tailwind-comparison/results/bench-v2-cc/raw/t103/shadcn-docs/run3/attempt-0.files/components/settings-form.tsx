"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const notificationOptions = [
  { id: "digest", label: "Weekly digest", hint: "A summary of issues opened and closed each Monday." },
  { id: "assigned", label: "Issue assigned to me", hint: "Email me when someone assigns me an issue." },
  { id: "mentions", label: "Mentions", hint: "Email me when I am mentioned in a comment." },
];

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    digest: true,
    assigned: true,
    mentions: false,
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" value={user.role} readOnly aria-describedby="role-hint" />
            <p id="role-hint" className="text-sm text-muted-foreground">
              Roles are managed by the workspace owner.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {notificationOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <Label htmlFor={option.id}>{option.label}</Label>
                <p id={`${option.id}-hint`} className="text-sm text-muted-foreground">
                  {option.hint}
                </p>
              </div>
              <Switch
                id={option.id}
                aria-describedby={`${option.id}-hint`}
                checked={prefs[option.id]}
                onCheckedChange={(checked) => setPrefs((prev) => ({ ...prev, [option.id]: checked }))}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
