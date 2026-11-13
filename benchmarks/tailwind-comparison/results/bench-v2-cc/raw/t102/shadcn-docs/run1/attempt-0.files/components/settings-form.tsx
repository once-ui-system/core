"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const NOTIFICATIONS = [
  { id: "digest", title: "Weekly digest", description: "A friendly summary of your team's progress every Monday." },
  { id: "mentions", title: "Mentions and replies", description: "Get an email when a teammate mentions you." },
  { id: "status", title: "Project status changes", description: "Know when a project is paused or archived." },
];

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>({
    digest: true,
    mentions: true,
    status: false,
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", { description: "Your changes are live." });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription>How you appear to your teammates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={user.role} readOnly aria-describedby="role-help" />
            <p id="role-help" className="text-sm text-muted-foreground">
              Only another owner can change your role.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription>Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {NOTIFICATIONS.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Separator className="my-2" />}
              <div className="flex items-center justify-between gap-4 py-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor={item.id} className="text-base">
                    {item.title}
                  </Label>
                  <p id={`${item.id}-desc`} className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  id={item.id}
                  aria-describedby={`${item.id}-desc`}
                  checked={prefs[item.id]}
                  onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [item.id]: checked }))}
                  className="scale-125"
                />
              </div>
            </React.Fragment>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button type="submit" size="lg">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
