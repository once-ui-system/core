"use client";

import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [digest, setDigest] = React.useState("weekly");
  const [issueAlerts, setIssueAlerts] = React.useState(true);
  const [releaseNotes, setReleaseNotes] = React.useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your profile and notification preferences are up to date.",
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Profile</CardTitle>
          <CardDescription className="text-xs">
            How you appear to teammates in Acme Labs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-xs">
              Full name
            </Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role" className="text-xs">
              Role
            </Label>
            <Input id="role" value={user.role} readOnly aria-readonly="true" className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Notifications</CardTitle>
          <CardDescription className="text-xs">
            Choose what Lumen sends to {email || "your inbox"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-1.5 sm:max-w-xs">
            <Label htmlFor="digest" className="text-xs">
              Summary digest
            </Label>
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
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <div>
              <Label htmlFor="issue-alerts" className="text-sm">
                Issue assignments
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Email me when an issue is assigned to me.
              </p>
            </div>
            <Switch
              id="issue-alerts"
              checked={issueAlerts}
              onCheckedChange={setIssueAlerts}
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <div>
              <Label htmlFor="release-notes" className="text-sm">
                Product updates
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Occasional notes about new Lumen features.
              </p>
            </div>
            <Switch
              id="release-notes"
              checked={releaseNotes}
              onCheckedChange={setReleaseNotes}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setDigest("weekly");
              setIssueAlerts(true);
              setReleaseNotes(false);
            }}
          >
            Reset
          </Button>
          <Button type="submit" size="sm">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
