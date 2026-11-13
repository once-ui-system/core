"use client";

import type { ReactNode } from "react";
import { Mail, User, Building2, Users, Palette, BellRing, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { teamSizes, themes, type OnboardingData } from "@/lib/data";

function Row({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}

function Empty({ children = "Not set yet" }: { children?: ReactNode }) {
  return <span className="font-normal text-muted-foreground">{children}</span>;
}

export function SummaryCard({ data }: { data: OnboardingData }) {
  const invites = data.invites.map((i) => i.trim()).filter(Boolean);
  const size = teamSizes.find((t) => t.value === data.teamSize)?.label;
  const theme = themes.find((t) => t.value === data.theme)?.label;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base leading-none font-semibold">Your setup so far</h2>
        <CardDescription>Updates as you fill in each step.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-4">
          <Row icon={<User className="size-4" aria-hidden="true" />} label="Name">
            {data.name.trim() || <Empty />}
          </Row>
          <Row icon={<Mail className="size-4" aria-hidden="true" />} label="Work email">
            {data.email.trim() || <Empty />}
          </Row>
          <Row icon={<Building2 className="size-4" aria-hidden="true" />} label="Workspace">
            {data.workspace.trim() || <Empty />}
          </Row>
          <Row icon={<Users className="size-4" aria-hidden="true" />} label="Team size">
            {size ?? <Empty />}
          </Row>
          <Row icon={<UserPlus className="size-4" aria-hidden="true" />} label="Invited teammates">
            {invites.length ? (
              <ul className="flex flex-col gap-1">
                {invites.map((email) => (
                  <li key={email} className="break-all">
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No invites</Empty>
            )}
          </Row>
          <Row icon={<Palette className="size-4" aria-hidden="true" />} label="Theme">
            <Badge variant="secondary">{theme}</Badge>
          </Row>
          <Row icon={<BellRing className="size-4" aria-hidden="true" />} label="Weekly digest">
            <Badge variant={data.digest ? "default" : "outline"}>
              {data.digest ? "On" : "Off"}
            </Badge>
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}
