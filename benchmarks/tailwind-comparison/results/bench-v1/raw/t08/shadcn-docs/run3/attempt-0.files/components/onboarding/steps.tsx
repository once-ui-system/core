"use client";

import { MAX_INVITES, TEAM_SIZES, THEMES } from "@/lib/data";
import type { Errors, OnboardingData, Theme } from "@/lib/onboarding";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

interface StepProps {
  data: OnboardingData;
  errors: Errors;
  update: (patch: Partial<OnboardingData>) => void;
}

export function AccountStep({ data, errors, update }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="name">Full name</FieldLabel>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Maya Okafor"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
      </Field>
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">Work email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maya@acmelabs.io"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          aria-invalid={!!errors.email}
          aria-describedby={
            errors.email ? "email-error" : "email-description"
          }
        />
        {errors.email ? (
          <FieldError id="email-error">{errors.email}</FieldError>
        ) : (
          <FieldDescription id="email-description">
            We'll send your sign-in link and billing receipts here.
          </FieldDescription>
        )}
      </Field>
    </FieldGroup>
  );
}

export function WorkspaceStep({ data, errors, update }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.workspace}>
        <FieldLabel htmlFor="workspace">Workspace name</FieldLabel>
        <Input
          id="workspace"
          name="workspace"
          autoComplete="organization"
          placeholder="Acme Labs"
          value={data.workspace}
          onChange={(e) => update({ workspace: e.target.value })}
          aria-invalid={!!errors.workspace}
          aria-describedby={
            errors.workspace ? "workspace-error" : "workspace-description"
          }
        />
        {errors.workspace ? (
          <FieldError id="workspace-error">{errors.workspace}</FieldError>
        ) : (
          <FieldDescription id="workspace-description">
            Usually your company or team name. You can change it later.
          </FieldDescription>
        )}
      </Field>
      <Field data-invalid={!!errors.teamSize}>
        <FieldLabel htmlFor="team-size">Team size</FieldLabel>
        <Select
          value={data.teamSize}
          onValueChange={(teamSize) => update({ teamSize })}
        >
          <SelectTrigger
            id="team-size"
            className="w-full"
            aria-invalid={!!errors.teamSize}
            aria-describedby={errors.teamSize ? "team-size-error" : undefined}
          >
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {TEAM_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.teamSize && (
          <FieldError id="team-size-error">{errors.teamSize}</FieldError>
        )}
      </Field>
    </FieldGroup>
  );
}

export function InviteStep({ data, errors, update }: StepProps) {
  const setInvite = (index: number, value: string) => {
    const invites = [...data.invites];
    invites[index] = value;
    update({ invites });
  };

  return (
    <FieldSet>
      <FieldLegend variant="label">Teammate emails</FieldLegend>
      <FieldDescription>
        Optional. Invite up to {MAX_INVITES} people now, or skip this step and
        do it later from Settings.
      </FieldDescription>
      <FieldGroup className="gap-5">
        {Array.from({ length: MAX_INVITES }, (_, i) => {
          const key = `invite-${i}`;
          return (
            <Field key={key} data-invalid={!!errors[key]}>
              <FieldLabel htmlFor={key}>Teammate {i + 1}</FieldLabel>
              <Input
                id={key}
                name={key}
                type="email"
                autoComplete="off"
                placeholder={
                  ["daniel@acmelabs.io", "priya@acmelabs.io", "tomas@acmelabs.io"][i]
                }
                value={data.invites[i] ?? ""}
                onChange={(e) => setInvite(i, e.target.value)}
                aria-invalid={!!errors[key]}
                aria-describedby={errors[key] ? `${key}-error` : undefined}
              />
              {errors[key] && (
                <FieldError id={`${key}-error`}>{errors[key]}</FieldError>
              )}
            </Field>
          );
        })}
      </FieldGroup>
    </FieldSet>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
} as const;

export function PreferencesStep({ data, update }: StepProps) {
  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">Theme</FieldLegend>
        <ToggleGroup
          type="single"
          variant="outline"
          value={data.theme}
          onValueChange={(value) => {
            if (value) update({ theme: value as Theme });
          }}
          aria-label="Theme"
          className="w-full sm:w-fit"
        >
          {THEMES.map((theme) => {
            const Icon = THEME_ICONS[theme.value];
            return (
              <ToggleGroupItem
                key={theme.value}
                value={theme.value}
                className="flex-1 sm:flex-none"
              >
                <Icon aria-hidden="true" />
                {theme.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <FieldDescription>
          Applied right away so you can preview it.
        </FieldDescription>
      </FieldSet>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="digest">Weekly digest</FieldLabel>
          <FieldDescription>
            A Monday email with new issues, active users and what changed last
            week.
          </FieldDescription>
        </FieldContent>
        <Switch
          id="digest"
          checked={data.digest}
          onCheckedChange={(digest) => update({ digest })}
        />
      </Field>
    </FieldGroup>
  );
}
