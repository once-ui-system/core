import { Mail, User, Building2, Users, Palette, BellRing } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { teamSizes, themes, type OnboardingData } from "@/lib/data";

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden={true} />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}

const empty = <span className="font-normal text-muted-foreground">Not set yet</span>;

export function SummaryCard({ data }: { data: OnboardingData }) {
  const invites = data.invites.map((i) => i.trim()).filter(Boolean);
  const size = teamSizes.find((t) => t.value === data.teamSize)?.label;
  const theme = themes.find((t) => t.value === data.theme)?.label;

  return (
    <Card aria-labelledby="summary-title" role="region">
      <CardHeader>
        <CardTitle id="summary-title">Your setup so far</CardTitle>
        <CardDescription>Updates as you fill in each step.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-4" aria-live="polite">
          <Row icon={User} label="Name">
            {data.name.trim() || empty}
          </Row>
          <Row icon={Mail} label="Work email">
            {data.email.trim() || empty}
          </Row>
          <Row icon={Building2} label="Workspace">
            {data.workspace.trim() || empty}
          </Row>
          <Row icon={Users} label="Team size">
            {size ?? empty}
          </Row>
          <Row icon={Mail} label="Invited teammates">
            {invites.length ? (
              <ul className="flex flex-col gap-1">
                {invites.map((email) => (
                  <li key={email} className="break-all">
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="font-normal text-muted-foreground">No invites</span>
            )}
          </Row>
          <Row icon={Palette} label="Theme">
            <Badge variant="secondary">{theme}</Badge>
          </Row>
          <Row icon={BellRing} label="Weekly digest">
            <Badge variant={data.digest ? "default" : "outline"}>
              {data.digest ? "On" : "Off"}
            </Badge>
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}
