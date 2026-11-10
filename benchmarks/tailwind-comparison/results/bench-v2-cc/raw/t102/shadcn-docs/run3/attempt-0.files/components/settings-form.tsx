"use client";

import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

const prefs = [
  { id: "digest", title: "Weekly digest", text: "A friendly Monday summary of what moved last week.", on: true },
  { id: "assigned", title: "Assigned to me", text: "Get an email when an issue lands on your plate.", on: true },
  { id: "mentions", title: "Mentions and replies", text: "Know when a teammate pings you in a thread.", on: false },
];

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [toggles, setToggles] = React.useState<Record<string, boolean>>(
    Object.fromEntries(prefs.map((p) => [p.id, p.on])),
  );

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Settings saved", { description: "Your changes are live." });
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-8">
      <Card className="gap-6 py-7">
        <CardHeader className="gap-2 px-7">
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription className="text-base">How you appear to teammates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 px-7 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-base">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-12 text-base" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-base">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-12 text-base" />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <span className="text-base font-medium">Role</span>
            <Badge variant="secondary" className="px-3 py-1 text-xs">{user.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-6 py-7">
        <CardHeader className="gap-2 px-7">
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription className="text-base">Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="px-7">
          <ul className="divide-y">
            {prefs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-6 py-5">
                <div>
                  <Label htmlFor={p.id} className="text-base">{p.title}</Label>
                  <p id={`${p.id}-desc`} className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                </div>
                <Switch
                  id={p.id}
                  aria-describedby={`${p.id}-desc`}
                  checked={toggles[p.id]}
                  onCheckedChange={(v) => setToggles((t) => ({ ...t, [p.id]: v }))}
                  className="h-7 w-12 [&_[data-slot=switch-thumb]]:size-6"
                />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end px-7">
          <Button type="submit" size="lg" className="h-12 px-8 text-base">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
