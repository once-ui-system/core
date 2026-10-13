"use client";

import * as React from "react";
import {
  BellIcon,
  CreditCardIcon,
  KeyRoundIcon,
  PaletteIcon,
  ShieldIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UploadIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type SectionId =
  | "profile"
  | "account"
  | "notifications"
  | "appearance"
  | "billing"
  | "security";

type Section = {
  id: SectionId;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const SECTIONS: Section[] = [
  {
    id: "profile",
    label: "Profile",
    description: "How you appear to teammates and collaborators.",
    icon: UserIcon,
  },
  {
    id: "account",
    label: "Account",
    description: "Sign-in email, username and data.",
    icon: KeyRoundIcon,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Choose what lands in your inbox.",
    icon: BellIcon,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme, density and language.",
    icon: PaletteIcon,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plan, invoices and payment methods.",
    icon: CreditCardIcon,
  },
  {
    id: "security",
    label: "Security",
    description: "Two-factor authentication and sessions.",
    icon: ShieldIcon,
  },
];

const TIMEZONES = [
  { value: "america-los_angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "america-denver", label: "Mountain Time (UTC−07:00)" },
  { value: "america-new_york", label: "Eastern Time (UTC−05:00)" },
  { value: "europe-london", label: "London (UTC+00:00)" },
  { value: "europe-berlin", label: "Central European Time (UTC+01:00)" },
  { value: "asia-kolkata", label: "India Standard Time (UTC+05:30)" },
  { value: "asia-tokyo", label: "Japan Standard Time (UTC+09:00)" },
];

const LANGUAGES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "de-DE", label: "Deutsch" },
  { value: "fr-FR", label: "Français" },
  { value: "es-ES", label: "Español" },
  { value: "ja-JP", label: "日本語" },
];

const ROLES = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
];

const MAX_BIO = 200;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCOUNT_EMAIL = "maya.okafor@northwind.studio";

type FormState = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  website: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  firstName: "Maya",
  lastName: "Okafor",
  displayName: "Maya O.",
  email: ACCOUNT_EMAIL,
  website: "northwind.studio/maya",
  role: "design",
  timezone: "europe-london",
  language: "en-GB",
  bio: "Product designer at Northwind. I care about calm interfaces, clear writing and design systems that people actually enjoy using.",
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (!form.displayName.trim()) {
    errors.displayName = "Display name is required.";
  }
  if (!form.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address, like name@company.com.";
  }
  if (form.bio.length > MAX_BIO) {
    errors.bio = `Bio must be ${MAX_BIO} characters or fewer.`;
  }
  return errors;
}

