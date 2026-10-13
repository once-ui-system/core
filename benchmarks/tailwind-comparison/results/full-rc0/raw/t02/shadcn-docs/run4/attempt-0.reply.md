I'll build the page now with a custom lightweight sidebar of sections: a sticky aside on desktop and a horizontally scrollable nav on mobile. Sections are real anchors with scroll-spy.

```tsx
"use client";

import * as React from "react";
import {
  AlertTriangle,
  Bell,
  Camera,
  CreditCard,
  Loader2,
  Shield,
  Trash2,
  User,
  Palette,
  Upload,
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
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SectionId = "profile" | "account" | "notifications" | "appearance" | "billing" | "danger";

const SECTIONS: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_-]{3,24}$/;

interface ProfileState {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  timezone: string;
  language: string;
  website: string;
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Okafor",
  username: "maya-okafor",
  email: "maya.okafor@northwind.example",
  role: "designer",
  bio: "Design lead at Northwind. I care about calm interfaces, design systems and good coffee.",
  timezone: "europe-london",
  language: "en-US",
  website: "https://mayaokafor.example",
};

type Errors = Partial<Record<keyof ProfileState | "avatar", string>>;

function validate(p: ProfileState): Errors {
  const e: Errors = {};
  if (!p.firstName.trim()) e.firstName = "Enter your first name.";
  if (!p.lastName.trim()) e.lastName = "Enter your last name.";
  if (!USERNAME_RE.test(p.username))
    e.username = "Use 3–24 lowercase letters, numbers, hyphens or underscores.";
  if (!EMAIL_RE.test(p.email)) e.email = "Enter a valid email address.";
  if (p.website.trim()) {
    try {
      const u = new URL(p.website);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("protocol");
    } catch {
      e.website = "Enter a full URL, e.g. https://example.com.";
    }
  }
  if (p.bio.length > 240) e.bio = "Bio must be 240 characters or fewer.";
  return e;
}

export default function SettingsPage() {
  const [profile, setProfile] = React.useState<ProfileState>(INITIAL_PROFILE);
  const [saved, setSaved] = React.useState<ProfileState>(INITIAL_PROFILE);
  const [errors, setErrors] = React.useState<Errors>({});
  const [saving, setSaving] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [active, setActive] = React.useState<SectionId>("profile");

  const [notif, setNotif] = React.useState({
    product: true,
    comments: true,
    digest: false,
    marketing: false,
  });
  const [security, setSecurity] = React.useState({ twoFactor: true, loginAlerts: true });
  const [density, setDensity] = React.useState("comfortable");
  const [theme, setTheme] = React.useState("system");

  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  const dirty = (Object.keys(profile) as (keyof ProfileState)[]).some(
    (k) => profile[k] !== saved[k],
  );
  const avatarDirty = avatarUrl !== null;

  // Revoke object URLs on change/unmount.
  React.useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Scroll-spy for the section nav.
  React.useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id as SectionId);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function update<K extends keyof ProfileState>(key: K, value: ProfileState[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Choose an image file (PNG, JPG, GIF or WebP).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be smaller than 2 MB.");
      return;
    }
    setAvatarError(null);
    setAvatarUrl(URL.createObjectURL(file));
  }

  function removeAvatar() {
    setAvatarUrl(null);
    setAvatarError(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate(profile);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`field-${first}`)?.focus();
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(profile);
    toast.success("Profile updated", { description: "Your changes have been saved." });
  }

  function onReset() {
    setProfile(saved);
    setErrors({});
    setAvatarUrl(null);
    setAvatarError(null);
  }

  async function onDeleteAccount() {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 900));
    setDeleting(false);
    setDeleteConfirm("");
    toast.success("Deletion scheduled", {
      description: "Your account will be removed in 14 days. Sign in again to cancel.",
    });
  }

  function goTo(id: SectionId) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || "?";
  const bioLeft = 240 - profile.bio.length;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, account preferences and workspace access.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Section navigation */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <nav aria-label="Settings sections">
              <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
                {SECTIONS.map(({ id, label, icon: Icon }) => {
                  const isActive = active === id;
                  const isDanger = id === "danger";
                  return (
                    <li key={id} className="shrink-0">
                      <a
                        href={`#${id}`}
                        aria-current={isActive ? "true" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          goTo(id);
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap outline-none transition-colors",
                          "focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          isActive
                            ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                            : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                          isDanger && !isActive && "hover:text-destructive",
                          isDanger && "text-destructive/90",
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <main className="min-w-0 space-y-8">
            {/* Profile */}
            <section id="profile" aria-labelledby="profile-title" className="scroll-mt-8">
              <Card>
                <form onSubmit={onSubmit} noValidate>
                  <CardHeader>
                    <CardTitle id="profile-title" className="text-lg">
                      Profile
                    </CardTitle>
                    <CardDescription>
                      This information is shown on your public profile and in shared workspaces.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="mt-6 space-y-8">
                    {/* Avatar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative">
                        <Avatar className="size-20 text-xl">
                          {avatarUrl ? <AvatarImage src={avatarUrl} alt="Your new profile photo preview" /> : null}
                          <AvatarFallback className="bg-primary/10 text-xl font-medium text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={fileInputRef}
                            id="avatar-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="sr-only"
                            onChange={onAvatarChange}
                            aria-describedby="avatar-help"
                            aria-invalid={avatarError ? true : undefined}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {avatarUrl ? (
                              <Camera aria-hidden="true" />
                            ) : (
                              <Upload aria-hidden="true" />
                            )}
                            {avatarUrl ? "Change photo" : "Upload photo"}
                          </Button>
                          {avatarUrl ? (
                            <Button type="button" variant="ghost" size="sm" onClick={removeAvatar}>
                              Remove
                            </Button>
                          ) : null}
                        </div>
                        <p id="avatar-help" className="text-sm text-muted-foreground">
                          PNG, JPG, GIF or WebP. Max 2 MB.
                        </p>
                        {avatarError ? (
                          <p role="alert" className="text-sm text-destructive">
                            {avatarError}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <FieldGroup>
                      <div className="grid gap-7 sm:grid-cols-2">
                        <Field data-invalid={errors.firstName ? true : undefined}>
                          <FieldLabel htmlFor="field-firstName">First name</FieldLabel>
                          <Input
                            id="field-firstName"
                            name="firstName"
                            autoComplete="given-name"
                            value={profile.firstName}
                            onChange={(e) => update("firstName", e.target.value)}
                            aria-invalid={errors.firstName ? true : undefined}
                            aria-describedby={errors.firstName ? "err-firstName" : undefined}
                          />
                          {errors.firstName ? (
                            <FieldError id="err-firstName">{errors.firstName}</FieldError>
                          ) : null}
                        </Field>
                        <Field data-invalid={errors.lastName ? true : undefined}>
                          <FieldLabel htmlFor="field-lastName">Last name</FieldLabel>
                          <Input
                            id="field-lastName"
                            name="lastName"
                            autoComplete="family-name"
                            value={profile.lastName}
                            onChange={(e) => update("lastName", e.target.value)}
                            aria-invalid={errors.lastName ? true : undefined}
                            aria-describedby={errors.lastName ? "err-lastName" : undefined}
                          />
                          {errors.lastName ? (
                            <FieldError id="err-lastName">{errors.lastName}</FieldError>
                          ) : null}
                        </Field>
                      </div>

                      <Field data-invalid={errors.username ? true : undefined}>
                        <FieldLabel htmlFor="field-username">Username</FieldLabel>
                        <Input
                          id="field-username"
                          name="username"
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                          value={profile.username}
                          onChange={(e) => update("username", e.target.value.toLowerCase())}
                          aria-invalid={errors.username ? true : undefined}
                          aria-describedby={errors.username ? "err-username" : "help-username"}
                        />
                        {errors.username ? (
                          <FieldError id="err-username">{errors.username}</FieldError>
                        ) : (
                          <FieldDescription id="help-username">
                            Your profile lives at northwind.example/@{profile.username || "username"}.
                          </FieldDescription>
                        )}
                      </Field>

                      <Field data-invalid={errors.email ? true : undefined}>
                        <FieldLabel htmlFor="field-email">Email</FieldLabel>
                        <Input
                          id="field-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={profile.email}
                          onChange={(e) => update("email", e.target.value)}
                          aria-invalid={errors.email ? true : undefined}
                          aria-describedby={errors.email ? "err-email" : "help-email"}
                        />
                        {errors.email ? (
                          <FieldError id="err-email">{errors.email}</FieldError>
                        ) : (
                          <FieldDescription id="help-email">
                            We&apos;ll send receipts and security alerts here.
                          </FieldDescription>
                        )}
                      </Field>

                      <div className="grid gap-7 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="field-role">Role</FieldLabel>
                          <Select value={profile.role} onValueChange={(v) => update("role", v)}>
                            <SelectTrigger id="field-role" className="w-full">
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
                        <Field data-invalid={errors.website ? true : undefined}>
                          <FieldLabel htmlFor="field-website">Website</FieldLabel>
                          <Input
                            id="field-website"
                            name="website"
                            type="url"
                            inputMode="url"
                            autoComplete="url"
                            placeholder="https://"
                            value={profile.website}
                            onChange={(e) => update("website", e.target.value)}
                            aria-invalid={errors.website ? true : undefined}
                            aria-describedby={errors.website ? "err-website" : undefined}
                          />
                          {errors.website ? (
                            <FieldError id="err-website">{errors.website}</FieldError>
                          ) : null}
                        </Field>
                      </div>

                      <Field data-invalid={errors.bio ? true : undefined}>
                        <FieldLabel htmlFor="field-bio">Bio</FieldLabel>
                        <Textarea
                          id="field-bio"
                          name="bio"
                          rows={4}
                          value={profile.bio}
                          onChange={(e) => update("bio", e.target.value)}
                          aria-invalid={errors.bio ? true : undefined}
                          aria-describedby={errors.bio ? "err-bio" : "help-bio"}
                        />
                        {errors.bio ? (
                          <FieldError id="err-bio">{errors.bio}</FieldError>
                        ) : null}
                        <FieldDescription id="help-bio" aria-live="polite">
                          {bioLeft >= 0
                            ? `${bioLeft} characters remaining.`
                            : `${-bioLeft} characters over the limit.`}
                        </FieldDescription>
                      </Field>

                      <div className="grid gap-7 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="field-timezone">Time zone</FieldLabel>
                          <Select value={profile.timezone} onValueChange={(v) => update("timezone", v)}>
                            <SelectTrigger id="field-timezone" className="w-full">
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
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="field-language">Language</FieldLabel>
                          <Select value={profile.language} onValueChange={(v) => update("language", v)}>
                            <SelectTrigger id="field-language" className="w-full">
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
                    </FieldGroup>
                  </CardContent>

                  <CardFooter className="mt-8 flex-col-reverse items-stretch gap-2 border-t sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                      {dirty || avatarDirty ? "You have unsaved changes." : "All changes saved."}
                    </p>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onReset}
                        disabled={saving || !(dirty || avatarDirty)}
                      >
                        Discard
                      </Button>
                      <Button type="submit" disabled={saving || !(dirty || avatarDirty)}>
                        {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                        {saving ? "Saving…" : "Save changes"}
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </section>

            {/* Account & security */}
            <section id="account" aria-labelledby="account-title" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle id="account-title" className="text-lg">
                    Account &amp; security
                  </CardTitle>
                  <CardDescription>Keep your account protected.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-5">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="sw-2fa">Two-factor authentication</FieldLabel>
                        <FieldDescription>
                          Require a code from your authenticator app when signing in.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="sw-2fa"
                        checked={security.twoFactor}
                        onCheckedChange={(v) => setSecurity((s) => ({ ...s, twoFactor: v }))}
                      />
                    </Field>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="sw-alerts">Sign-in alerts</FieldLabel>
                        <FieldDescription>
                          Email me when a new device signs in to my account.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="sw-alerts"
                        checked={security.loginAlerts}
                        onCheckedChange={(v) => setSecurity((s) => ({ ...s, loginAlerts: v }))}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toast.info("Check your inbox", {
                        description: "We sent a password reset link to maya.okafor@northwind.example.",
                      })
                    }
                  >
                    Send password reset link
                  </Button>
                </CardFooter>
              </Card>
            </section>

            {/* Notifications */}
            <section id="notifications" aria-labelledby="notifications-title" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle id="notifications-title" className="text-lg">
                    Notifications
                  </CardTitle>
                  <CardDescription>Choose what we email you about.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldSet>
                    <FieldLegend className="sr-only">Email notifications</FieldLegend>
                    <FieldGroup className="gap-5">
                      {(
                        [
                          ["product", "Product updates", "New features and improvements to Northwind."],
                          ["comments", "Comments and mentions", "When someone replies to you or mentions you."],
                          ["digest", "Weekly digest", "A Monday summary of activity across your projects."],
                          ["marketing", "Tips and offers", "Occasional guides, events and promotions."],
                        ] as const
                      ).map(([key, title, desc]) => (
                        <Field key={key} orientation="horizontal">
                          <FieldContent>
                            <FieldLabel htmlFor={`sw-${key}`}>{title}</FieldLabel>
                            <FieldDescription>{desc}</FieldDescription>
                          </FieldContent>
                          <Switch
                            id={`sw-${key}`}
                            checked={notif[key]}
                            onCheckedChange={(v) => setNotif((n) => ({ ...n, [key]: v }))}
                          />
                        </Field>
                      ))}
                    </FieldGroup>
                  </FieldSet>
                </CardContent>
              </Card>
            </section>

            {/* Appearance */}
            <section id="appearance" aria-labelledby="appearance-title" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle id="appearance-title" className="text-lg">
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how Northwind looks on this device.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-7 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="sel-theme">Theme</FieldLabel>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger id="sel-theme" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">Match system</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="sel-density">Density</FieldLabel>
                      <Select value={density} onValueChange={setDensity}>
                        <SelectTrigger id="sel-density" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Billing */}
            <section id="billing" aria-labelledby="billing-title" className="scroll-mt-8">
              <Card>
                <CardHeader>
                  <CardTitle id="billing-title" className="text-lg">
                    Billing
                  </CardTitle>
                  <CardDescription>Your plan and payment method.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Team plan</span>
                        <Badge variant="secondary">Monthly</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        $24 per seat · 5 seats · Renews on 14 March 2026
                      </p>
                      <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                    </div>
                    <Button type="button" variant="outline">
                      Manage billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Danger zone */}
            <section id="danger" aria-labelledby="danger-title" className="scroll-mt-8">
              <Card className="border-destructive/40">
                <CardHeader>
                  <CardTitle id="danger-title" className="flex items-center gap-2 text-lg text-destructive">
                    <AlertTriangle className="size-5" aria-hidden="true" />
                    Danger zone
                  </CardTitle>
                  <CardDescription>
                    These actions are permanent or hard to undo. Proceed with care.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-0 divide-y">
                  <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Export your data</h3>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of your projects, comments and profile as a ZIP archive.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() =>
                        toast.success("Export requested", {
                          description: "We'll email you a download link within a few minutes.",
                        })
                      }
                    >
                      Request export
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Delete account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently remove your account, projects and all associated data.
                      </p>
                    </div>

                    <AlertDialog onOpenChange={(open) => !open && setDeleteConfirm("")}>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" className="shrink-0">
                          <Trash2 aria-hidden="true" />
                          Delete account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your account, 12 projects and 248 files. This
                            action cannot be undone after the 14-day grace period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Field>
                          <FieldLabel htmlFor="delete-confirm">
                            Type <span className="font-mono font-semibold">{profile.username}</span> to confirm
                          </FieldLabel>
                          <Input
                            id="delete-confirm"
                            autoComplete="off"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                          />
                        </Field>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={deleteConfirm !== profile.username || deleting}
                            onClick={onDeleteAccount}
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