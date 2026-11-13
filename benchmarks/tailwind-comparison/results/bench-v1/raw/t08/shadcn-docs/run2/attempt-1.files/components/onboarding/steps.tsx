"use client"

import { MailIcon } from "lucide-react"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  MAX_INVITES,
  teamSizes,
  themeOptions,
  type ThemeValue,
} from "@/lib/data"
import type { OnboardingState, StepErrors } from "@/lib/onboarding"

type StepProps = {
  state: OnboardingState
  errors: StepErrors
  onChange: (patch: Partial<OnboardingState>) => void
}

export function AccountStep({ state, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={errors.name ? true : undefined}>
        <FieldLabel htmlFor="name">Full name</FieldLabel>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Maya Okafor"
          value={state.name}
          onChange={(event) => onChange({ name: event.target.value })}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error">{errors.name}</FieldError>
      </Field>
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="email">Work email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maya@acmelabs.io"
          value={state.email}
          onChange={(event) => onChange({ email: event.target.value })}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : "email-description"}
        />
        {errors.email ? (
          <FieldError id="email-error">{errors.email}</FieldError>
        ) : (
          <FieldDescription id="email-description">
            We will send your sign-in link and receipts here.
          </FieldDescription>
        )}
      </Field>
    </FieldGroup>
  )
}

export function WorkspaceStep({ state, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={errors.workspaceName ? true : undefined}>
        <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
        <Input
          id="workspace-name"
          name="workspaceName"
          autoComplete="organization"
          placeholder="Acme Labs"
          value={state.workspaceName}
          onChange={(event) => onChange({ workspaceName: event.target.value })}
          aria-invalid={errors.workspaceName ? true : undefined}
          aria-describedby={
            errors.workspaceName ? "workspace-name-error" : undefined
          }
        />
        <FieldError id="workspace-name-error">{errors.workspaceName}</FieldError>
      </Field>
      <Field data-invalid={errors.teamSize ? true : undefined}>
        <FieldLabel htmlFor="team-size">Team size</FieldLabel>
        <Select
          value={state.teamSize}
          onValueChange={(value: string) => onChange({ teamSize: value })}
        >
          <SelectTrigger
            id="team-size"
            className="w-full"
            aria-invalid={errors.teamSize ? true : undefined}
            aria-describedby={errors.teamSize ? "team-size-error" : undefined}
          >
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {teamSizes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError id="team-size-error">{errors.teamSize}</FieldError>
      </Field>
    </FieldGroup>
  )
}

export function InviteStep({ state, errors, onChange }: StepProps) {
  const updateInvite = (index: number, value: string) => {
    const invites = state.invites.map((current: string, i: number) =>
      i === index ? value : current
    )
    onChange({ invites })
  }

  return (
    <FieldSet>
      <FieldLegend variant="label">
        Teammate emails (up to {MAX_INVITES})
      </FieldLegend>
      <FieldDescription>
        They will get an email invite once you finish. Leave all fields empty to
        skip this step.
      </FieldDescription>
      {errors.invitesSummary ? (
        <FieldError>{errors.invitesSummary}</FieldError>
      ) : null}
      <FieldGroup className="gap-5">
        {Array.from({ length: MAX_INVITES }, (_, index: number) => {
          const message = errors.invites?.[index]
          const id = `invite-${index + 1}`
          return (
            <Field key={id} data-invalid={message ? true : undefined}>
              <FieldLabel htmlFor={id} className="sr-only">
                Teammate {index + 1} email
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <MailIcon aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  id={id}
                  name={id}
                  type="email"
                  autoComplete="off"
                  placeholder={`teammate${index + 1}@acmelabs.io`}
                  value={state.invites[index] ?? ""}
                  onChange={(event) => updateInvite(index, event.target.value)}
                  aria-invalid={message ? true : undefined}
                  aria-describedby={message ? `${id}-error` : undefined}
                />
              </InputGroup>
              <FieldError id={`${id}-error`}>{message}</FieldError>
            </Field>
          )
        })}
      </FieldGroup>
    </FieldSet>
  )
}

export function PreferencesStep({ state, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldTitle id="theme-label">Theme</FieldTitle>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-labelledby="theme-label"
          value={state.theme}
          onValueChange={(value: string) => {
            if (value) onChange({ theme: value as ThemeValue })
          }}
          className="w-full sm:w-fit"
        >
          {themeOptions.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="flex-1 sm:flex-none"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription>
          &quot;System&quot; follows your device&apos;s appearance setting.
        </FieldDescription>
      </Field>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="weekly-digest">Weekly digest</FieldLabel>
          <FieldDescription>
            A Monday email with your top events, new issues and what changed.
          </FieldDescription>
        </FieldContent>
        <Switch
          id="weekly-digest"
          checked={state.weeklyDigest}
          onCheckedChange={(checked: boolean) =>
            onChange({ weeklyDigest: checked })
          }
        />
      </Field>
    </FieldGroup>
  )
}
