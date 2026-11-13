import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  filledInvites,
  teamSizeLabel,
  type OnboardingData,
} from "@/lib/onboarding";
import { THEMES } from "@/lib/data";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  );
}

const EMPTY = <span className="text-muted-foreground">Not set yet</span>;

export function SummaryCard({
  data,
  step,
}: {
  data: OnboardingData;
  step: number;
}) {
  const invites = filledInvites(data);
  const themeLabel = THEMES.find((t) => t.value === data.theme)?.label;

  return (
    <Card aria-label="Your setup so far" role="region">
      <CardHeader>
        <CardTitle>Your setup so far</CardTitle>
        <CardDescription>
          This fills in as you go. Nothing is saved until you finish.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-col gap-4">
          <Row label="Name">{data.name.trim() || EMPTY}</Row>
          <Row label="Work email">{data.email.trim() || EMPTY}</Row>
        </dl>
        <Separator />
        <dl className="flex flex-col gap-4">
          <Row label="Workspace">{data.workspace.trim() || EMPTY}</Row>
          <Row label="Team size">{teamSizeLabel(data.teamSize) || EMPTY}</Row>
        </dl>
        <Separator />
        <dl className="flex flex-col gap-4">
          <Row label="Invitations">
            {invites.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {invites.map((email) => (
                  <li key={email} className="break-all">
                    {email}
                  </li>
                ))}
              </ul>
            ) : step > 2 ? (
              <span className="text-muted-foreground">Skipped</span>
            ) : (
              EMPTY
            )}
          </Row>
        </dl>
        <Separator />
        <dl className="flex flex-col gap-4">
          <Row label="Theme">{themeLabel}</Row>
          <Row label="Weekly digest">
            <Badge variant={data.digest ? "default" : "secondary"}>
              {data.digest ? "On" : "Off"}
            </Badge>
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}
