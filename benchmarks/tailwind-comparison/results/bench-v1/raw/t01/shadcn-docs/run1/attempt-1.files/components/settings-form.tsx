"use client";

import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: "assigned",
    title: "Issue assigned to me",
    description: "Get an email when a teammate assigns an issue to you.",
    defaultChecked: true,
  },
  {
    id: "digest",
    title: "Weekly analytics digest",
    description: "A Monday summary of usage trends across your projects.",
    defaultChecked: true,
  },
  {
    id: "mentions",
    title: "Mentions and comments",
    description: "Be notified when someone mentions you in a thread.",
    defaultChecked: false,
  },
];

function defaultPrefs(): Record<string, boolean> {
  return Object.fromEntries(
    notificationSettings.map((s) => [s.id, s.defaultChecked]),
  );
}

export function SettingsForm() {
  const uid = useId();
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(defaultPrefs);

  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const roleId = `${uid}-role`;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your profile and notification preferences were updated.",
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your name and email are visible to your team.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={nameId}>Full name</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor={roleId}>Role</Label>
            <div className="flex items-center gap-2">
              <Input id={roleId} value={user.role} readOnly className="max-w-xs" />
              <Badge variant="secondary">Workspace owner</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose which updates reach your inbox.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {notificationSettings.map((setting) => {
              const switchId = `${uid}-${setting.id}`;
              const descId = `${switchId}-desc`;
              return (
                <li
                  key={setting.id}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={switchId}>{setting.title}</Label>
                    <p id={descId} className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    id={switchId}
                    aria-describedby={descId}
                    checked={prefs[setting.id]}
                    onCheckedChange={(checked) =>
                      setPrefs((prev) => ({ ...prev, [setting.id]: checked }))
                    }
                  />
                </li>
              );
            })}
          </ul>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setPrefs(defaultPrefs());
            }}
          >
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
