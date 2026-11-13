"use client";

import { useState, type FormEvent } from "react";
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
import { projects, user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [defaultProject, setDefaultProject] = useState("APP");
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [product, setProduct] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("Settings saved", {
      description: "Your changes are live. Nice work, " + name.split(" ")[0] + "!",
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <Card className="py-7">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription>How your teammates see you in Lumen.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm">
              Full name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-12 text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-12 text-base"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-sm">
              Role
            </Label>
            <Input id="role" value={user.role} readOnly className="h-12 text-base" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="default-project" className="text-sm">
              Default project
            </Label>
            <Select value={defaultProject} onValueChange={setDefaultProject}>
              <SelectTrigger id="default-project" className="h-12 w-full text-base">
                <SelectValue placeholder="Pick a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.key} value={p.key} className="py-2.5">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="py-7">
        <CardHeader>
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription>Choose what lands in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {[
            { id: "weekly", label: "Weekly summary", hint: "A cheerful recap every Monday morning.", checked: weekly, set: setWeekly },
            { id: "mentions", label: "Mentions and assignments", hint: "Hear straight away when someone needs you.", checked: mentions, set: setMentions },
            { id: "product", label: "Product news", hint: "New Lumen features and tips.", checked: product, set: setProduct },
          ].map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-4">
              <div className="grid gap-1">
                <Label htmlFor={row.id} className="text-base">
                  {row.label}
                </Label>
                <p id={`${row.id}-hint`} className="text-sm text-muted-foreground">
                  {row.hint}
                </p>
              </div>
              <Switch
                id={row.id}
                checked={row.checked}
                onCheckedChange={row.set}
                aria-describedby={`${row.id}-hint`}
                className="shrink-0 scale-125"
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" className="h-12 px-8 text-base">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
