"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const notificationOptions = [
  { id: "assigned", label: "Issue assigned to me", hint: "Email when someone assigns you an issue.", defaultChecked: true },
  { id: "mentions", label: "Mentions", hint: "Email when a teammate mentions you in a comment.", defaultChecked: true },
  { id: "releases", label: "Release health alerts", hint: "Notify when error rates rise after a deploy.", defaultChecked: false },
];

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [digest, setDigest] = React.useState("weekly");
  const [prefs, setPrefs] = React.useState<Record<string, boolean>>(
    Object.fromEntries(notificationOptions.map((o) => [o.id, o.defaultChecked])),
  );

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>How you appear to the rest of the workspace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={user.email} readOnly autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" defaultValue={user.role} readOnly aria-describedby="role-hint" />
            <p id="role-hint" className="text-xs text-muted-foreground">
              Only another owner can change roles.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose what reaches your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {notificationOptions.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor={o.id}>{o.label}</Label>
                <p id={`${o.id}-hint`} className="text-sm text-muted-foreground">
                  {o.hint}
                </p>
              </div>
              <Switch
                id={o.id}
                aria-describedby={`${o.id}-hint`}
                checked={prefs[o.id]}
                onCheckedChange={(checked) => setPrefs((prev) => ({ ...prev, [o.id]: checked }))}
              />
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="digest">Summary email</Label>
            <Select value={digest} onValueChange={setDigest}>
              <SelectTrigger id="digest" className="w-full">
                <SelectValue placeholder="Choose a frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
