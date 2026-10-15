Writing the page now.

```tsx
"use client";

import * as React from "react";
import {
  AlertTriangleIcon,
  BellIcon,
  CameraIcon,
  CheckIcon,
  CreditCardIcon,
  GlobeIcon,
  Trash2Icon,
  UserIcon,
  ShieldIcon,
  AtSignIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Placeholder data                                                           */
/* -------------------------------------------------------------------------- */

type SectionId = "profile" | "account" | "notifications" | "billing" | "danger";

interface SectionDef {
  id: SectionId;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: SectionDef[] = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "account", label: "Account", icon: ShieldIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "billing", label: "Billing", icon: CreditCardIcon },
  { id: "danger", label: "Danger zone", icon: AlertTriangleIcon },
];

const TIMEZONES = [
  { value: "america-los_angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "america-denver", label: "Mountain Time (UTC−07:00)" },
  { value: "america-new_york", label: "Eastern Time (UTC−05:00)" },
  { value: "europe-london", label: "London (UTC+00:00)" },
  { value: "europe-berlin", label: "Berlin (UTC+01:00)" },
  { value: "asia-kolkata", label: "India Standard Time (UTC+05:30)" },
  { value: "asia-tokyo", label: "Tokyo (UTC+09:00)" },
];

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "de-DE", label: "Deutsch" },
  { value: "fr-FR", label: "Français" },
  { value: "es-ES", label: "Español" },
  { value: "ja-JP", label: "日本語" },
];

const ROLES = [
  { value: "designer", label: "Product designer" },
  { value: "engineer", label: "Software engineer" },
  { value: "pm", label: "Product manager" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Other" },
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BIO_LIMIT = 200;

interface ProfileState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  website: string;
  timezone: string;
  language: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Okonkwo",
  username: "mayaokonkwo",
  email: "maya.okonkwo@northwind.example",
  role: "designer",
  bio: "Designing calm, legible interfaces for logistics teams. Currently working on the Northwind dispatch dashboard.",
  website: "mayaokonkwo.example",
  timezone: "europe-london",
  language: "en-US",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

type ProfileErrors = Partial<Record<keyof ProfileState, string>>;

function validate(profile: ProfileState): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!profile.firstName.trim()) errors.firstName = "First name is required.";
  if (!profile.lastName.trim()) errors.lastName = "Last name is required.";
  if (!USERNAME_PATTERN.test(profile.username)) {
    errors.username =
      "Use 3–20 lowercase letters, numbers or underscores.";
  }
  if (!EMAIL_PATTERN.test(profile.email)) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

function initialsOf(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SettingsPage() {
  const [profile, setProfile] = React.useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = React.useState<ProfileState>(INITIAL_PROFILE);
  const [errors, setErrors] = React.useState<ProfileErrors>({});
  const [saving, setSaving] = React.useState(false);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = React.useState({
    product: true,
    security: true,
    digest: false,
  });

  const [activeSection, setActiveSection] =
    React.useState<SectionId>("profile");

  const [confirmText, setConfirmText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  const dirty = React.useMemo(
    () => (Object.keys(profile) as (keyof ProfileState)[]).some((k) => profile[k] !== saved[k]),
    [profile, saved],
  );
  const avatarDirty = avatarUrl !== null;

  // Revoke object URLs when replaced/unmounted.
  React.useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Scroll-spy for the section nav.
  React.useEffect(() => {
    const elements = SECTIONS.map((s) =>
      document.getElementById(`section-${s.id}`),
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace("section-", "") as SectionId;
          setActiveSection(id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function update<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPG or GIF).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is larger than 2 MB. Try a smaller one.");
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
  }

  function handleRemoveAvatar() {
    setAvatarUrl(null);
    setAvatarError(null);
  }

  function handleReset() {
    setProfile(saved);
    setErrors({});
    setAvatarUrl(null);
    setAvatarError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(profile);
    setErrors(nextErrors);
    const firstInvalid = (Object.keys(nextErrors) as (keyof ProfileState)[])[0];
    if (firstInvalid) {
      document.getElementById(`profile-${firstInvalid}`)?.focus();
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSaving(false);
    setSaved(profile);
    toast.success("Profile updated", {
      description: "Your changes have been saved.",
    });
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setDeleting(false);
    setConfirmText("");
    toast.success("Deletion scheduled", {
      description:
        "Your account will be permanently deleted in 14 days unless you sign in again.",
    });
  }

  function goToSection(id: SectionId) {
    setActiveSection(id);
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const bioRemaining = BIO_LIMIT - profile.bio.length;
  const canDelete = confirmText === profile.username;

  return (
    <div className="min-h-svh bg-muted/30">
      <a
        href="#settings-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Skip to settings content
      </a>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <header className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, account preferences and workspace access.
          </p>
        </header>

        <div className="flex flex-col gap-6 md:flex-row md:gap-10">
          {/* Section navigation */}
          <aside className="md:w-56 md:shrink-0">
            <nav
              aria-label="Settings sections"
              className="sticky top-0 z-10 -mx-4 bg-muted/30 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 md:top-8 md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
            >
              <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const active = activeSection === section.id;
                  const isDanger = section.id === "danger";
                  return (
                    <li key={section.id} className="shrink-0 md:shrink">
                      <a
                        href={`#section-${section.id}`}
                        aria-current={active ? "location" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          goToSection(section.id);
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
                          isDanger && !active && "hover:text-destructive",
                          isDanger && "text-destructive/90",
                        )}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        {section.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <main
            id="settings-content"
            className="flex min-w-0 flex-1 flex-col gap-8"
          >
            {/* Profile */}
            <section
              id="section-profile"
              aria-labelledby="heading-profile"
              className="scroll-mt-20 md:scroll-mt-8"
            >
              <form onSubmit={handleSubmit} noValidate>
                <Card>
                  <CardHeader>
                    <CardTitle id="heading-profile" asChild-heading="">
                      <h2 className="text-lg leading-none font-semibold">
                        Profile
                      </h2>
                    </CardTitle>
                    <CardDescription>
                      This information appears on your public profile and in
                      comments across the workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      {/* Avatar */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Avatar className="size-20 text-xl">
                          {avatarUrl ? (
                            <AvatarImage
                              src={avatarUrl}
                              alt="Your new profile photo preview"
                            />
                          ) : null}
                          <AvatarFallback className="text-xl">
                            {initialsOf(profile.firstName, profile.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap gap-2">
                            <input
                              ref={fileInputRef}
                              id="avatar-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/gif"
                              className="sr-only"
                              onChange={handleAvatarChange}
                              aria-describedby="avatar-help"
                              tabIndex={-1}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <CameraIcon data-icon="inline-start" />
                              {avatarUrl ? "Change photo" : "Upload photo"}
                            </Button>
                            {avatarUrl ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveAvatar}
                              >
                                <Trash2Icon data-icon="inline-start" />
                                Remove
                              </Button>
                            ) : null}
                          </div>
                          <p
                            id="avatar-help"
                            className="text-sm text-muted-foreground"
                          >
                            PNG, JPG or GIF. Maximum size 2 MB.
                          </p>
                          {avatarError ? (
                            <FieldError>{avatarError}</FieldError>
                          ) : null}
                        </div>
                      </div>

                      <Separator />

                      {/* Name */}
                      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-4">
                        <Field data-invalid={errors.firstName ? true : undefined}>
                          <FieldLabel htmlFor="profile-firstName">
                            First name
                          </FieldLabel>
                          <Input
                            id="profile-firstName"
                            autoComplete="given-name"
                            value={profile.firstName}
                            onChange={(e) => update("firstName", e.target.value)}
                            aria-invalid={errors.firstName ? true : undefined}
                            aria-describedby={
                              errors.firstName ? "profile-firstName-error" : undefined
                            }
                          />
                          {errors.firstName ? (
                            <FieldError id="profile-firstName-error">
                              {errors.firstName}
                            </FieldError>
                          ) : null}
                        </Field>
                        <Field data-invalid={errors.lastName ? true : undefined}>
                          <FieldLabel htmlFor="profile-lastName">
                            Last name
                          </FieldLabel>
                          <Input
                            id="profile-lastName"
                            autoComplete="family-name"
                            value={profile.lastName}
                            onChange={(e) => update("lastName", e.target.value)}
                            aria-invalid={errors.lastName ? true : undefined}
                            aria-describedby={
                              errors.lastName ? "profile-lastName-error" : undefined
                            }
                          />
                          {errors.lastName ? (
                            <FieldError id="profile-lastName-error">
                              {errors.lastName}
                            </FieldError>
                          ) : null}
                        </Field>
                      </div>

                      {/* Username */}
                      <Field data-invalid={errors.username ? true : undefined}>
                        <FieldLabel htmlFor="profile-username">
                          Username
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <AtSignIcon aria-hidden="true" />
                          </InputGroupAddon>
                          <InputGroupInput
                            id="profile-username"
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            value={profile.username}
                            onChange={(e) =>
                              update("username", e.target.value.toLowerCase())
                            }
                            aria-invalid={errors.username ? true : undefined}
                            aria-describedby={
                              errors.username
                                ? "profile-username-error"
                                : "profile-username-help"
                            }
                          />
                        </InputGroup>
                        {errors.username ? (
                          <FieldError id="profile-username-error">
                            {errors.username}
                          </FieldError>
                        ) : (
                          <FieldDescription id="profile-username-help">
                            Your profile lives at northwind.example/
                            {profile.username || "username"}.
                          </FieldDescription>
                        )}
                      </Field>

                      {/* Email */}
                      <Field data-invalid={errors.email ? true : undefined}>
                        <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                        <Input
                          id="profile-email"
                          type="email"
                          autoComplete="email"
                          value={profile.email}
                          onChange={(e) => update("email", e.target.value)}
                          aria-invalid={errors.email ? true : undefined}
                          aria-describedby={
                            errors.email
                              ? "profile-email-error"
                              : "profile-email-help"
                          }
                        />
                        {errors.email ? (
                          <FieldError id="profile-email-error">
                            {errors.email}
                          </FieldError>
                        ) : (
                          <FieldDescription id="profile-email-help">
                            We&apos;ll send a confirmation link if you change
                            this address.
                          </FieldDescription>
                        )}
                      </Field>

                      {/* Role */}
                      <Field>
                        <FieldLabel htmlFor="profile-role">Role</FieldLabel>
                        <Select
                          value={profile.role}
                          onValueChange={(v) => update("role", v)}
                        >
                          <SelectTrigger id="profile-role" className="w-full">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {ROLES.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>

                      {/* Bio */}
                      <Field>
                        <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                        <Textarea
                          id="profile-bio"
                          rows={4}
                          maxLength={BIO_LIMIT}
                          value={profile.bio}
                          onChange={(e) => update("bio", e.target.value)}
                          aria-describedby="profile-bio-help"
                          className="resize-y"
                        />
                        <FieldDescription id="profile-bio-help">
                          A short introduction.{" "}
                          <span
                            className={cn(
                              "tabular-nums",
                              bioRemaining <= 20 && "text-foreground",
                            )}
                          >
                            {bioRemaining} characters left.
                          </span>
                        </FieldDescription>
                      </Field>

                      {/* Website */}
                      <Field>
                        <FieldLabel htmlFor="profile-website">
                          Website
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>
                              <GlobeIcon aria-hidden="true" />
                              https://
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="profile-website"
                            type="text"
                            inputMode="url"
                            autoCapitalize="none"
                            spellCheck={false}
                            value={profile.website}
                            onChange={(e) => update("website", e.target.value)}
                          />
                        </InputGroup>
                      </Field>

                      <Separator />

                      {/* Preferences */}
                      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-4">
                        <Field>
                          <FieldLabel htmlFor="profile-timezone">
                            Time zone
                          </FieldLabel>
                          <Select
                            value={profile.timezone}
                            onValueChange={(v) => update("timezone", v)}
                          >
                            <SelectTrigger
                              id="profile-timezone"
                              className="w-full"
                            >
                              <SelectValue placeholder="Select a time zone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {TIMEZONES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="profile-language">
                            Language
                          </FieldLabel>
                          <Select
                            value={profile.language}
                            onValueChange={(v) => update("language", v)}
                          >
                            <SelectTrigger
                              id="profile-language"
                              className="w-full"
                            >
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {LANGUAGES.map((l) => (
                                  <SelectItem key={l.value} value={l.value}>
                                    {l.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </FieldGroup>
                  </CardContent>
                  <CardFooter className="flex-col-reverse items-stretch gap-2 border-t sm:flex-row sm:items-center sm:justify-end">
                    <p
                      className="text-sm text-muted-foreground sm:mr-auto"
                      role="status"
                      aria-live="polite"
                    >
                      {dirty || avatarDirty
                        ? "You have unsaved changes."
                        : "All changes saved."}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      disabled={(!dirty && !avatarDirty) || saving}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={(!dirty && !avatarDirty) || saving}
                    >
                      {saving ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <CheckIcon data-icon="inline-start" />
                      )}
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </section>

            {/* Account */}
            <section
              id="section-account"
              aria-labelledby="heading-account"
              className="scroll-mt-20 md:scroll-mt-8"
            >
              <Card>
                <CardHeader>
                  <h2
                    id="heading-account"
                    className="text-lg leading-none font-semibold"
                  >
                    Account
                  </h2>
                  <CardDescription>
                    Security and sign-in details for your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed 3 months ago.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" type="button">
                      Change password
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        Two-factor authentication
                        <Badge variant="secondary">Enabled</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Using an authenticator app on your phone.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" type="button">
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Notifications */}
            <section
              id="section-notifications"
              aria-labelledby="heading-notifications"
              className="scroll-mt-20 md:scroll-mt-8"
            >
              <Card>
                <CardHeader>
                  <h2
                    id="heading-notifications"
                    className="text-lg leading-none font-semibold"
                  >
                    Notifications
                  </h2>
                  <CardDescription>
                    Choose which emails you&apos;d like to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-5">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>
                          <label htmlFor="notif-product">Product updates</label>
                        </FieldTitle>
                        <FieldDescription>
                          New features and improvements, about once a month.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="notif-product"
                        checked={notifications.product}
                        onCheckedChange={(v) =>
                          setNotifications((n) => ({ ...n, product: v }))
                        }
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>
                          <label htmlFor="notif-security">Security alerts</label>
                        </FieldTitle>
                        <FieldDescription>
                          Sign-ins from new devices and password changes.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="notif-security"
                        checked={notifications.security}
                        onCheckedChange={(v) =>
                          setNotifications((n) => ({ ...n, security: v }))
                        }
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>
                          <label htmlFor="notif-digest">Weekly digest</label>
                        </FieldTitle>
                        <FieldDescription>
                          A Monday summary of activity in your projects.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="notif-digest"
                        checked={notifications.digest}
                        onCheckedChange={(v) =>
                          setNotifications((n) => ({ ...n, digest: v }))
                        }
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            </section>

            {/* Billing */}
            <section
              id="section-billing"
              aria-labelledby="heading-billing"
              className="scroll-mt-20 md:scroll-mt-8"
            >
              <Card>
                <CardHeader>
                  <h2
                    id="heading-billing"
                    className="text-lg leading-none font-semibold"
                  >
                    Billing
                  </h2>
                  <CardDescription>
                    Your current plan and payment method.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        Team plan
                        <Badge variant="outline">Monthly</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        $24 per seat · 5 seats · renews on 14 July.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" type="button">
                      Change plan
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                        <CreditCardIcon
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">
                          Visa ending in 4242
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires 09/2028
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" type="button">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Danger zone */}
            <section
              id="section-danger"
              aria-labelledby="heading-danger"
              className="scroll-mt-20 md:scroll-mt-8"
            >
              <Card className="border-destructive/40">
                <CardHeader>
                  <h2
                    id="heading-danger"
                    className="text-lg leading-none font-semibold text-destructive"
                  >
                    Danger zone
                  </h2>
                  <CardDescription>
                    Irreversible actions. Please proceed with care.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Export your data</p>
                      <p className="text-sm text-muted-foreground">
                        Download an archive of your projects, comments and
                        profile information.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() =>
                        toast.info("Export requested", {
                          description:
                            "We'll email you a download link within a few minutes.",
                        })
                      }
                    >
                      Request export
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Delete account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently remove your account and all associated
                        data. This cannot be undone.
                      </p>
                    </div>
                    <AlertDialog
                      onOpenChange={(open) => {
                        if (!open) setConfirmText("");
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" type="button">
                          <Trash2Icon data-icon="inline-start" />
                          Delete account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete your account?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete{" "}
                            <strong className="font-medium text-foreground">
                              {profile.email}
                            </strong>{" "}
                            along with all of your projects and comments. Type
                            your username to confirm.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Field>
                          <FieldLabel htmlFor="confirm-delete">
                            Type{" "}
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                              {profile.username}
                            </code>{" "}
                            to confirm
                          </FieldLabel>
                          <Input
                            id="confirm-delete"
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                          />
                        </Field>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={!canDelete || deleting}
                            onClick={handleDeleteAccount}
                          >
                            {deleting ? "Deleting…" : "Delete account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
```

One thing to fix before using this: the Profile card title has a stray `asChild-heading=""` attribute on `CardTitle`, which is invalid. Replace that block with:

```tsx
<h2 id="heading-profile" className="text-lg leading-none font-semibold">
  Profile
</h2>
```