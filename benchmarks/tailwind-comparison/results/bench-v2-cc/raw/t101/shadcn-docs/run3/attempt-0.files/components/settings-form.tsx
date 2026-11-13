"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { user, workspace } from "@/lib/data";

const notifications = [
  { id: "weekly", label: "Weekly summary", hint: "A Monday email with open issues per project.", on: true },
  { id: "assigned", label: "Issue assigned to me", hint: "Email me when someone assigns me an issue.", on: true },
  { id: "status", label: "Project status changes", hint: "Tell me when a project is paused or archived.", on: false },
];

export function SettingsForm() {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>How you appear to your teammates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" defaultValue={user.name} autoComplete="name" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={user.email} autoComplete="email" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" defaultValue={user.role} readOnly aria-describedby="role-hint" />
            <p id="role-hint" className="text-xs text-muted-foreground">
              Only another owner can change this.
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="workspace">Workspace name</Label>
            <Input id="workspace" name="workspace" defaultValue={workspace.name} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose which emails Lumen sends you.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-4 py-2">
                <div className="grid gap-0.5">
                  <Label htmlFor={n.id}>{n.label}</Label>
                  <p id={`${n.id}-hint`} className="text-xs text-muted-foreground">
                    {n.hint}
                  </p>
                </div>
                <Switch id={n.id} defaultChecked={n.on} aria-describedby={`${n.id}-hint`} />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
