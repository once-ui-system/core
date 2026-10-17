CardTitle in this project is a plain div with no `asChild` prop. I'll use a small local `SectionTitle` heading component that carries the same classes instead.

```tsx
"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BellIcon,
  CameraIcon,
  CreditCardIcon,
  GlobeIcon,
  LinkIcon,
  ShieldIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UploadIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type SectionId = "profile" | "account" | "notifications" | "billing" | "danger"

interface SectionDef {
  id: SectionId
  label: string
  description: string
  icon: LucideIcon
}

const SECTIONS: SectionDef[] = [
  {
    id: "profile",
    label: "Profile",
    description: "How you appear to teammates",
    icon: UserIcon,
  },
  {
    id: "account",
    label: "Account",
    description: "Security and sign-in",
    icon: ShieldIcon,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Emails and alerts",
    icon: BellIcon,
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plan and invoices",
    icon: CreditCardIcon,
  },
  {
    id: "danger",
    label: "Danger zone",
    description: "Irreversible actions",
    icon: TriangleAlertIcon,
  },
]

const TIMEZONES = [
  {
    group: "Americas",
    items: [
      { value: "america-los_angeles", label: "Pacific Time (UTC−08:00)" },
      { value: "america-denver", label: "Mountain Time (UTC−07:00)" },
      { value: "america-new_york", label: "Eastern Time (UTC−05:00)" },
      { value: "america-sao_paulo", label: "Brasília Time (UTC−03:00)" },
    ],
  },
  {
    group: "Europe & Africa",
    items: [
      { value: "europe-london", label: "London (UTC+00:00)" },
      { value: "europe-berlin", label: "Central European Time (UTC+01:00)" },
      { value: "africa-nairobi", label: "East Africa Time (UTC+03:00)" },
    ],
  },
  {
    group: "Asia & Pacific",
    items: [
      { value: "asia-kolkata", label: "India Standard Time (UTC+05:30)" },
      { value: "asia-singapore", label: "Singapore Time (UTC+08:00)" },
      { value: "asia-tokyo", label: "Japan Standard Time (UTC+09:00)" },
      { value: "pacific-auckland", label: "New Zealand Time (UTC+13:00)" },
    ],
  },
]

const LANGUAGES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "ja", label: "日本語" },
]

const ROLES = [
  { value: "product-designer", label: "Product designer" },
  { value: "engineer", label: "Software engineer" },
  { value: "product-manager", label: "Product manager" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
]

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]
const BIO_LIMIT = 200

interface ProfileState {
  firstName: string
  lastName: string
  username: string
  email: string
  role: string
  timezone: string
  language: string
  website: string
  bio: string
}

const INITIAL_PROFILE: ProfileState = {
  firstName: "Maya",
  lastName: "Okafor",
  username: "maya.okafor",
  email: "maya.okafor@northwind.studio",
  role: "product-designer",
  timezone: "europe-london",
  language: "en-US",
  website: "mayaokafor.design",
  bio: "Product designer at Northwind Studio. I care about calm interfaces, good defaults and design systems that people actually enjoy using.",
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function SectionTitle({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <h2
      id={id}
      data-slot="card-title"
      className={cn("text-lg leading-none font-semibold", className)}
    >
      {children}
    </h2>
  )
}

function SectionNav({
  active,
  onSelect,
}: {
  active: SectionId
  onSelect: (id: SectionId) => void
}) {
  return (
    <nav aria-label="Settings sections">
      <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const isActive = active === section.id
          const isDanger = section.id === "danger"
          return (
            <li key={section.id} className="shrink-0 lg:shrink">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  onSelect(section.id)
                }}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
                  isDanger && "text-destructive hover:text-destructive"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex flex-col">
                  <span>{section.label}</span>
                  <span className="hidden text-xs font-normal text-muted-foreground lg:block">
                    {section.description}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default function SettingsPage() {
  const [active, setActive] = React.useState<SectionId>("profile")
  const [profile, setProfile] = React.useState<ProfileState>(INITIAL_PROFILE)
  const [savedProfile, setSavedProfile] =
    React.useState<ProfileState>(INITIAL_PROFILE)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
  const [avatarError, setAvatarError] = React.useState<string | null>(null)
  const [avatarMeta, setAvatarMeta] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteConfirm, setDeleteConfirm] = React.useState("")
  const [prefs, setPrefs] = React.useState({
    productUpdates: true,
    comments: true,
    weeklyDigest: false,
    securityAlerts: true,
  })
  const [twoFactor, setTwoFactor] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const avatarUrlRef = React.useRef<string | null>(null)

  // Revoke any object URL when the page unmounts.
  React.useEffect(() => {
    avatarUrlRef.current = avatarUrl
  }, [avatarUrl])
  React.useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current)
    }
  }, [])

  // Scroll-spy for the section navigation.
  React.useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    )
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const first = visible[0]
        if (first) setActive(first.target.id as SectionId)
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const isDirty = React.useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(savedProfile),
    [profile, savedProfile]
  )

  const emailInvalid =
    profile.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
  const firstNameInvalid = profile.firstName.trim().length === 0
  const usernameInvalid = !/^[a-z0-9._-]{3,30}$/i.test(profile.username)
  const formInvalid = emailInvalid || firstNameInvalid || usernameInvalid

  function updateField<K extends keyof ProfileState>(
    key: K,
    value: ProfileState[K]
  ) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function scrollToSection(id: SectionId) {
    setActive(id)
    const el = document.getElementById(id)
    if (el) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      el.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      })
      window.history.replaceState(null, "", `#${id}`)
    }
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError("Use a PNG, JPG or WebP image.")
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(
        `That file is ${formatBytes(file.size)}. The maximum size is 2 MB.`
      )
      return
    }
    setAvatarError(null)
    const url = URL.createObjectURL(file)
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    setAvatarMeta(`${file.name} · ${formatBytes(file.size)}`)
    toast.success("Photo selected", {
      description: "Save your changes to update your profile photo.",
    })
  }

  function removeAvatar() {
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setAvatarMeta(null)
    setAvatarError(null)
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (formInvalid || saving) return
    setSaving(true)
    window.setTimeout(() => {
      setSavedProfile(profile)
      setSaving(false)
      toast.success("Profile updated", {
        description: "Your changes have been saved.",
      })
    }, 900)
  }

  function handleReset() {
    setProfile(savedProfile)
  }

  function handleDelete() {
    setDeleting(true)
    window.setTimeout(() => {
      setDeleting(false)
      setDeleteOpen(false)
      setDeleteConfirm("")
      toast.error("Deletion scheduled", {
        description:
          "Your account will be permanently removed in 14 days unless you sign back in.",
      })
    }, 1000)
  }

  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() ||
    "?"
  const fullName = `${profile.firstName} ${profile.lastName}`.trim()
  const bioRemaining = BIO_LIMIT - profile.bio.length
  const deleteReady = deleteConfirm === profile.username

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#profile"
        onClick={(event) => {
          event.preventDefault()
          scrollToSection("profile")
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-[3px] focus:ring-ring/50"
      >
        Skip to settings content
      </a>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8 flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Northwind Studio</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, security and notification preferences.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="-mx-4 border-b px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:border-b-0 lg:px-0">
              <SectionNav active={active} onSelect={scrollToSection} />
            </div>
          </aside>

          <main className="flex min-w-0 flex-col gap-8">
            {/* Profile */}
            <section
              id="profile"
              aria-labelledby="profile-heading"
              className="scroll-mt-8"
            >
              <form onSubmit={handleSave} noValidate>
                <Card>
                  <CardHeader>
                    <SectionTitle id="profile-heading">Profile</SectionTitle>
                    <CardDescription>
                      This information is visible to other members of your
                      workspace.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-8">
                    {/* Avatar upload */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative w-fit">
                        <Avatar className="size-20 sm:size-24">
                          {avatarUrl ? (
                            <AvatarImage
                              src={avatarUrl}
                              alt={`Profile photo of ${fullName || "you"}`}
                            />
                          ) : null}
                          <AvatarFallback className="text-xl font-medium sm:text-2xl">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="secondary"
                          className="absolute -right-1 -bottom-1 rounded-full border shadow-sm"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Change profile photo"
                        >
                          <CameraIcon />
                        </Button>
                      </div>

                      <div className="flex min-w-0 flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Profile photo</p>
                          <p
                            id="avatar-help"
                            className="text-sm text-muted-foreground"
                          >
                            PNG, JPG or WebP. Square images work best, up to 2
                            MB.
                          </p>
                          {avatarMeta ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {avatarMeta}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={fileInputRef}
                            id="avatar-upload"
                            type="file"
                            accept={ACCEPTED_TYPES.join(",")}
                            className="sr-only"
                            tabIndex={-1}
                            aria-hidden="true"
                            onChange={handleAvatarChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            aria-describedby="avatar-help"
                          >
                            <UploadIcon data-icon="inline-start" />
                            Upload photo
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeAvatar}
                            disabled={!avatarUrl}
                          >
                            Remove
                          </Button>
                        </div>
                        {avatarError ? (
                          <p role="alert" className="text-sm text-destructive">
                            {avatarError}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <Separator />

                    <FieldGroup>
                      <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
                        <Field data-invalid={firstNameInvalid || undefined}>
                          <FieldLabel htmlFor="first-name">
                            First name
                          </FieldLabel>
                          <Input
                            id="first-name"
                            name="firstName"
                            autoComplete="given-name"
                            value={profile.firstName}
                            onChange={(e) =>
                              updateField("firstName", e.target.value)
                            }
                            aria-invalid={firstNameInvalid}
                            aria-describedby={
                              firstNameInvalid ? "first-name-error" : undefined
                            }
                            required
                          />
                          {firstNameInvalid ? (
                            <FieldError id="first-name-error">
                              First name is required.
                            </FieldError>
                          ) : null}
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                          <Input
                            id="last-name"
                            name="lastName"
                            autoComplete="family-name"
                            value={profile.lastName}
                            onChange={(e) =>
                              updateField("lastName", e.target.value)
                            }
                          />
                        </Field>
                      </div>

                      <Field data-invalid={usernameInvalid || undefined}>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>northwind.app/</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="username"
                            name="username"
                            autoComplete="username"
                            value={profile.username}
                            onChange={(e) =>
                              updateField("username", e.target.value)
                            }
                            aria-invalid={usernameInvalid}
                            aria-describedby="username-help"
                          />
                        </InputGroup>
                        <FieldDescription id="username-help">
                          {usernameInvalid
                            ? "Use 3–30 letters, numbers, dots, dashes or underscores."
                            : "Your public profile link. Changing it breaks existing links."}
                        </FieldDescription>
                      </Field>

                      <Field data-invalid={emailInvalid || undefined}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={profile.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          aria-invalid={emailInvalid}
                          aria-describedby={
                            emailInvalid ? "email-error" : "email-help"
                          }
                        />
                        {emailInvalid ? (
                          <FieldError id="email-error">
                            Enter a valid email address, like name@company.com.
                          </FieldError>
                        ) : (
                          <FieldDescription id="email-help">
                            We send receipts and security notices here.
                          </FieldDescription>
                        )}
                      </Field>

                      <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
                        <Field>
                          <FieldLabel htmlFor="role">Role</FieldLabel>
                          <Select
                            value={profile.role}
                            onValueChange={(v) => updateField("role", v)}
                            name="role"
                          >
                            <SelectTrigger id="role" className="w-full">
                              <SelectValue placeholder="Select a role" />
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
                          <FieldLabel htmlFor="language">Language</FieldLabel>
                          <Select
                            value={profile.language}
                            onValueChange={(v) => updateField("language", v)}
                            name="language"
                          >
                            <SelectTrigger id="language" className="w-full">
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {LANGUAGES.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
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
                          onValueChange={(v) => updateField("timezone", v)}
                          name="timezone"
                        >
                          <SelectTrigger id="timezone" className="w-full">
                            <SelectValue placeholder="Select a time zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map((group) => (
                              <SelectGroup key={group.group}>
                                <SelectLabel>{group.group}</SelectLabel>
                                {group.items.map((tz) => (
                                  <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Used for meeting times and digest scheduling.
                        </FieldDescription>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="website">Website</FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <LinkIcon aria-hidden="true" />
                            <InputGroupText>https://</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id="website"
                            name="website"
                            inputMode="url"
                            autoComplete="url"
                            value={profile.website}
                            onChange={(e) =>
                              updateField("website", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="bio">Bio</FieldLabel>
                        <Textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          maxLength={BIO_LIMIT}
                          value={profile.bio}
                          onChange={(e) => updateField("bio", e.target.value)}
                          aria-describedby="bio-help"
                        />
                        <FieldDescription id="bio-help">
                          A short introduction.{" "}
                          <span
                            aria-live="polite"
                            className={cn(
                              "tabular-nums",
                              bioRemaining < 20 && "text-foreground"
                            )}
                          >
                            {bioRemaining} characters left.
                          </span>
                        </FieldDescription>
                      </Field>
                    </FieldGroup>
                  </CardContent>

                  <CardFooter className="flex-col-reverse gap-3 border-t sm:flex-row sm:justify-end">
                    <p
                      className="text-sm text-muted-foreground sm:mr-auto"
                      aria-live="polite"
                    >
                      {isDirty ? "You have unsaved changes." : "All changes saved."}
                    </p>
                    <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={!isDirty || saving}
                      >
                        Discard
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isDirty || formInvalid || saving}
                      >
                        {saving ? <Spinner data-icon="inline-start" /> : null}
                        {saving ? "Saving…" : "Save changes"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </form>
            </section>

            {/* Account */}
            <section
              id="account"
              aria-labelledby="account-heading"
              className="scroll-mt-8"
            >
              <Card>
                <CardHeader>
                  <SectionTitle id="account-heading">Account</SectionTitle>
                  <CardDescription>
                    Keep your account secure with a strong password and
                    two-factor authentication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="two-factor">
                        Two-factor authentication
                      </FieldLabel>
                      <FieldDescription>
                        Require a code from your authenticator app when signing
                        in on a new device.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="two-factor"
                      checked={twoFactor}
                      onCheckedChange={(checked) => {
                        setTwoFactor(checked)
                        toast(
                          checked
                            ? "Two-factor authentication enabled"
                            : "Two-factor authentication disabled"
                        )
                      }}
                    />
                  </Field>
                  <Separator />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed 4 months ago.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        toast("Check your inbox", {
                          description:
                            "We sent a password reset link to your email.",
                        })
                      }
                    >
                      Send reset link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Notifications */}
            <section
              id="notifications"
              aria-labelledby="notifications-heading"
              className="scroll-mt-8"
            >
              <Card>
                <CardHeader>
                  <SectionTitle id="notifications-heading">
                    Notifications
                  </SectionTitle>
                  <CardDescription>
                    Choose which emails you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldSet>
                    <FieldLegend className="sr-only">
                      Email notifications
                    </FieldLegend>
                    <FieldGroup className="gap-5">
                      {(
                        [
                          {
                            key: "productUpdates",
                            title: "Product updates",
                            description:
                              "New features and improvements, about once a month.",
                          },
                          {
                            key: "comments",
                            title: "Comments and mentions",
                            description:
                              "When someone replies to you or mentions you in a file.",
                          },
                          {
                            key: "weeklyDigest",
                            title: "Weekly digest",
                            description:
                              "A Monday summary of activity across your projects.",
                          },
                          {
                            key: "securityAlerts",
                            title: "Security alerts",
                            description:
                              "New sign-ins and changes to your account. Recommended.",
                          },
                        ] as const
                      ).map((item) => (
                        <Field key={item.key} orientation="horizontal">
                          <FieldContent>
                            <FieldLabel htmlFor={`pref-${item.key}`}>
                              {item.title}
                            </FieldLabel>
                            <FieldDescription>
                              {item.description}
                            </FieldDescription>
                          </FieldContent>
                          <Switch
                            id={`pref-${item.key}`}
                            checked={prefs[item.key]}
                            onCheckedChange={(checked) =>
                              setPrefs((prev) => ({
                                ...prev,
                                [item.key]: checked,
                              }))
                            }
                          />
                        </Field>
                      ))}
                    </FieldGroup>
                  </FieldSet>
                </CardContent>
              </Card>
            </section>

            {/* Billing */}
            <section
              id="billing"
              aria-labelledby="billing-heading"
              className="scroll-mt-8"
            >
              <Card>
                <CardHeader>
                  <SectionTitle id="billing-heading">Billing</SectionTitle>
                  <CardDescription>
                    Your workspace plan and next invoice.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Team plan</p>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        12 seats · $18 per seat / month · Renews on 3 July 2025
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        toast("Opening billing portal is disabled in this demo")
                      }
                    >
                      <GlobeIcon data-icon="inline-start" />
                      Manage plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Danger zone */}
            <section
              id="danger"
              aria-labelledby="danger-heading"
              className="scroll-mt-8"
            >
              <Card className="border-destructive/40">
                <CardHeader>
                  <SectionTitle
                    id="danger-heading"
                    className="flex items-center gap-2 text-destructive"
                  >
                    <TriangleAlertIcon className="size-5" aria-hidden="true" />
                    Danger zone
                  </SectionTitle>
                  <CardDescription>
                    These actions are permanent or hard to undo. Proceed with
                    care.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">
                        Transfer workspace ownership
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hand over billing and admin rights to another member.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        toast("Pick a teammate to transfer ownership to", {
                          description: "Only workspace admins can be selected.",
                        })
                      }
                    >
                      Transfer
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Delete account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently remove your account, files and comments.
                        This cannot be undone.
                      </p>
                    </div>

                    <AlertDialog
                      open={deleteOpen}
                      onOpenChange={(open) => {
                        if (deleting) return
                        setDeleteOpen(open)
                        if (!open) setDeleteConfirm("")
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">
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
                            You will lose access to 24 files and 3 workspaces.
                            Your data is removed permanently after a 14-day
                            grace period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <Field>
                          <FieldLabel htmlFor="delete-confirm">
                            Type{" "}
                            <span className="font-mono font-semibold">
                              {profile.username}
                            </span>{" "}
                            to confirm
                          </FieldLabel>
                          <Input
                            id="delete-confirm"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            disabled={deleting}
                          />
                        </Field>

                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>
                            Cancel
                          </AlertDialogCancel>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={!deleteReady || deleting}
                            onClick={handleDelete}
                          >
                            {deleting ? (
                              <Spinner data-icon="inline-start" />
                            ) : null}
                            {deleting ? "Deleting…" : "Delete my account"}
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <Alert>
                    <TriangleAlertIcon aria-hidden="true" />
                    <AlertTitle>Export your data first</AlertTitle>
                    <AlertDescription>
                      <p>
                        Download a copy of your files and comments before
                        deleting. Exports are emailed within a few minutes.
                      </p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
```