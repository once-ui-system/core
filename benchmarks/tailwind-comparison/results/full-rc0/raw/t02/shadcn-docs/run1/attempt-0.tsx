"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  Camera,
  CreditCard,
  Loader2,
  Shield,
  Trash2,
  Upload,
  User,
  type LucideIcon,
} from "lucide-react";

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
  AlertDialogAction,
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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SectionId =
  | "profile"
  | "preferences"
  | "notifications"
  | "security"
  | "billing";

interface SectionDef {
  id: SectionId;
  label: string;
  description: string;
  icon: LucideIcon;
}

const SECTIONS: SectionDef[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Your public identity and contact details.",
    icon: User,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Language, region and display options.",
    icon: Camera,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Choose what we email you about.",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    description: "Protect your account and active sessions.",
    icon: Shield,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plan, invoices and payment method.",
    icon: CreditCard,
  },
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

const ROLES = [
  { value: "engineer", label: "Software engineer" },
  { value: "designer", label: "Product designer" },
  { value: "pm", label: "Product manager" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Other" },
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BIO_LIMIT = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ProfileValues {
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

type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

const INITIAL_PROFILE: ProfileValues = {
  firstName: "Maya",
  lastName: "Okafor",
  username: "maya.okafor",
  email: "maya.okafor@northwind.studio",
  role: "designer",
  bio: "Design lead at Northwind Studio. I care about calm interfaces, clear writing and fast feedback loops.",
  website: "https://mayaokafor.design",
  timezone: "Europe/London",
  language: "en-GB",
};

function validate(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!/^[a-z0-9._-]{3,30}$/i.test(values.username)) {
    errors.username =
      "Use 3–30 letters, numbers, dots, dashes or underscores.";
  }
  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (values.website.trim()) {
    try {
      const url = new URL(values.website);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.website = "Website must start with http:// or https://.";
      }
    } catch {
      errors.website = "Enter a full URL, e.g. https://example.com.";
    }
  }
  if (values.bio.length > BIO_LIMIT) {
    errors.bio = `Bio must be ${BIO_LIMIT} characters or fewer.`;
  }
  return errors;
}

export default function SettingsPage() {
  const [active, setActive] = React.useState<SectionId>("profile");
  const activeSection = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  const handleNavKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = (index + 1) % SECTIONS.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = (index - 1 + SECTIONS.length) % SECTIONS.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = SECTIONS.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const target = SECTIONS[next];
    setActive(target.id);
    document.getElementById(`tab-${target.id}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <a
        href="#settings-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to settings content
      </a>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-6 space-y-1 lg:mb-10">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, preferences and workspace security.
          </p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <aside className="lg:w-60 lg:shrink-0">
            <nav
              aria-label="Settings sections"
              className="lg:sticky lg:top-8"
            >
              <div
                role="tablist"
                aria-orientation="vertical"
                className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
              >
                {SECTIONS.map((section, index) => {
                  const Icon = section.icon;
                  const selected = section.id === active;
                  return (
                    <button
                      key={section.id}
                      id={`tab-${section.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`panel-${section.id}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActive(section.id)}
                      onKeyDown={(e) => handleNavKeyDown(e, index)}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap outline-none transition-colors",
                        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        selected
                          ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          <main
            id="settings-content"
            className="min-w-0 flex-1 space-y-6"
            tabIndex={-1}
          >
            <div
              role="tabpanel"
              id={`panel-${activeSection.id}`}
              aria-labelledby={`tab-${activeSection.id}`}
              className="space-y-6"
            >
              {activeSection.id === "profile" && <ProfilePanel />}
              {activeSection.id === "preferences" && <PreferencesPanel />}
              {activeSection.id === "notifications" && (
                <NotificationsPanel />
              )}
              {activeSection.id === "security" && <SecurityPanel />}
              {activeSection.id === "billing" && <BillingPanel />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

function ProfilePanel() {
  const [values, setValues] = React.useState<ProfileValues>(INITIAL_PROFILE);
  const [errors, setErrors] = React.useState<ProfileErrors>({});
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const set = <K extends keyof ProfileValues>(
    key: K,
    value: ProfileValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = (Object.keys(nextErrors) as (keyof ProfileValues)[])[0];
    if (firstInvalid) {
      toast.error("Please fix the highlighted fields.");
      document.getElementById(`field-${firstInvalid}`)?.focus();
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setDirty(false);
      toast.success("Profile updated", {
        description: "Your changes have been saved.",
      });
    }, 900);
  };

  const handleReset = () => {
    setValues(INITIAL_PROFILE);
    setErrors({});
    setDirty(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Profile</CardTitle>
            <CardDescription>
              This information is visible to teammates and on shared documents.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <AvatarUploader
              initials={`${values.firstName.charAt(0)}${values.lastName.charAt(0)}`.toUpperCase()}
              onChange={() => setDirty(true)}
            />

            <Separator />

            <FieldSet>
              <FieldGroup>
                <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
                  <Field data-invalid={!!errors.firstName}>
                    <FieldLabel htmlFor="field-firstName">First name</FieldLabel>
                    <Input
                      id="field-firstName"
                      autoComplete="given-name"
                      value={values.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={
                        errors.firstName ? "err-firstName" : undefined
                      }
                    />
                    <FieldError id="err-firstName">{errors.firstName}</FieldError>
                  </Field>
                  <Field data-invalid={!!errors.lastName}>
                    <FieldLabel htmlFor="field-lastName">Last name</FieldLabel>
                    <Input
                      id="field-lastName"
                      autoComplete="family-name"
                      value={values.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={
                        errors.lastName ? "err-lastName" : undefined
                      }
                    />
                    <FieldError id="err-lastName">{errors.lastName}</FieldError>
                  </Field>
                </div>

                <Field data-invalid={!!errors.username}>
                  <FieldLabel htmlFor="field-username">Username</FieldLabel>
                  <Input
                    id="field-username"
                    autoComplete="username"
                    value={values.username}
                    onChange={(e) => set("username", e.target.value)}
                    aria-invalid={!!errors.username}
                    aria-describedby={
                      errors.username ? "err-username" : "help-username"
                    }
                  />
                  {errors.username ? (
                    <FieldError id="err-username">{errors.username}</FieldError>
                  ) : (
                    <FieldDescription id="help-username">
                      Your profile lives at northwind.app/
                      {values.username || "username"}.
                    </FieldDescription>
                  )}
                </Field>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="field-email">Email address</FieldLabel>
                  <Input
                    id="field-email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "err-email" : "help-email"}
                  />
                  {errors.email ? (
                    <FieldError id="err-email">{errors.email}</FieldError>
                  ) : (
                    <FieldDescription id="help-email">
                      We&apos;ll send a confirmation link if you change this.
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="field-role">Role</FieldLabel>
                  <Select
                    value={values.role}
                    onValueChange={(v) => set("role", v)}
                  >
                    <SelectTrigger id="field-role" className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectLabel>Role</SelectLabel>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field data-invalid={!!errors.bio}>
                  <FieldLabel htmlFor="field-bio">Bio</FieldLabel>
                  <Textarea
                    id="field-bio"
                    rows={4}
                    value={values.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    aria-invalid={!!errors.bio}
                    aria-describedby="help-bio"
                    className="min-h-24 resize-y"
                  />
                  <div className="flex items-start justify-between gap-4">
                    <FieldDescription id="help-bio">
                      A short introduction shown on your profile.
                    </FieldDescription>
                    <span
                      className={cn(
                        "shrink-0 text-xs tabular-nums text-muted-foreground",
                        values.bio.length > BIO_LIMIT && "text-destructive",
                      )}
                      aria-live="polite"
                    >
                      {values.bio.length}/{BIO_LIMIT}
                    </span>
                  </div>
                  <FieldError>{errors.bio}</FieldError>
                </Field>

                <Field data-invalid={!!errors.website}>
                  <FieldLabel htmlFor="field-website">Website</FieldLabel>
                  <Input
                    id="field-website"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://"
                    value={values.website}
                    onChange={(e) => set("website", e.target.value)}
                    aria-invalid={!!errors.website}
                    aria-describedby={errors.website ? "err-website" : undefined}
                  />
                  <FieldError id="err-website">{errors.website}</FieldError>
                </Field>

                <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
                  <Field>
                    <FieldLabel htmlFor="field-timezone">Time zone</FieldLabel>
                    <Select
                      value={values.timezone}
                      onValueChange={(v) => set("timezone", v)}
                    >
                      <SelectTrigger id="field-timezone" className="w-full">
                        <SelectValue placeholder="Select a time zone" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="field-language">Language</FieldLabel>
                    <Select
                      value={values.language}
                      onValueChange={(v) => set("language", v)}
                    >
                      <SelectTrigger id="field-language" className="w-full">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
          </CardContent>

          <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
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
              {saving && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <DangerZone email={values.email} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar uploader                                                            */
/* -------------------------------------------------------------------------- */

function AvatarUploader({
  initials,
  onChange,
}: {
  initials: string;
  onChange: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Revoke object URLs to avoid leaking memory.
  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG, GIF or WebP).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("That image is larger than 2 MB. Try a smaller one.");
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(file));
    onChange();
    toast.success("Photo selected", {
      description: "Save your changes to apply the new photo.",
    });
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange();
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="size-20 shrink-0 text-xl">
        {preview && <AvatarImage src={preview} alt="Your profile photo" />}
        <AvatarFallback className="text-xl font-medium">
          {initials || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 space-y-2">
        <p className="text-sm font-medium" id="avatar-label">
          Profile photo
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="sr-only"
            onChange={handleFile}
            aria-labelledby="avatar-label"
            aria-describedby="avatar-help"
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload aria-hidden="true" />
            Upload new photo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={!preview}
          >
            Remove
          </Button>
        </div>
        <p id="avatar-help" className="text-xs text-muted-foreground">
          PNG, JPG, GIF or WebP. Max size 2 MB.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Danger zone                                                                */
/* -------------------------------------------------------------------------- */

function DangerZone({ email }: { email: string }) {
  const [confirmText, setConfirmText] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const canDelete = confirmText.trim().toLowerCase() === "delete my account";

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Irreversible actions that affect your account and workspace data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">Export your data</p>
            <p className="text-sm text-muted-foreground">
              Download a copy of your projects, comments and activity as a ZIP
              archive.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            onClick={() =>
              toast.info("Export requested", {
                description: `We'll email a download link to ${email}.`,
              })
            }
          >
            Request export
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account, 14 projects and all associated
              data. This cannot be undone.
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
                className="w-full shrink-0 sm:w-auto"
              >
                <Trash2 aria-hidden="true" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the account for {email} along
                  with all of its projects and files. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Field>
                <FieldLabel htmlFor="confirm-delete">
                  Type <span className="font-mono">delete my account</span> to
                  confirm
                </FieldLabel>
                <Input
                  id="confirm-delete"
                  autoComplete="off"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </Field>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={!canDelete}
                  onClick={() => {
                    toast.success("Account scheduled for deletion", {
                      description:
                        "You have 7 days to change your mind before it's final.",
                    });
                  }}
                >
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Other sections                                                             */
/* -------------------------------------------------------------------------- */

function PanelHeader({ section }: { section: SectionId }) {
  const def = SECTIONS.find((s) => s.id === section);
  if (!def) return null;
  return (
    <CardHeader>
      <CardTitle className="text-xl">{def.label}</CardTitle>
      <CardDescription>{def.description}</CardDescription>
    </CardHeader>
  );
}

function PreferencesPanel() {
  const [theme, setTheme] = React.useState("system");
  const [density, setDensity] = React.useState("comfortable");
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [weekStart, setWeekStart] = React.useState(true);

  return (
    <Card>
      <PanelHeader section="preferences" />
      <CardContent>
        <FieldGroup>
          <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
            <Field>
              <FieldLabel htmlFor="pref-theme">Theme</FieldLabel>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="pref-theme" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="pref-density">Interface density</FieldLabel>
              <Select value={density} onValueChange={setDensity}>
                <SelectTrigger id="pref-density" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="pref-motion">Reduce motion</FieldLabel>
              <FieldDescription>
                Minimise animations and transitions across the app.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="pref-motion"
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
            />
          </Field>

          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="pref-week">Start week on Monday</FieldLabel>
              <FieldDescription>
                Calendars and reports will begin on Monday instead of Sunday.
              </FieldDescription>
            </FieldContent>
            <Switch
              id="pref-week"
              checked={weekStart}
              onCheckedChange={setWeekStart}
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function NotificationsPanel() {
  const [items, setItems] = React.useState({
    mentions: true,
    comments: true,
    digest: false,
    product: false,
    billing: true,
  });

  const rows: {
    key: keyof typeof items;
    label: string;
    description: string;
  }[] = [
    {
      key: "mentions",
      label: "Mentions",
      description: "When someone @mentions you in a project or comment.",
    },
    {
      key: "comments",
      label: "Replies to your comments",
      description: "Get notified when a thread you started has new activity.",
    },
    {
      key: "digest",
      label: "Weekly digest",
      description: "A Monday summary of what changed across your projects.",
    },
    {
      key: "product",
      label: "Product updates",
      description: "New features and improvements, about once a month.",
    },
    {
      key: "billing",
      label: "Billing alerts",
      description: "Receipts, failed payments and plan changes.",
    },
  ];

  return (
    <Card>
      <PanelHeader section="notifications" />
      <CardContent>
        <FieldGroup>
          {rows.map((row) => (
            <Field key={row.key} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={`notif-${row.key}`}>{row.label}</FieldLabel>
                <FieldDescription>{row.description}</FieldDescription>
              </FieldContent>
              <Switch
                id={`notif-${row.key}`}
                checked={items[row.key]}
                onCheckedChange={(checked) =>
                  setItems((prev) => ({ ...prev, [row.key]: checked }))
                }
              />
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

function SecurityPanel() {
  const [twoFactor, setTwoFactor] = React.useState(true);
  const sessions = [
    {
      device: "MacBook Pro · Chrome",
      location: "London, United Kingdom",
      time: "Active now",
      current: true,
    },
    {
      device: "iPhone 15 · Safari",
      location: "London, United Kingdom",
      time: "2 hours ago",
      current: false,
    },
    {
      device: "Windows PC · Firefox",
      location: "Manchester, United Kingdom",
      time: "6 days ago",
      current: false,
    },
  ];

  return (
    <Card>
      <PanelHeader section="security" />
      <CardContent className="space-y-6">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="sec-2fa">Two-factor authentication</FieldLabel>
            <FieldDescription>
              Require a code from your authenticator app when signing in.
            </FieldDescription>
          </FieldContent>
          <Switch id="sec-2fa" checked={twoFactor} onCheckedChange={setTwoFactor} />
        </Field>

        <Separator />

        <section aria-labelledby="sessions-heading" className="space-y-3">
          <h3 id="sessions-heading" className="text-sm font-medium">
            Active sessions
          </h3>
          <ul className="divide-y rounded-md border">
            {sessions.map((s) => (
              <li
                key={s.device}
                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.location} · {s.time}
                  </p>
                </div>
                {s.current ? (
                  <Badge variant="secondary">This device</Badge>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast.success(`Signed out of ${s.device}`)
                    }
                  >
                    Sign out
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}

function BillingPanel() {
  return (
    <Card>
      <PanelHeader section="billing" />
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Team plan</p>
              <Badge>Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              $24 per seat / month · 5 seats · Renews on 14 March 2026
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Plan management opens in the billing portal.")}
          >
            Manage plan
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CreditCard
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 09/2027</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toast.info("Payment method editor opened.")}
          >
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
