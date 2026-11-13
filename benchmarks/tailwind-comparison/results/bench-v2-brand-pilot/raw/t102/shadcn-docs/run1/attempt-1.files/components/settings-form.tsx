"use client";

import * as React from "react";
import { toast } from "sonner";

import { user } from "@/lib/data";
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
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function SettingsForm() {
  const [name, setName] = React.useState<string>(user.name);
  const [email, setEmail] = React.useState<string>(user.email);
  const [digest, setDigest] = React.useState<string>("weekly");
  const [issueAlerts, setIssueAlerts] = React.useState<boolean>(true);
  const [productNews, setProductNews] = React.useState<boolean>(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your preferences are all up to date.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription>
            How you appear to the rest of your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="settings-name">Full name</FieldLabel>
              <Input
                id="settings-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-email">Email</FieldLabel>
              <Input
                id="settings-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby="settings-email-help"
                required
              />
              <FieldDescription id="settings-email-help">
                We send sign-in links and receipts to this address.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-role">Role</FieldLabel>
              <Input id="settings-role" value={user.role} readOnly />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription>
            Choose how much Lumen taps you on the shoulder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="settings-digest">Summary email</FieldLabel>
                <Select value={digest} onValueChange={setDigest}>
                  <SelectTrigger
                    id="settings-digest"
                    className="w-full sm:w-64"
                  >
                    <SelectValue placeholder="Choose a frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="daily">Every day</SelectItem>
                      <SelectItem value="weekly">Every Monday</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="settings-issue-alerts">
                    Issue assignments
                  </FieldLabel>
                  <FieldDescription>
                    Get a note when an issue is assigned to you.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="settings-issue-alerts"
                  checked={issueAlerts}
                  onCheckedChange={setIssueAlerts}
                />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="settings-product-news">
                    Product news
                  </FieldLabel>
                  <FieldDescription>
                    Occasional updates about new Lumen features.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="settings-product-news"
                  checked={productNews}
                  onCheckedChange={setProductNews}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
