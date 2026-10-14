```tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  BellIcon,
  CameraIcon,
  Loader2Icon,
  ShieldIcon,
  TriangleAlertIcon,
  Trash2Icon,
  UploadIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ----------------------------- Static content ----------------------------- */

type SectionId = "profile" | "preferences" | "notifications" | "danger";

const SECTIONS: {
  id: SectionId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Your public identity",
    icon: UserIcon,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Language and region",
    icon: ShieldIcon,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Emails and alerts",
    icon: BellIcon,
  },
  {
    id: "danger",
    label: "Danger zone",
    description: "Irreversible actions",
    icon: TriangleAlertIcon,
  },
];

const ROLES = [
  { value: "product-designer", label: "Product designer" },
  { value: "frontend-engineer", label: "Frontend engineer" },
  { value: "engineering-manager", label: "Engineering manager" },
  { value: "product-manager", label: "Product manager" },
  { value: "researcher", label: "User researcher" },
];

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "America/New_York", label: "Eastern Time (UTC−05:00)" },
  { value: "Europe/London", label: "London (UTC+00:00)" },
  { value: "Europe/Berlin", label: "Central European Time (UTC+01:00)" },
  { value: "Asia/Kolkata", label: "India Standard Time (UTC+05:30)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (UTC+09:00)" },
];

const LANGUAGES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "de-DE", label: "Deutsch" },
  { value: "fr-FR", label: "Français" },
  { value: "es-ES", label: "Español" },
  { value: "ja-JP", label: "日本語" },
];

const DATE_FORMATS = [
  { value: "mdy", label: "MM/DD/YYYY — 03/14/2026" },
  { value: "dmy", label: "DD/MM/YYYY — 14/03/2026" },
  { value: "ymd", label: "YYYY-MM-DD — 2026-03-14" },
];

const NOTIFICATIONS: {
  id: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}[] = [
  {
    id: "notif-comments",
    title: "Comments and mentions",
    description: "Get an email when a teammate replies to you or @mentions you.",
    defaultChecked: true,
  },
  {
    id: "notif-digest",
    title: "Weekly digest",
    description: "A Monday summary of activity across the projects you follow.",
    defaultChecked: true,
  },
  {
    id: "notif-security",
    title: "Security alerts",
    description: "New sign-ins from unrecognized devices and password changes.",
    defaultChecked: true,
  },
  {
    id: "notif-product",
    title: "Product updates",
    description: "Occasional news about new features and improvements.",
    defaultChecked: false,
  },
];

const MAX_BIO = 240;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCOUNT_HANDLE = "maya-okafor";

/* ------------------------------- Form state ------------------------------- */

interface ProfileValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  website: string;
  bio: string;
}

type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

const INITIAL_PROFILE: ProfileValues = {
  firstName: "Maya",
  lastName: "Okafor",
  username: ACCOUNT_HANDLE,
  email: "maya.okafor@northwind.example",
  role: "product-designer",
  website: "https://mayaokafor.example",
  bio: "Designing calm, legible tools for operations teams. Previously at Northwind Logistics. I write about design systems and accessibility.",
};

function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!values.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!values.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!/^[a-z0-9-]{3,30}$/.test(values.username)) {
    errors.username =
      "Use 3–30 lowercase letters, numbers or hyphens.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.website.trim()) {
    try {
      const url = new URL(values.website);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("protocol");
      }
    } catch {
      errors.website = "Enter a full URL starting with https://";
    }
  }
  if (values.bio.length > MAX_BIO) {
    errors.bio = `Bio must be ${MAX_BIO} characters or fewer.`;
  }
  return errors;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* --------------------------------- Layout --------------------------------- */

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SettingsNav({
  active,
  onNavigate,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}) {
  return (
    <nav aria-label="Settings sections">
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = active === section.id;
          const isDanger = section.id === "danger";
          return (
            <li key={section.id} className="shrink-0 lg:shrink">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(section.id);
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  isDanger && !isActive && "hover:text-destructive",
                  isDanger && "text-destructive/90",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex flex-col leading-tight">
                  <span>{section.label}</span>
                  <span className="hidden text-xs font-normal text-muted-foreground lg:inline">
                    {section.description}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------ Profile card ------------------------------ */

function ProfileCard() {
  const [values, setValues] = React.useState<ProfileValues>(INITIAL_PROFILE);
  const [saved, setSaved] = React.useState<ProfileValues>(INITIAL_PROFILE);
  const [errors, setErrors] = React.useState<ProfileErrors>({});
  const [saving, setSaving] = React.useState(false);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarMeta, setAvatarMeta] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Revoke object URLs we created so we do not leak memory.
  React.useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const dirty =
    JSON.stringify(values) !== JSON.stringify(saved) || avatarUrl !== null;

  function setField<K extends keyof ProfileValues>(
    key: K,
    value: ProfileValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setAvatarError("Choose a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(
        `That file is ${formatBytes(file.size)}. Choose an image under 2 MB.`,
      );
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
    setAvatarMeta(`${file.name} · ${formatBytes(file.size)}`);
  }

  function removeAvatar() {
    setAvatarUrl(null);
    setAvatarMeta(null);
    setAvatarError(null);
  }

  function handleReset() {
    setValues(saved);
    setErrors({});
    removeAvatar();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProfile(values);
    setErrors(nextErrors);

    const firstInvalid = (Object.keys(nextErrors) as (keyof ProfileValues)[])[0];
    if (firstInvalid) {
      toast.error("Please fix the highlighted fields.");
      const el = document.getElementById(`profile-${firstInvalid}`);
      el?.focus();
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSaving(false);
    setSaved(values);
    toast.success("Profile updated", {
      description: "Your changes are now visible to your teammates.",
    });
  }

  const initials =
    `${values.firstName.charAt(0)}${values.lastName.charAt(0)}`.toUpperCase() ||
    "?";

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate aria-labelledby="profile">
        <CardHeader className="pb-6">
          <CardTitle className="sr-only">Profile details</CardTitle>
          <SectionHeading
            id="profile"
            title="Profile"
            description="This information is shown on your public profile and in comments."
          />
        </CardHeader>

        <CardContent>
          <FieldGroup>
            {/* Avatar upload */}
            <Field data-invalid={avatarError ? true : undefined}>
              <FieldLabel htmlFor="profile-avatar">Profile photo</FieldLabel>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative w-fit">
                  <Avatar className="size-20 text-xl">
                    {avatarUrl ? (
                      <AvatarImage
                        src={avatarUrl}
                        alt="Preview of your new profile photo"
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-xl font-medium text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border bg-background shadow-xs"
                  >
                    <CameraIcon className="size-3.5 text-muted-foreground" />
                  </span>
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      id="profile-avatar"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={handleAvatarChange}
                      aria-describedby="profile-avatar-help"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadIcon aria-hidden="true" />
                      {avatarUrl ? "Choose a different photo" : "Upload photo"}
                    </Button>
                    {avatarUrl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeAvatar}
                      >
                        <XIcon aria-hidden="true" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <p
                    id="profile-avatar-help"
                    className="truncate text-sm text-muted-foreground"
                  >
                    {avatarMeta ?? "PNG, JPG or WebP. Square images work best, up to 2 MB."}
                  </p>
                  <FieldError>{avatarError}</FieldError>
                </div>
              </div>
            </Field>

            <Separator />

            {/* Names */}
            <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
              <Field data-invalid={errors.firstName ? true : undefined}>
                <FieldLabel htmlFor="profile-firstName">First name</FieldLabel>
                <Input
                  id="profile-firstName"
                  name="firstName"
                  autoComplete="given-name"
                  value={values.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  aria-invalid={errors.firstName ? true : undefined}
                  aria-describedby={
                    errors.firstName ? "profile-firstName-error" : undefined
                  }
                />
                <FieldError id="profile-firstName-error">
                  {errors.firstName}
                </FieldError>
              </Field>
              <Field data-invalid={errors.lastName ? true : undefined}>
                <FieldLabel htmlFor="profile-lastName">Last name</FieldLabel>
                <Input
                  id="profile-lastName"
                  name="lastName"
                  autoComplete="family-name"
                  value={values.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  aria-invalid={errors.lastName ? true : undefined}
                  aria-describedby={
                    errors.lastName ? "profile-lastName-error" : undefined
                  }
                />
                <FieldError id="profile-lastName-error">
                  {errors.lastName}
                </FieldError>
              </Field>
            </div>

            {/* Username */}
            <Field data-invalid={errors.username ? true : undefined}>
              <FieldLabel htmlFor="profile-username">Username</FieldLabel>
              <div className="flex">
                <span
                  aria-hidden="true"
                  className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground"
                >
                  northwind.example/
                </span>
                <Input
                  id="profile-username"
                  name="username"
                  autoComplete="username"
                  spellCheck={false}
                  className="rounded-l-none"
                  value={values.username}
                  onChange={(e) =>
                    setField("username", e.target.value.toLowerCase())
                  }
                  aria-invalid={errors.username ? true : undefined}
                  aria-describedby={
                    errors.username
                      ? "profile-username-error"
                      : "profile-username-help"
                  }
                />
              </div>
              {errors.username ? (
                <FieldError id="profile-username-error">
                  {errors.username}
                </FieldError>
              ) : (
                <FieldDescription id="profile-username-help">
                  Your profile lives at northwind.example/{values.username || "…"}
                </FieldDescription>
              )}
            </Field>

            {/* Email */}
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                id="profile-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? "profile-email-error" : "profile-email-help"
                }
              />
              {errors.email ? (
                <FieldError id="profile-email-error">{errors.email}</FieldError>
              ) : (
                <FieldDescription id="profile-email-help">
                  We send receipts and security alerts here.
                </FieldDescription>
              )}
            </Field>

            {/* Role + website */}
            <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
              <Field>
                <FieldLabel htmlFor="profile-role">Role</FieldLabel>
                <Select
                  value={values.role}
                  onValueChange={(v) => setField("role", v)}
                  name="role"
                >
                  <SelectTrigger id="profile-role" className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field data-invalid={errors.website ? true : undefined}>
                <FieldLabel htmlFor="profile-website">Website</FieldLabel>
                <Input
                  id="profile-website"
                  name="website"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://"
                  value={values.website}
                  onChange={(e) => setField("website", e.target.value)}
                  aria-invalid={errors.website ? true : undefined}
                  aria-describedby={
                    errors.website ? "profile-website-error" : undefined
                  }
                />
                <FieldError id="profile-website-error">
                  {errors.website}
                </FieldError>
              </Field>
            </div>

            {/* Bio */}
            <Field data-invalid={errors.bio ? true : undefined}>
              <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-xs tabular-nums text-muted-foreground",
                    values.bio.length > MAX_BIO && "text-destructive",
                  )}
                >
                  {values.bio.length}/{MAX_BIO}
                </span>
              </div>
              <Textarea
                id="profile-bio"
                name="bio"
                rows={4}
                value={values.bio}
                onChange={(e) => setField("bio", e.target.value)}
                aria-invalid={errors.bio ? true : undefined}
                aria-describedby="profile-bio-help"
              />
              {errors.bio ? (
                <FieldError>{errors.bio}</FieldError>
              ) : (
                <FieldDescription id="profile-bio-help">
                  A short introduction. {MAX_BIO - values.bio.length} characters
                  remaining.
                </FieldDescription>
              )}
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="mt-8 flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={!dirty || saving}
            className="w-full sm:w-auto"
          >
            Discard changes
          </Button>
          <Button
            type="submit"
            disabled={!dirty || saving}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

/* --------------------------- Preferences card ----------------------------- */

function PreferencesCard() {
  const [language, setLanguage] = React.useState("en-US");
  const [timezone, setTimezone] = React.useState("America/New_York");
  const [dateFormat, setDateFormat] = React.useState("mdy");

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          id="preferences"
          title="Preferences"
          description="Choose how dates, times and text appear for you."
        />
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
            <Field>
              <FieldLabel htmlFor="pref-language">Language</FieldLabel>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="pref-language" className="w-full">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="pref-dateformat">Date format</FieldLabel>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="pref-dateformat" className="w-full">
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="pref-timezone">Time zone</FieldLabel>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="pref-timezone" className="w-full">
                <SelectValue placeholder="Select a time zone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Used for scheduled digests and timestamps on comments.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-end border-t pt-6">
        <Button
          type="button"
          onClick={() => toast.success("Preferences saved")}
          className="w-full sm:w-auto"
        >
          Save preferences
        </Button>
      </CardFooter>
    </Card>
  );
}

/* ------------------------- Notifications card ----------------------------- */

function NotificationsCard() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultChecked])),
  );

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          id="notifications"
          title="Notifications"
          description="Pick which emails you would like to receive."
        />
      </CardHeader>
      <CardContent>
        <ul className="divide-y rounded-lg border">
          {NOTIFICATIONS.map((item) => (
            <li key={item.id} className="p-4">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={item.id}>
                    <FieldTitle>{item.title}</FieldTitle>
                  </FieldLabel>
                  <FieldDescription>{item.description}</FieldDescription>
                </FieldContent>
                <Switch
                  id={item.id}
                  checked={enabled[item.id]}
                  onCheckedChange={(checked) => {
                    setEnabled((prev) => ({ ...prev, [item.id]: checked }));
                    toast(`${item.title} ${checked ? "on" : "off"}`);
                  }}
                />
              </Field>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ----------------------------- Danger zone -------------------------------- */

function DangerZone() {
  const [open, setOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");
  const confirmed = confirmText === ACCOUNT_HANDLE;

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="danger"
            className="text-xl font-semibold tracking-tight text-destructive"
          >
            Danger zone
          </h2>
          <Badge variant="outline" className="border-destructive/40 text-destructive">
            Irreversible
          </Badge>
        </div>
        <CardDescription>
          These actions affect your whole account. Please read carefully before
          continuing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y rounded-lg border border-destructive/30">
          <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Export your data</p>
              <p className="text-sm text-muted-foreground">
                Download a copy of your projects, comments and profile as a ZIP
                archive. We will email you when it is ready.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() =>
                toast.success("Export requested", {
                  description:
                    "We will email maya.okafor@northwind.example within a few minutes.",
                })
              }
            >
              Request export
            </Button>
          </li>
          <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account, 14 projects and all associated
                comments. This cannot be undone.
              </p>
            </div>

            <AlertDialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) setConfirmText("");
              }}
            >
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <Trash2Icon aria-hidden="true" />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive">
                    <TriangleAlertIcon aria-hidden="true" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes <strong>{ACCOUNT_HANDLE}</strong>,
                    including 14 projects and every comment you have written.
                    Teammates will lose access to anything you own.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <Field data-invalid={confirmText.length > 0 && !confirmed ? true : undefined}>
                  <FieldLabel htmlFor="delete-confirm">
                    Type <span className="font-mono">{ACCOUNT_HANDLE}</span> to
                    confirm
                  </FieldLabel>
                  <Input
                    id="delete-confirm"
                    autoComplete="off"
                    spellCheck={false}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                  />
                </Field>

                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my account</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={!confirmed}
                    onClick={() => {
                      toast.success("Account scheduled for deletion", {
                        description:
                          "You have 14 days to change your mind by signing back in.",
                      });
                    }}
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function SettingsPage() {
  const [active, setActive] = React.useState<SectionId>("profile");
  const sectionRefs = React.useRef<Map<SectionId, HTMLElement>>(new Map());

  const registerSection = React.useCallback(
    (id: SectionId) => (node: HTMLElement | null) => {
      if (node) sectionRefs.current.set(id, node);
      else sectionRefs.current.delete(id);
    },
    [],
  );

  // Highlight the nav entry for whichever section is nearest the top.
  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0];
        if (top) setActive(top.target.getAttribute("data-section") as SectionId);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sectionRefs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  function navigateTo(id: SectionId) {
    setActive(id);
    const node = sectionRefs.current.get(id);
    if (!node) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    node.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <a
        href="#settings-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to settings
      </a>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage your profile, preferences and account for Northwind
            Workspace.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="-mx-4 border-b bg-background/80 px-4 pt-1 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:backdrop-blur-none">
              <SettingsNav active={active} onNavigate={navigateTo} />
            </div>
          </aside>

          <main id="settings-main" className="min-w-0 space-y-8" tabIndex={-1}>
            <section
              ref={registerSection("profile")}
              data-section="profile"
              aria-labelledby="profile"
              className="scroll-mt-24"
            >
              <ProfileCard />
            </section>

            <section
              ref={registerSection("preferences")}
              data-section="preferences"
              aria-labelledby="preferences"
              className="scroll-mt-24"
            >
              <PreferencesCard />
            </section>

            <section
              ref={registerSection("notifications")}
              data-section="notifications"
              aria-labelledby="notifications"
              className="scroll-mt-24"
            >
              <NotificationsCard />
            </section>

            <section
              ref={registerSection("danger")}
              data-section="danger"
              aria-labelledby="danger"
              className="scroll-mt-24 pb-8"
            >
              <DangerZone />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
```