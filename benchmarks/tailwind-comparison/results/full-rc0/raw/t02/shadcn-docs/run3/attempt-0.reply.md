I have what I need. Building the page now.

```tsx
"use client";

import * as React from "react";
import {
  BellIcon,
  CreditCardIcon,
  Loader2Icon,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type SectionId = "profile" | "account" | "notifications" | "appearance" | "billing";

type Section = {
  id: SectionId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SECTIONS: Section[] = [
  { id: "profile", label: "Profile", description: "How others see you", icon: UserIcon },
  { id: "account", label: "Account", description: "Security and sign-in", icon: ShieldIcon },
  { id: "notifications", label: "Notifications", description: "Email and push alerts", icon: BellIcon },
  { id: "appearance", label: "Appearance", description: "Theme and density", icon: PaletteIcon },
  { id: "billing", label: "Billing", description: "Plan and invoices", icon: CreditCardIcon },
];

const TIMEZONES = [
  { value: "america-los_angeles", label: "Pacific Time (UTC−08:00)" },
  { value: "america-new_york", label: "Eastern Time (UTC−05:00)" },
  { value: "europe-london", label: "London (UTC+00:00)" },
  { value: "europe-berlin", label: "Central European Time (UTC+01:00)" },
  { value: "asia-kolkata", label: "India Standard Time (UTC+05:30)" },
  { value: "asia-tokyo", label: "Japan Standard Time (UTC+09:00)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ja", label: "日本語" },
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

type ProfileState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  website: string;
  role: string;
  timezone: string;
  language: string;
  bio: string;
  publicProfile: boolean;
};

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Okafor",
  username: "mayaokafor",
  email: "maya.okafor@northwind.studio",
  website: "mayaokafor.design",
  role: "designer",
  timezone: "europe-london",
  language: "en",
  bio: "Product designer at Northwind Studio. I care about calm interfaces, design systems and getting the details of empty states right.",
  publicProfile: true,
};

function getInitials(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SettingsPage() {
  const [active, setActive] = React.useState<SectionId>("profile");
  const [profile, setProfile] = React.useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = React.useState<ProfileState>(INITIAL_PROFILE);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState<{ email: boolean; username: boolean }>({
    email: false,
    username: false,
  });
  const [saving, setSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const avatarUrlRef = React.useRef<string | null>(null);

  // Revoke any object URL on unmount.
  React.useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    };
  }, []);

  const update = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const emailInvalid = touched.email && !isValidEmail(profile.email);
  const usernameInvalid = touched.username && !/^[a-z0-9_]{3,20}$/.test(profile.username);
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const canSave = dirty && !saving && isValidEmail(profile.email) && /^[a-z0-9_]{3,20}$/.test(profile.username);

  const setAvatar = (url: string | null) => {
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    avatarUrlRef.current = url;
    setAvatarUrl(url);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPG or GIF).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(`That file is ${formatBytes(file.size)}. The maximum size is 2 MB.`);
      return;
    }
    setAvatarError(null);
    setAvatar(URL.createObjectURL(file));
    toast.success("Avatar updated", { description: `${file.name} (${formatBytes(file.size)})` });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ email: true, username: true });
    if (!canSave) return;
    setSaving(true);
    window.setTimeout(() => {
      setSaved(profile);
      setSaving(false);
      toast.success("Profile saved", { description: "Your changes are now live." });
    }, 900);
  };

  const handleReset = () => {
    setProfile(saved);
    setTouched({ email: false, username: false });
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    setDeleteConfirm("");
    toast.error("Account scheduled for deletion", {
      description: "You have 14 days to change your mind before data is removed.",
    });
  };

  const activeSection = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <div className="min-h-svh bg-background text-foreground">
      <a
        href="#settings-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to settings content
      </a>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, account security and workspace preferences.
          </p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          {/* Sidebar navigation */}
          <nav aria-label="Settings sections" className="lg:w-64 lg:shrink-0">
            <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible lg:pb-0">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === active;
                return (
                  <li key={section.id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setActive(section.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex flex-col whitespace-nowrap">
                        <span>{section.label}</span>
                        <span className="hidden text-xs font-normal text-muted-foreground lg:block">
                          {section.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <main id="settings-content" className="flex min-w-0 flex-1 flex-col gap-6">
            {active === "profile" ? (
              <>
                <form onSubmit={handleSubmit} noValidate aria-labelledby="profile-heading">
                  <Card>
                    <CardHeader>
                      <CardTitle asChild={false}>
                        <h2 id="profile-heading" className="text-lg leading-none font-semibold">
                          Profile
                        </h2>
                      </CardTitle>
                      <CardDescription>
                        This information is shown on your public profile and in comments.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <FieldGroup>
                        {/* Avatar upload */}
                        <Field>
                          <FieldTitle id="avatar-label">Profile photo</FieldTitle>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Avatar className="size-20">
                              {avatarUrl ? (
                                <AvatarImage src={avatarUrl} alt="Your uploaded profile photo" />
                              ) : null}
                              <AvatarFallback className="text-xl" aria-label={`Initials ${getInitials(profile.firstName, profile.lastName)}`}>
                                {getInitials(profile.firstName, profile.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap gap-2">
                                <input
                                  ref={fileInputRef}
                                  id="avatar-input"
                                  type="file"
                                  accept="image/png,image/jpeg,image/gif"
                                  className="sr-only"
                                  onChange={handleAvatarChange}
                                  aria-labelledby="avatar-label"
                                  aria-describedby="avatar-help"
                                  tabIndex={-1}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <UploadIcon />
                                  Upload new photo
                                </Button>
                                {avatarUrl ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setAvatar(null);
                                      setAvatarError(null);
                                    }}
                                  >
                                    <XIcon />
                                    Remove
                                  </Button>
                                ) : null}
                              </div>
                              <p id="avatar-help" className="text-sm text-muted-foreground">
                                PNG, JPG or GIF. Max 2 MB. Square images work best.
                              </p>
                              {avatarError ? <FieldError>{avatarError}</FieldError> : null}
                            </div>
                          </div>
                        </Field>

                        <Separator />

                        {/* Name */}
                        <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
                          <Field>
                            <FieldLabel htmlFor="first-name">First name</FieldLabel>
                            <Input
                              id="first-name"
                              autoComplete="given-name"
                              value={profile.firstName}
                              onChange={(e) => update("firstName", e.target.value)}
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                            <Input
                              id="last-name"
                              autoComplete="family-name"
                              value={profile.lastName}
                              onChange={(e) => update("lastName", e.target.value)}
                            />
                          </Field>
                        </div>

                        {/* Username */}
                        <Field data-invalid={usernameInvalid || undefined}>
                          <FieldLabel htmlFor="username">Username</FieldLabel>
                          <InputGroup>
                            <InputGroupAddon>
                              <InputGroupText>folio.app/</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              id="username"
                              autoComplete="username"
                              value={profile.username}
                              aria-invalid={usernameInvalid}
                              aria-describedby="username-help"
                              onChange={(e) => update("username", e.target.value.toLowerCase())}
                              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                            />
                          </InputGroup>
                          {usernameInvalid ? (
                            <FieldError id="username-help">
                              Use 3–20 lowercase letters, numbers or underscores.
                            </FieldError>
                          ) : (
                            <FieldDescription id="username-help">
                              Your public profile lives at folio.app/{profile.username || "username"}.
                            </FieldDescription>
                          )}
                        </Field>

                        {/* Email */}
                        <Field data-invalid={emailInvalid || undefined}>
                          <FieldLabel htmlFor="email">Email address</FieldLabel>
                          <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={profile.email}
                            aria-invalid={emailInvalid}
                            aria-describedby="email-help"
                            onChange={(e) => update("email", e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                          />
                          {emailInvalid ? (
                            <FieldError id="email-help">Enter a valid email address.</FieldError>
                          ) : (
                            <FieldDescription id="email-help">
                              We use this for receipts and security alerts.
                            </FieldDescription>
                          )}
                        </Field>

                        {/* Website */}
                        <Field>
                          <FieldLabel htmlFor="website">Website</FieldLabel>
                          <InputGroup>
                            <InputGroupAddon>
                              <InputGroupText>https://</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              id="website"
                              inputMode="url"
                              autoComplete="url"
                              value={profile.website}
                              onChange={(e) => update("website", e.target.value)}
                            />
                          </InputGroup>
                        </Field>

                        {/* Selects */}
                        <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
                          <Field>
                            <FieldLabel htmlFor="role">Role</FieldLabel>
                            <Select value={profile.role} onValueChange={(v) => update("role", v)}>
                              <SelectTrigger id="role" className="w-full">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((r) => (
                                  <SelectItem key={r.value} value={r.value}>
                                    {r.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="language">Language</FieldLabel>
                            <Select value={profile.language} onValueChange={(v) => update("language", v)}>
                              <SelectTrigger id="language" className="w-full">
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
                        </div>

                        <Field>
                          <FieldLabel htmlFor="timezone">Time zone</FieldLabel>
                          <Select value={profile.timezone} onValueChange={(v) => update("timezone", v)}>
                            <SelectTrigger id="timezone" className="w-full">
                              <SelectValue placeholder="Select a time zone" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                  {tz.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldDescription>Used to show dates and schedule digests.</FieldDescription>
                        </Field>

                        {/* Bio */}
                        <Field>
                          <FieldLabel htmlFor="bio">Bio</FieldLabel>
                          <Textarea
                            id="bio"
                            rows={4}
                            maxLength={BIO_LIMIT}
                            value={profile.bio}
                            aria-describedby="bio-count"
                            onChange={(e) => update("bio", e.target.value)}
                          />
                          <FieldDescription id="bio-count" className="text-right tabular-nums">
                            {profile.bio.length}/{BIO_LIMIT} characters
                          </FieldDescription>
                        </Field>

                        <Separator />

                        {/* Visibility */}
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldLabel htmlFor="public-profile">Public profile</FieldLabel>
                            <FieldDescription>
                              Allow anyone with the link to view your profile page.
                            </FieldDescription>
                          </FieldContent>
                          <Switch
                            id="public-profile"
                            checked={profile.publicProfile}
                            onCheckedChange={(v) => update("publicProfile", v)}
                          />
                        </Field>
                      </FieldGroup>
                    </CardContent>

                    <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleReset}
                        disabled={!dirty || saving}
                      >
                        Discard changes
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto" disabled={!dirty || saving}>
                        {saving ? <Loader2Icon className="animate-spin" /> : null}
                        {saving ? "Saving…" : "Save changes"}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>

                {/* Danger zone */}
                <section aria-labelledby="danger-heading">
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle>
                        <h2
                          id="danger-heading"
                          className="flex items-center gap-2 text-lg leading-none font-semibold text-destructive"
                        >
                          <TriangleAlertIcon className="size-5" aria-hidden="true" />
                          Danger zone
                        </h2>
                      </CardTitle>
                      <CardDescription>
                        Irreversible actions that affect your account and everything in it.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FieldGroup className="gap-5">
                        <Field orientation="responsive">
                          <FieldContent>
                            <FieldTitle>Export your data</FieldTitle>
                            <FieldDescription>
                              Download a copy of your projects, comments and profile as a ZIP archive.
                            </FieldDescription>
                          </FieldContent>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              toast.info("Export requested", {
                                description: "We'll email a download link to " + profile.email + ".",
                              })
                            }
                          >
                            Request export
                          </Button>
                        </Field>

                        <Separator />

                        <Field orientation="responsive">
                          <FieldContent>
                            <FieldTitle>Delete account</FieldTitle>
                            <FieldDescription>
                              Permanently remove your account, 24 projects and 312 comments. This cannot
                              be undone.
                            </FieldDescription>
                          </FieldContent>

                          <AlertDialog
                            open={deleteOpen}
                            onOpenChange={(open) => {
                              setDeleteOpen(open);
                              if (!open) setDeleteConfirm("");
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button type="button" variant="destructive">
                                <Trash2Icon />
                                Delete account
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete <strong>{profile.email}</strong> along with
                                  all of your projects and comments. Type{" "}
                                  <span className="font-mono font-medium text-foreground">
                                    {profile.username}
                                  </span>{" "}
                                  to confirm.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Field>
                                <FieldLabel htmlFor="delete-confirm" className="sr-only">
                                  Type your username to confirm deletion
                                </FieldLabel>
                                <Input
                                  id="delete-confirm"
                                  autoComplete="off"
                                  placeholder={profile.username}
                                  value={deleteConfirm}
                                  onChange={(e) => setDeleteConfirm(e.target.value)}
                                />
                              </Field>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  disabled={deleteConfirm !== profile.username}
                                  onClick={handleDelete}
                                >
                                  Delete account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </Field>
                      </FieldGroup>
                    </CardContent>
                  </Card>
                </section>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <h2 className="text-lg leading-none font-semibold">{activeSection.label}</h2>
                  </CardTitle>
                  <CardDescription>{activeSection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    There is nothing to configure here yet.{" "}
                    <button
                      type="button"
                      className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      onClick={() => setActive("profile")}
                    >
                      Back to profile
                    </button>
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
```