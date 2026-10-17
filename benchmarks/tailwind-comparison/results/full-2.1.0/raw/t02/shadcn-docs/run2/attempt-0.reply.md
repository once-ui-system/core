```tsx
"use client";

import * as React from "react";
import {
  BellIcon,
  CameraIcon,
  CheckIcon,
  CreditCardIcon,
  MailIcon,
  PaletteIcon,
  ShieldAlertIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UploadIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Static content                                                             */
/* -------------------------------------------------------------------------- */

const WORKSPACE_SLUG = "northwind-studio";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BIO_LIMIT = 200;

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "account", label: "Account", icon: MailIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "appearance", label: "Appearance", icon: PaletteIcon },
  { id: "billing", label: "Billing", icon: CreditCardIcon },
  { id: "danger", label: "Danger zone", icon: ShieldAlertIcon },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const TIMEZONES = [
  { group: "Americas", items: [
    { value: "america-los_angeles", label: "Pacific Time (UTC−08:00)" },
    { value: "america-denver", label: "Mountain Time (UTC−07:00)" },
    { value: "america-new_york", label: "Eastern Time (UTC−05:00)" },
    { value: "america-sao_paulo", label: "São Paulo (UTC−03:00)" },
  ] },
  { group: "Europe & Africa", items: [
    { value: "europe-london", label: "London (UTC+00:00)" },
    { value: "europe-berlin", label: "Berlin (UTC+01:00)" },
    { value: "africa-nairobi", label: "Nairobi (UTC+03:00)" },
  ] },
  { group: "Asia & Pacific", items: [
    { value: "asia-kolkata", label: "Mumbai (UTC+05:30)" },
    { value: "asia-tokyo", label: "Tokyo (UTC+09:00)" },
    { value: "australia-sydney", label: "Sydney (UTC+10:00)" },
  ] },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
];

const ROLES = [
  { value: "designer", label: "Product designer" },
  { value: "engineer", label: "Software engineer" },
  { value: "manager", label: "Product manager" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Other" },
];

interface ProfileState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  website: string;
  bio: string;
  timezone: string;
  language: string;
  role: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Amara",
  lastName: "Okafor",
  username: "amara.okafor",
  email: "amara@northwind.studio",
  website: "northwind.studio/amara",
  bio: "Product designer focused on design systems and accessible interfaces. Currently building the Northwind component library.",
  timezone: "europe-london",
  language: "en",
  role: "designer",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getInitials(first: string, last: string): string {
  const letters = `${first.trim().charAt(0)}${last.trim().charAt(0)}`;
  return letters.toUpperCase() || "?";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* -------------------------------------------------------------------------- */
/* Section navigation                                                         */
/* -------------------------------------------------------------------------- */

function SettingsNav({
  active,
  onNavigate,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <nav aria-label="Settings sections" className="lg:sticky lg:top-8">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const isDanger = id === "danger";
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(id);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  isDanger && !isActive && "text-destructive hover:text-destructive"
                )}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar uploader                                                            */
/* -------------------------------------------------------------------------- */

function AvatarUploader({
  initials,
  previewUrl,
  fileName,
  error,
  onSelect,
  onRemove,
}: {
  initials: string;
  previewUrl: string | null;
  fileName: string | null;
  error: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const errorId = React.useId();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar className="size-20 text-xl">
            {previewUrl ? (
              <AvatarImage src={previewUrl} alt="Your new profile photo preview" />
            ) : null}
            <AvatarFallback className="text-xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Change profile photo"
            className="absolute -right-1 -bottom-1 inline-flex size-8 items-center justify-center rounded-full border bg-background text-foreground shadow-xs transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <CameraIcon aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <UploadIcon data-icon="inline-start" />
              Upload photo
            </Button>
            {previewUrl ? (
              <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
                <XIcon data-icon="inline-start" />
                Remove
              </Button>
            ) : null}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {fileName
              ? `Selected: ${fileName}`
              : "JPG, PNG or WebP. Max size 2 MB."}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-label="Upload profile photo"
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.target.value = "";
        }}
      />

      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete workspace dialog                                                    */
/* -------------------------------------------------------------------------- */

function DeleteWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [confirmation, setConfirmation] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const inputId = React.useId();
  const matches = confirmation === WORKSPACE_SLUG;

  React.useEffect(() => {
    if (!open) {
      setConfirmation("");
      setDeleting(false);
    }
  }, [open]);

  function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!matches || deleting) return;
    setDeleting(true);
    window.setTimeout(() => {
      setDeleting(false);
      onOpenChange(false);
      toast.success("Workspace scheduled for deletion", {
        description: "You have 14 days to restore it from your email link.",
      });
    }, 1200);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleDelete} className="grid gap-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">
                {WORKSPACE_SLUG}
              </span>
              , including 48 projects, 1,204 files and all member access. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Field>
            <FieldLabel htmlFor={inputId}>
              Type{" "}
              <span className="font-mono font-semibold">{WORKSPACE_SLUG}</span>{" "}
              to confirm
            </FieldLabel>
            <Input
              id={inputId}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={WORKSPACE_SLUG}
            />
          </Field>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={!matches || deleting}
            >
              {deleting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2Icon data-icon="inline-start" />
              )}
              {deleting ? "Deleting…" : "Delete workspace"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = React.useState<SectionId>("profile");

  const [saved, setSaved] = React.useState<ProfileState>(INITIAL_PROFILE);
  const [profile, setProfile] = React.useState<ProfileState>(INITIAL_PROFILE);
  const [touched, setTouched] = React.useState<Partial<Record<keyof ProfileState, boolean>>>({});
  const [saving, setSaving] = React.useState(false);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarName, setAvatarName] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);

  const [emailDigest, setEmailDigest] = React.useState(true);
  const [productUpdates, setProductUpdates] = React.useState(false);
  const [securityAlerts, setSecurityAlerts] = React.useState(true);
  const [theme, setTheme] = React.useState("system");
  const [density, setDensity] = React.useState("comfortable");

  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // Revoke object URLs on change/unmount to avoid leaking memory.
  React.useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Highlight the section currently in view.
  React.useEffect(() => {
    const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0];
        if (top) setActiveSection(top.target.id as SectionId);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function navigateTo(id: SectionId) {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
    window.history.replaceState(null, "", `#${id}`);
  }

  function update<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function touch(key: keyof ProfileState) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function handleAvatarSelect(file: File) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setAvatarError("Unsupported file type. Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(`That file is ${formatBytes(file.size)}. Choose an image under 2 MB.`);
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
    setAvatarName(`${file.name} (${formatBytes(file.size)})`);
  }

  function handleAvatarRemove() {
    setAvatarUrl(null);
    setAvatarName(null);
    setAvatarError(null);
  }

  const errors = {
    firstName: profile.firstName.trim() ? null : "First name is required.",
    lastName: profile.lastName.trim() ? null : "Last name is required.",
    username: /^[a-z0-9._-]{3,30}$/i.test(profile.username)
      ? null
      : "Use 3–30 letters, numbers, dots, dashes or underscores.",
    email: isValidEmail(profile.email) ? null : "Enter a valid email address.",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const isDirty =
    JSON.stringify(profile) !== JSON.stringify(saved) || avatarUrl !== null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (hasErrors) {
      setTouched({ firstName: true, lastName: true, username: true, email: true });
      toast.error("Fix the highlighted fields before saving.");
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setSaved(profile);
      toast.success("Profile updated", {
        description: "Your changes are now visible to your team.",
      });
    }, 900);
  }

  function handleReset() {
    setProfile(saved);
    setTouched({});
    handleAvatarRemove();
  }

  const initials = getInitials(profile.firstName, profile.lastName);
  const showError = (key: keyof typeof errors) => (touched[key] ? errors[key] : null);

  return (
    <div className="min-h-svh bg-muted/30">
      <a
        href="#profile"
        onClick={(event) => {
          event.preventDefault();
          navigateTo("profile");
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Skip to settings content
      </a>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, preferences and workspace for{" "}
            <span className="font-medium text-foreground">Northwind Studio</span>.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <aside>
            <SettingsNav active={activeSection} onNavigate={navigateTo} />
          </aside>

          <main className="flex min-w-0 flex-col gap-8">
            {/* ------------------------------ Profile ------------------------------ */}
            <section
              id="profile"
              tabIndex={-1}
              aria-labelledby="profile-heading"
              className="scroll-mt-6 outline-none"
            >
              <form onSubmit={handleSubmit} noValidate>
                <Card>
                  <CardHeader>
                    <CardTitle id="profile-heading" className="text-lg">
                      Profile
                    </CardTitle>
                    <CardDescription>
                      This information appears on your public profile and in
                      comments across the workspace.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <FieldGroup>
                      <Field>
                        <FieldTitle>Profile photo</FieldTitle>
                        <AvatarUploader
                          initials={initials}
                          previewUrl={avatarUrl}
                          fileName={avatarName}
                          error={avatarError}
                          onSelect={handleAvatarSelect}
                          onRemove={handleAvatarRemove}
                        />
                      </Field>

                      <Separator />

                      <div className="grid gap-7 sm:grid-cols-2">
                        <Field data-invalid={showError("firstName") ? true : undefined}>
                          <FieldLabel htmlFor="first-name">First name</FieldLabel>
                          <Input
                            id="first-name"
                            autoComplete="given-name"
                            value={profile.firstName}
                            onChange={(e) => update("firstName", e.target.value)}
                            onBlur={() => touch("firstName")}
                            aria-invalid={showError("firstName") ? true : undefined}
                            aria-describedby={showError("firstName") ? "first-name-error" : undefined}
                          />
                          {showError("firstName") ? (
                            <FieldError id="first-name-error">{errors.firstName}</FieldError>
                          ) : null}
                        </Field>

                        <Field data-invalid={showError("lastName") ? true : undefined}>
                          <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                          <Input
                            id="last-name"
                            autoComplete="family-name"
                            value={profile.lastName}
                            onChange={(e) => update("lastName", e.target.value)}
                            onBlur={() => touch("lastName")}
                            aria-invalid={showError("lastName") ? true : undefined}
                            aria-describedby={showError("lastName") ? "last-name-error" : undefined}
                          />
                          {showError("lastName") ? (
                            <FieldError id="last-name-error">{errors.lastName}</FieldError>
                          ) : null}
                        </Field>
                      </div>

                      <Field data-invalid={showError("username") ? true : undefined}>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>northwind.studio/</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="username"
                            autoComplete="username"
                            autoCapitalize="off"
                            spellCheck={false}
                            value={profile.username}
                            onChange={(e) => update("username", e.target.value)}
                            onBlur={() => touch("username")}
                            aria-invalid={showError("username") ? true : undefined}
                            aria-describedby={
                              showError("username") ? "username-error" : "username-help"
                            }
                          />
                        </InputGroup>
                        {showError("username") ? (
                          <FieldError id="username-error">{errors.username}</FieldError>
                        ) : (
                          <FieldDescription id="username-help">
                            Your profile link. You can change it once every 30 days.
                          </FieldDescription>
                        )}
                      </Field>

                      <Field data-invalid={showError("email") ? true : undefined}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={profile.email}
                          onChange={(e) => update("email", e.target.value)}
                          onBlur={() => touch("email")}
                          aria-invalid={showError("email") ? true : undefined}
                          aria-describedby={showError("email") ? "email-error" : "email-help"}
                        />
                        {showError("email") ? (
                          <FieldError id="email-error">{errors.email}</FieldError>
                        ) : (
                          <FieldDescription id="email-help">
                            We send receipts and security notices to this address.
                          </FieldDescription>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="website">Website</FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>https://</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="website"
                            type="text"
                            inputMode="url"
                            autoComplete="url"
                            value={profile.website}
                            onChange={(e) => update("website", e.target.value)}
                          />
                        </InputGroup>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="bio">Bio</FieldLabel>
                        <Textarea
                          id="bio"
                          rows={4}
                          maxLength={BIO_LIMIT}
                          value={profile.bio}
                          onChange={(e) => update("bio", e.target.value)}
                          aria-describedby="bio-help"
                          className="resize-y"
                        />
                        <FieldDescription id="bio-help" className="flex justify-between gap-4">
                          <span>A short introduction for your teammates.</span>
                          <span aria-live="polite" className="tabular-nums">
                            {profile.bio.length}/{BIO_LIMIT}
                          </span>
                        </FieldDescription>
                      </Field>

                      <div className="grid gap-7 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="role">Role</FieldLabel>
                          <Select value={profile.role} onValueChange={(v) => update("role", v)}>
                            <SelectTrigger id="role" className="w-full">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectGroup>
                                {ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="language">Language</FieldLabel>
                          <Select
                            value={profile.language}
                            onValueChange={(v) => update("language", v)}
                          >
                            <SelectTrigger id="language" className="w-full">
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectGroup>
                                {LANGUAGES.map((language) => (
                                  <SelectItem key={language.value} value={language.value}>
                                    {language.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor="timezone">Time zone</FieldLabel>
                        <Select
                          value={profile.timezone}
                          onValueChange={(v) => update("timezone", v)}
                        >
                          <SelectTrigger id="timezone" className="w-full">
                            <SelectValue placeholder="Select a time zone" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {TIMEZONES.map((zone) => (
                              <SelectGroup key={zone.group}>
                                <SelectLabel>{zone.group}</SelectLabel>
                                {zone.items.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Used for scheduling, due dates and notification times.
                        </FieldDescription>
                      </Field>
                    </FieldGroup>
                  </CardContent>

                  <CardFooter className="flex-col-reverse items-stretch gap-2 border-t sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleReset}
                      disabled={!isDirty || saving}
                    >
                      Discard changes
                    </Button>
                    <Button type="submit" disabled={!isDirty || saving}>
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

            {/* ------------------------------ Account ------------------------------ */}
            <section
              id="account"
              tabIndex={-1}
              aria-labelledby="account-heading"
              className="scroll-mt-6 outline-none"
            >
              <Card>
                <CardHeader>
                  <CardTitle id="account-heading" className="text-lg">
                    Account
                  </CardTitle>
                  <CardDescription>
                    Sign-in and security details for your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed 4 months ago.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start sm:self-auto"
                      onClick={() => toast("Password reset link sent to your email.")}
                    >
                      Change password
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-0.5">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        Two-factor authentication
                        <Badge variant="secondary">Enabled</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Using an authenticator app since March 2024.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start sm:self-auto"
                      onClick={() => toast("Recovery codes downloaded.")}
                    >
                      View recovery codes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* --------------------------- Notifications --------------------------- */}
            <section
              id="notifications"
              tabIndex={-1}
              aria-labelledby="notifications-heading"
              className="scroll-mt-6 outline-none"
            >
              <Card>
                <CardHeader>
                  <CardTitle id="notifications-heading" className="text-lg">
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Choose which emails you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldSet>
                    <FieldLegend className="sr-only">Email notifications</FieldLegend>
                    <FieldGroup className="gap-5">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldLabel htmlFor="n-digest">Weekly digest</FieldLabel>
                          <FieldDescription>
                            A Monday summary of activity across your projects.
                          </FieldDescription>
                        </FieldContent>
                        <Switch
                          id="n-digest"
                          checked={emailDigest}
                          onCheckedChange={setEmailDigest}
                        />
                      </Field>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldLabel htmlFor="n-product">Product updates</FieldLabel>
                          <FieldDescription>
                            New features, improvements and release notes.
                          </FieldDescription>
                        </FieldContent>
                        <Switch
                          id="n-product"
                          checked={productUpdates}
                          onCheckedChange={setProductUpdates}
                        />
                      </Field>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldLabel htmlFor="n-security">Security alerts</FieldLabel>
                          <FieldDescription>
                            New sign-ins and changes to your account.
                          </FieldDescription>
                        </FieldContent>
                        <Switch
                          id="n-security"
                          checked={securityAlerts}
                          onCheckedChange={setSecurityAlerts}
                        />
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                </CardContent>
              </Card>
            </section>

            {/* ---------------------------- Appearance ----------------------------- */}
            <section
              id="appearance"
              tabIndex={-1}
              aria-labelledby="appearance-heading"
              className="scroll-mt-6 outline-none"
            >
              <Card>
                <CardHeader>
                  <CardTitle id="appearance-heading" className="text-lg">
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize how the interface looks on this device.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldTitle id="theme-label">Theme</FieldTitle>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        aria-labelledby="theme-label"
                        value={theme}
                        onValueChange={(v) => {
                          if (v) setTheme(v);
                        }}
                      >
                        <ToggleGroupItem value="light">Light</ToggleGroupItem>
                        <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                        <ToggleGroupItem value="system">System</ToggleGroupItem>
                      </ToggleGroup>
                    </Field>
                    <Field>
                      <FieldTitle id="density-label">Density</FieldTitle>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                        aria-labelledby="density-label"
                        value={density}
                        onValueChange={(v) => {
                          if (v) setDensity(v);
                        }}
                      >
                        <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
                        <ToggleGroupItem value="comfortable">Comfortable</ToggleGroupItem>
                      </ToggleGroup>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            </section>

            {/* ------------------------------ Billing ------------------------------ */}
            <section
              id="billing"
              tabIndex={-1}
              aria-labelledby="billing-heading"
              className="scroll-mt-6 outline-none"
            >
              <Card>
                <CardHeader>
                  <CardTitle id="billing-heading" className="text-lg">
                    Billing
                  </CardTitle>
                  <CardDescription>
                    Your plan and payment method for this workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-0.5">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      Team plan
                      <Badge variant="outline">$24 / seat / month</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      8 seats · Renews on 1 July 2025 · Visa ending in 4242
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start sm:self-auto"
                    onClick={() => toast("Opening billing portal…")}
                  >
                    Manage billing
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* ---------------------------- Danger zone ---------------------------- */}
            <section
              id="danger"
              tabIndex={-1}
              aria-labelledby="danger-heading"
              className="scroll-mt-6 outline-none"
            >
              <Card className="border-destructive/40">
                <CardHeader>
                  <CardTitle
                    id="danger-heading"
                    className="flex items-center gap-2 text-lg text-destructive"
                  >
                    <ShieldAlertIcon aria-hidden="true" className="size-5" />
                    Danger zone
                  </CardTitle>
                  <CardDescription>
                    These actions are permanent or hard to reverse. Proceed with
                    care.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <Alert variant="destructive">
                    <TriangleAlertIcon aria-hidden="true" />
                    <AlertTitle>You are the only workspace owner</AlertTitle>
                    <AlertDescription>
                      <p>
                        Transfer ownership before leaving, or delete the
                        workspace to remove all data.
                      </p>
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">Export workspace data</p>
                      <p className="text-sm text-muted-foreground">
                        Download a ZIP of every project, file and comment.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-start sm:self-auto"
                      onClick={() =>
                        toast.success("Export started", {
                          description: "We will email you a download link within 10 minutes.",
                        })
                      }
                    >
                      Request export
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">Delete workspace</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete{" "}
                        <span className="font-mono text-foreground">{WORKSPACE_SLUG}</span>{" "}
                        and everything in it.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="self-start sm:self-auto"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2Icon data-icon="inline-start" />
                      Delete workspace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>

      <DeleteWorkspaceDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
```