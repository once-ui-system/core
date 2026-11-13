import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { teamSizes, themeOptions } from "@/lib/data"
import { filledInvites, type OnboardingState } from "@/lib/onboarding"

type SummaryCardProps = {
  state: OnboardingState
}

type RowProps = {
  label: string
  value: string
  placeholder: string
}

function Row({ label, value, placeholder }: RowProps) {
  const hasValue = value.trim().length > 0
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={
          hasValue
            ? "text-sm break-words"
            : "text-sm text-muted-foreground italic"
        }
      >
        {hasValue ? value : placeholder}
      </dd>
    </div>
  )
}

export function SummaryCard({ state }: SummaryCardProps) {
  const invites = filledInvites(state.invites)
  const teamSizeLabel =
    teamSizes.find((option) => option.value === state.teamSize)?.label ?? ""
  const themeLabel =
    themeOptions.find((option) => option.value === state.theme)?.label ?? ""

  return (
    <Card role="region" aria-labelledby="summary-title">
      <CardHeader>
        <CardTitle id="summary-title">Your setup so far</CardTitle>
        <CardDescription>
          Updates as you type. Nothing is saved until you finish.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <section aria-label="Account" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Account</h3>
          <dl className="flex flex-col gap-3">
            <Row label="Name" value={state.name} placeholder="Not entered yet" />
            <Row
              label="Work email"
              value={state.email}
              placeholder="Not entered yet"
            />
          </dl>
        </section>
        <Separator />
        <section aria-label="Workspace" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Workspace</h3>
          <dl className="flex flex-col gap-3">
            <Row
              label="Name"
              value={state.workspaceName}
              placeholder="Not entered yet"
            />
            <Row
              label="Team size"
              value={teamSizeLabel}
              placeholder="Not chosen yet"
            />
          </dl>
        </section>
        <Separator />
        <section aria-label="Invites" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Invites</h3>
          {invites.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {invites.map((email: string) => (
                <li key={email} className="max-w-full">
                  <Badge variant="secondary" className="max-w-full break-all">
                    {email}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No teammates added yet
            </p>
          )}
        </section>
        <Separator />
        <section aria-label="Preferences" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Preferences</h3>
          <dl className="flex flex-col gap-3">
            <Row label="Theme" value={themeLabel} placeholder="System" />
            <Row
              label="Weekly digest"
              value={state.weeklyDigest ? "On, every Monday" : "Off"}
              placeholder="Off"
            />
          </dl>
        </section>
      </CardContent>
    </Card>
  )
}