function initials(first: string, last: string): string {
  const value = `${first.trim().charAt(0)}${last.trim().charAt(0)}`;
  return value.toUpperCase() || "?";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SectionNav({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <nav aria-label="Settings sections" className="lg:sticky lg:top-8">
      <ul
        className={cn(
          "-mx-4 flex gap-1 overflow-x-auto px-4 pb-2",
          "sm:-mx-6 sm:px-6",
          "lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
        )}
      >
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === active;
          return (
            <li key={section.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap outline-none transition-colors",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {section.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AvatarUploader({
  src,
  fallback,
  onChange,
}: {
  src: string | null;
  fallback: string;
  onChange: (url: string | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState<string | null>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Choose a PNG, JPG or GIF.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError(
        `That image is ${formatBytes(file.size)}. The maximum size is 2 MB.`
      );
      return;
    }
    setError(null);
    setMeta(`${file.name} · ${formatBytes(file.size)}`);
    onChange(URL.createObjectURL(file));
  }

  function handleRemove() {
    setError(null);
    setMeta(null);
    onChange(null);
    toast("Profile photo removed", {
      description: "Save your changes to apply this.",
    });
  }

  const errorId = "avatar-error";

  return (
    <Field data-invalid={error ? true : undefined}>
      <span id="avatar-label" className="text-sm leading-snug font-medium">
        Profile photo
      </span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-20 text-xl">
          {src ? <AvatarImage src={src} alt="Your profile photo" /> : null}
          <AvatarFallback className="text-xl">{fallback}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              id="avatar-input"
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="sr-only"
              onChange={handleFile}
              aria-labelledby="avatar-label"
              aria-describedby={error ? errorId : "avatar-hint"}
              tabIndex={-1}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <UploadIcon data-icon="inline-start" />
              Upload new photo
            </Button>
            {src ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <XIcon data-icon="inline-start" />
                Remove
              </Button>
            ) : null}
          </div>
          {error ? (
            <FieldError id={errorId}>{error}</FieldError>
          ) : (
            <FieldDescription id="avatar-hint" className="truncate">
              {meta ?? "PNG, JPG, GIF or WebP. Up to 2 MB, square works best."}
            </FieldDescription>
          )}
        </div>
      </div>
    </Field>
  );
}

function ProfileSection() {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [saved, setSaved] = React.useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [savedAvatar, setSavedAvatar] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const createdUrls = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const urls = createdUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleAvatarChange(url: string | null) {
    if (url) createdUrls.current.add(url);
    setAvatarUrl(url);
  }

  const dirty =
    avatarUrl !== savedAvatar ||
    (Object.keys(form) as Array<keyof FormState>).some(
      (key) => form[key] !== saved[key]
    );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    const firstKey = (Object.keys(nextErrors) as Array<keyof FormState>)[0];
    if (firstKey) {
      document.getElementById(`field-${firstKey}`)?.focus();
      toast.error("Couldn't save your profile", {
        description: "Fix the highlighted fields and try again.",
      });
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setSaved(form);
      setSavedAvatar(avatarUrl);
      toast.success("Profile updated", {
        description: "Your changes are now visible to your team.",
      });
    }, 900);
  }

  function handleReset() {
    setForm(saved);
    setAvatarUrl(savedAvatar);
    setErrors({});
  }

  const bioLeft = MAX_BIO - form.bio.length;

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate aria-label="Profile">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This information appears on your public profile and in mentions
            across the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <FieldGroup>
            <AvatarUploader
              src={avatarUrl}
              fallback={initials(form.firstName, form.lastName)}
              onChange={handleAvatarChange}
            />

            <Separator />

            <div className="grid gap-7 sm:grid-cols-2">
              <Field data-invalid={errors.firstName ? true : undefined}>
                <FieldLabel htmlFor="field-firstName">First name</FieldLabel>
                <Input
                  id="field-firstName"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  aria-invalid={errors.firstName ? true : undefined}
                  aria-describedby={
                    errors.firstName ? "error-firstName" : undefined
                  }
                />
                {errors.firstName ? (
                  <FieldError id="error-firstName">
                    {errors.firstName}
                  </FieldError>
                ) : null}
              </Field>
              <Field data-invalid={errors.lastName ? true : undefined}>
                <FieldLabel htmlFor="field-lastName">Last name</FieldLabel>
                <Input
                  id="field-lastName"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  aria-invalid={errors.lastName ? true : undefined}
                  aria-describedby={
                    errors.lastName ? "error-lastName" : undefined
                  }
                />
                {errors.lastName ? (
                  <FieldError id="error-lastName">{errors.lastName}</FieldError>
                ) : null}
              </Field>
            </div>

            <Field data-invalid={errors.displayName ? true : undefined}>
              <FieldLabel htmlFor="field-displayName">Display name</FieldLabel>
              <Input
                id="field-displayName"
                autoComplete="nickname"
                value={form.displayName}
                onChange={(e) => setField("displayName", e.target.value)}
                aria-invalid={errors.displayName ? true : undefined}
                aria-describedby={
                  errors.displayName
                    ? "error-displayName"
                    : "hint-displayName"
                }
              />
              {errors.displayName ? (
                <FieldError id="error-displayName">
                  {errors.displayName}
                </FieldError>
              ) : (
                <FieldDescription id="hint-displayName">
                  Shown in comments, mentions and activity feeds.
                </FieldDescription>
              )}
            </Field>

            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="field-email">Email address</FieldLabel>
              <Input
                id="field-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "error-email" : "hint-email"}
              />
              {errors.email ? (
                <FieldError id="error-email">{errors.email}</FieldError>
              ) : (
                <FieldDescription id="hint-email">
                  We&apos;ll send a confirmation link if you change this.
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="field-website">Website</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>https://</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="field-website"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={form.website}
                  onChange={(e) => setField("website", e.target.value)}
                />
              </InputGroup>
            </Field>

            <div className="grid gap-7 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="field-role">Team</FieldLabel>
                <Select
                  value={form.role}
                  onValueChange={(value) => setField("role", value)}
                >
                  <SelectTrigger id="field-role" className="w-full">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
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
                <FieldLabel htmlFor="field-language">Language</FieldLabel>
                <Select
                  value={form.language}
                  onValueChange={(value) => setField("language", value)}
                >
                  <SelectTrigger id="field-language" className="w-full">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
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
              <FieldLabel htmlFor="field-timezone">Time zone</FieldLabel>
              <Select
                value={form.timezone}
                onValueChange={(value) => setField("timezone", value)}
              >
                <SelectTrigger
                  id="field-timezone"
                  className="w-full"
                  aria-describedby="hint-timezone"
                >
                  <SelectValue placeholder="Select a time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription id="hint-timezone">
                Used for scheduling meetings and displaying timestamps.
              </FieldDescription>
            </Field>

            <Field data-invalid={errors.bio ? true : undefined}>
              <FieldLabel htmlFor="field-bio">Bio</FieldLabel>
              <Textarea
                id="field-bio"
                rows={4}
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                aria-invalid={errors.bio || bioLeft < 0 ? true : undefined}
                aria-describedby="hint-bio"
              />
              <div
                id="hint-bio"
                className="flex flex-wrap items-start justify-between gap-2"
              >
                {errors.bio ? (
                  <FieldError>{errors.bio}</FieldError>
                ) : (
                  <FieldDescription>
                    A short introduction. Markdown is not supported.
                  </FieldDescription>
                )}
                <span
                  className={cn(
                    "ml-auto text-sm tabular-nums",
                    bioLeft < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {bioLeft} left
                </span>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
          <p
            className="text-sm text-muted-foreground sm:mr-auto"
            aria-live="polite"
          >
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!dirty || saving}
          >
            Discard
          </Button>
          <Button type="submit" disabled={!dirty || saving}>
            {saving ? <Spinner data-icon="inline-start" /> : null}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function DangerZone() {
  const [confirmText, setConfirmText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const canDelete = confirmText.trim() === "delete my account";

  function handleOpenChange(next: boolean) {
    if (deleting) return;
    setOpen(next);
    if (!next) setConfirmText("");
  }

  function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!canDelete) return;
    setDeleting(true);
    window.setTimeout(() => {
      setDeleting(false);
      setOpen(false);
      setConfirmText("");
      toast.success("Account scheduled for deletion", {
        description:
          "You have 14 days to change your mind. We've emailed you the details.",
      });
    }, 1200);
  }

  function handleExport() {
    setExporting(true);
    window.setTimeout(() => {
      setExporting(false);
      toast.success("Export requested", {
        description: `We'll email a download link to ${ACCOUNT_EMAIL} within a few minutes.`,
      });
    }, 900);
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlertIcon aria-hidden="true" className="size-5" />
          Danger zone
        </CardTitle>
        <CardDescription>
          These actions affect your whole account and are difficult or
          impossible to undo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">Export your data</h3>
            <p className="text-sm text-muted-foreground">
              Download a copy of your projects, comments and profile as a ZIP
              archive.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="shrink-0"
          >
            {exporting ? <Spinner data-icon="inline-start" /> : null}
            {exporting ? "Requesting…" : "Request export"}
          </Button>
        </div>
        <Separator />
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">Delete account</h3>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account, 14 projects and 3 workspace
              memberships. This can&apos;t be undone after 14 days.
            </p>
          </div>

          <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                <Trash2Icon data-icon="inline-start" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete{" "}
                  <strong className="font-medium text-foreground">
                    {ACCOUNT_EMAIL}
                  </strong>{" "}
                  along with all of your projects and files after a 14-day
                  grace period.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Field>
                <FieldLabel htmlFor="confirm-delete">
                  Type{" "}
                  <span className="font-mono text-foreground">
                    delete my account
                  </span>{" "}
                  to confirm
                </FieldLabel>
                <Input
                  id="confirm-delete"
                  autoComplete="off"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                />
              </Field>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!canDelete || deleting}
                  onClick={handleDelete}
                >
                  {deleting ? <Spinner data-icon="inline-start" /> : null}
                  {deleting ? "Deleting…" : "Delete account"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderSection({ section }: { section: Section }) {
  const Icon = section.icon;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon aria-hidden="true" className="size-5" />
          {section.label}
        </CardTitle>
        <CardDescription>{section.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          There&apos;s nothing to configure here in this preview. Switch back
          to{" "}
          <span className="font-medium text-foreground">Profile</span> to
          edit your details.
        </p>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const [active, setActive] = React.useState<SectionId>("profile");
  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#settings-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md focus:ring-[3px] focus:ring-ring/50"
      >
        Skip to settings content
      </a>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <header className="mb-8 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Settings
            </h1>
            <Badge variant="secondary">Northwind Studio</Badge>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage your personal profile and account preferences.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
          <SectionNav active={active} onSelect={setActive} />

          <div
            id="settings-content"
            tabIndex={-1}
            className="flex min-w-0 flex-col gap-6 outline-none"
          >
            <h2 className="sr-only">{current.label} settings</h2>
            {active === "profile" ? (
              <>
                <ProfileSection />
                <DangerZone />
              </>
            ) : (
              <PlaceholderSection section={current} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
