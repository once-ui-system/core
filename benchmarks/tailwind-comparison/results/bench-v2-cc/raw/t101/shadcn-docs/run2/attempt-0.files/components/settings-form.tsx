"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [timezone, setTimezone] = React.useState("europe-london");
  const [digest, setDigest] = React.useState(true);
  const [mentions, setMentions] = React.useState(true);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success("Settings saved");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Card className="gap-3 py-3">
        <CardHeader className="gap-0 px-3">
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription className="text-xs">How you appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-xs">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" autoComplete="name" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-sm" autoComplete="email" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role" className="text-xs">Role</Label>
            <Input id="role" value={user.role} readOnly className="h-8 bg-muted text-sm" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="timezone" className="text-xs">Time zone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="h-8 w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="europe-london">London (GMT)</SelectItem>
                <SelectItem value="america-new-york">New York (ET)</SelectItem>
                <SelectItem value="africa-lagos">Lagos (WAT)</SelectItem>
                <SelectItem value="asia-tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3 py-3">
        <CardHeader className="gap-0 px-3">
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription className="text-xs">Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-3">
          <div className="flex items-center justify-between gap-3">
            <div className="grid gap-0.5">
              <Label htmlFor="digest" className="text-sm">Weekly digest</Label>
              <p className="text-xs text-muted-foreground">A Monday summary of issues opened and closed.</p>
            </div>
            <Switch id="digest" checked={digest} onCheckedChange={setDigest} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="grid gap-0.5">
              <Label htmlFor="mentions" className="text-sm">Mentions</Label>
              <p className="text-xs text-muted-foreground">Email me when someone mentions me on an issue.</p>
            </div>
            <Switch id="mentions" checked={mentions} onCheckedChange={setMentions} />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 px-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setName(user.name);
              setEmail(user.email);
              setTimezone("europe-london");
              setDigest(true);
              setMentions(true);
            }}
          >
            Reset
          </Button>
          <Button type="submit" size="sm">Save changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
