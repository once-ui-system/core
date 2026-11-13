"use client";

import * as React from "react";
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = React.useState<string>(user.name);
  const [email, setEmail] = React.useState<string>(user.email);
  const [weekly, setWeekly] = React.useState(true);
  const [assigned, setAssigned] = React.useState(true);
  const [releases, setReleases] = React.useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your profile and notification preferences were updated.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This information is visible to your teammates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FieldDescription>
                We send account and billing notices to this address.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <div>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="weekly">Weekly digest</FieldLabel>
                <FieldDescription>
                  A Monday summary of issues opened and closed.
                </FieldDescription>
              </FieldContent>
              <Switch id="weekly" checked={weekly} onCheckedChange={setWeekly} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="assigned">Issue assignments</FieldLabel>
                <FieldDescription>
                  Get an email when an issue is assigned to you.
                </FieldDescription>
              </FieldContent>
              <Switch id="assigned" checked={assigned} onCheckedChange={setAssigned} />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="releases">Release announcements</FieldLabel>
                <FieldDescription>
                  Product news and new Lumen features.
                </FieldDescription>
              </FieldContent>
              <Switch id="releases" checked={releases} onCheckedChange={setReleases} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
