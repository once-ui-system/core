Now the final client pieces and pages. The projects page, with the self-contained button:

```tsx components/new-project-button.tsx
"use client";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function NewProjectButton() {
  return (
    <Button
      onClick={() =>
        toast.success("Project creation is coming soon", {
          description:
            "For now, your five existing projects are all listed below.",
        })
      }
    >
      <PlusIcon data-icon="inline-start" aria-hidden="true" />
      New project
    </Button>
  );
}
```

```tsx app/projects/page.tsx
import type { Metadata } from "next";

import { formatDate, projects, type ProjectStatus } from "@/lib/data";
import { PageHeading } from "@/components/page-heading";
import { NewProjectButton } from "@/components/new-project-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Projects" };

const statusVariant: Record<
  ProjectStatus,
  "default" | "secondary" | "outline"
> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeading
        title="Projects"
        description="Every project your team is tracking, with open issues and when it last moved."
        action={<NewProjectButton />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All projects</CardTitle>
          <CardDescription>
            {projects.length} projects in the Acme Labs workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Key</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">
                  Open issues
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Updated
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.key}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {project.key}
                  </TableCell>
                  <TableCell className="font-semibold">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[project.status]}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {project.issues}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <time dateTime={project.updated}>
                      {formatDate(project.updated)}
                    </time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
```

```tsx components/settings-form.tsx
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
  const [digest, setDigest] = React.useState("weekly");
  const [issueAlerts, setIssueAlerts] = React.useState(true);
  const [productNews, setProductNews] = React.useState(false);

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
```

```tsx app/settings/page.tsx
import type { Metadata } from "next";

import { PageHeading } from "@/components/page-heading";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Settings"
        description="Tune your profile and notifications. Changes only affect your own account."
      />
      <SettingsForm />
    </>
  );
}
```