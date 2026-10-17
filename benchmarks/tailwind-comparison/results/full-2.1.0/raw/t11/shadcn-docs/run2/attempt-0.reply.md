Noted: the docs say the default spacing changed to `2`, while the installed component defaults to `0`. I'll set `spacing` explicitly. Writing the file now.

```tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  BugIcon,
  CheckIcon,
  CopyIcon,
  PackageIcon,
  RocketIcon,
  SearchIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TriangleAlertIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Tag = "feature" | "improvement" | "fix" | "security" | "breaking";

type Snippet = {
  title: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string; // ISO date
  title: string;
  summary: string;
  tags: Tag[];
  latest?: boolean;
  changes: string[];
  snippets?: Snippet[];
  breakingNote?: string;
};

const TAG_META: Record<
  Tag,
  { label: string; icon: React.ComponentType<React.ComponentProps<"svg">> }
> = {
  feature: { label: "Feature", icon: SparklesIcon },
  improvement: { label: "Improvement", icon: WrenchIcon },
  fix: { label: "Fix", icon: BugIcon },
  security: { label: "Security", icon: ShieldAlertIcon },
  breaking: { label: "Breaking", icon: TriangleAlertIcon },
};

const TAG_ORDER: Tag[] = [
  "feature",
  "improvement",
  "fix",
  "security",
  "breaking",
];

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-17",
    title: "Streaming exports and scoped API tokens",
    summary:
      "Large exports no longer block your dashboard, and API tokens can finally be limited to the projects they need.",
    tags: ["feature", "improvement"],
    latest: true,
    changes: [
      "Exports now stream to a downloadable file, so a 2M-row export starts in under two seconds.",
      "Scoped API tokens can be restricted to a single project or a read-only role.",
      "The audit log gained a CSV download and a 90-day retention option.",
      "Webhook deliveries now show the full request and response in the dashboard.",
    ],
    snippets: [
      {
        title: "Create a read-only token for one project",
        language: "bash",
        code: `curl -X POST https://api.example.com/v3/tokens \\
  -H "Authorization: Bearer $LUMEN_ADMIN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"ci-readonly","scope":"project:web-app","role":"read"}'`,
      },
      {
        title: "Stream an export in Node.js",
        language: "ts",
        code: `import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Lumen } from "@lumen/sdk";

const lumen = new Lumen({ apiKey: process.env.LUMEN_API_KEY });
const stream = await lumen.exports.stream({ dataset: "events", format: "csv" });

await pipeline(Readable.fromWeb(stream), createWriteStream("events.csv"));`,
      },
    ],
  },
  {
    version: "3.1.2",
    date: "2025-05-29",
    title: "Patch for session fixation and timezone bugs",
    summary:
      "A security hardening release. We recommend every self-hosted deployment upgrades.",
    tags: ["security", "fix"],
    changes: [
      "Session identifiers are now rotated on login and on privilege changes.",
      "Fixed scheduled reports firing an hour late during daylight saving transitions.",
      "Fixed a crash when importing CSV files that contain a byte-order mark.",
      "Rate-limit headers are now returned on every 429 response.",
    ],
    snippets: [
      {
        title: "Upgrade a self-hosted deployment",
        language: "bash",
        code: `docker pull ghcr.io/lumen/server:3.1.2
docker compose up -d --no-deps server`,
      },
    ],
  },
  {
    version: "3.1.0",
    date: "2025-05-06",
    title: "Dashboard filters and saved views",
    summary:
      "Build a view once and share it with your team. Filters now persist in the URL.",
    tags: ["feature", "improvement"],
    changes: [
      "Saved views let you store filters, columns and sort order under a name.",
      "Filter state is encoded in the URL, so any view can be shared as a link.",
      "Table columns can be reordered with the keyboard as well as by dragging.",
      "Improved initial load time of the events table by 38% through virtualized rows.",
    ],
    snippets: [
      {
        title: "Open a saved view from code",
        language: "ts",
        code: `const view = await lumen.views.get("weekly-signups");
window.location.href = view.shareUrl;`,
      },
    ],
  },
  {
    version: "3.0.0",
    date: "2025-03-18",
    title: "Lumen 3: a new SDK and a faster query engine",
    summary:
      "Our biggest release yet. The SDK is rewritten in TypeScript and the query engine is up to 4x faster on wide tables.",
    tags: ["feature", "breaking", "improvement"],
    changes: [
      "New TypeScript-first SDK with full type inference for event schemas.",
      "Query engine rewrite: p95 latency on 100M-row tables dropped from 1.9s to 480ms.",
      "The `track()` method now returns a promise and no longer swallows network errors.",
      "Dropped support for Node.js 16 and the legacy `lumen.js` browser bundle.",
    ],
    breakingNote:
      "`lumen.identify()` now takes an object instead of positional arguments. Update every call site before upgrading.",
    snippets: [
      {
        title: "Install the new SDK",
        language: "bash",
        code: `npm install @lumen/sdk@3`,
      },
      {
        title: "Migrate identify() calls",
        language: "ts",
        code: `// Before (v2)
lumen.identify("user_123", { plan: "pro" });

// After (v3)
await lumen.identify({ userId: "user_123", traits: { plan: "pro" } });`,
      },
    ],
  },
  {
    version: "2.9.4",
    date: "2025-02-11",
    title: "Reliability fixes for the ingestion pipeline",
    summary:
      "Fixes for edge cases we found while load-testing ahead of the 3.0 release.",
    tags: ["fix"],
    changes: [
      "Fixed duplicate events when a client retried after a connection reset.",
      "Fixed the ingest endpoint returning 500 instead of 413 for oversized payloads.",
      "Dashboards no longer show a blank chart when a series contains only null values.",
    ],
  },
  {
    version: "2.9.0",
    date: "2025-01-14",
    title: "Slack alerts and anomaly detection",
    summary:
      "Get told when a metric moves unexpectedly, without writing a single threshold by hand.",
    tags: ["feature"],
    changes: [
      "Anomaly detection flags metrics that deviate from their seasonal baseline.",
      "Alerts can be delivered to Slack channels, email, or any webhook.",
      "Added a quiet-hours setting so that alerts wait until your team is online.",
    ],
    snippets: [
      {
        title: "Create an alert from the CLI",
        language: "bash",
        code: `lumen alerts create \\
  --metric signups.daily \\
  --detect anomaly \\
  --notify slack:#growth`,
      },
    ],
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function CodeSnippet({ snippet }: { snippet: Snippet }) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(snippet.code);
    if (!ok) {
      toast.error("Couldn't copy to clipboard", {
        description: "Select the code and copy it manually.",
      });
      return;
    }
    setCopied(true);
    toast.success("Copied to clipboard", { description: snippet.title });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <figure className="overflow-hidden rounded-lg border bg-muted/40">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/60 py-1.5 pr-1.5 pl-3">
        <span className="flex min-w-0 items-center gap-2 text-xs">
          <span className="truncate font-medium">{snippet.title}</span>
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            {snippet.language}
          </Badge>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy snippet: ${snippet.title}`}
        >
          {copied ? (
            <CheckIcon data-icon="inline-start" />
          ) : (
            <CopyIcon data-icon="inline-start" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </figcaption>
      <pre
        tabIndex={0}
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`${snippet.language} code: ${snippet.title}`}
      >
        <code>{snippet.code}</code>
      </pre>
    </figure>
  );
}

function TagBadge({ tag }: { tag: Tag }) {
  const { label, icon: Icon } = TAG_META[tag];
  return (
    <Badge
      variant={
        tag === "breaking"
          ? "destructive"
          : tag === "feature"
            ? "default"
            : "secondary"
      }
    >
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

function ReleaseEntry({
  release,
  isLast,
}: {
  release: Release;
  isLast: boolean;
}) {
  const headingId = `release-${release.version.replaceAll(".", "-")}`;

  return (
    <li className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4 md:grid-cols-[10rem_1.5rem_minmax(0,1fr)] md:gap-x-6">
      {/* Date column (desktop) */}
      <div className="hidden pt-1 text-right md:block">
        <time
          dateTime={release.date}
          className="text-sm font-medium text-muted-foreground"
        >
          {formatDate(release.date)}
        </time>
      </div>

      {/* Rail */}
      <div className="relative flex justify-center" aria-hidden="true">
        <span
          className={cn(
            "z-10 mt-1.5 flex size-3.5 items-center justify-center rounded-full border-2 border-background ring-2",
            release.latest
              ? "bg-primary ring-primary"
              : "bg-muted-foreground/60 ring-border"
          )}
        />
        {!isLast && (
          <span className="absolute top-5 -bottom-10 w-px bg-border" />
        )}
      </div>

      {/* Content */}
      <article
        aria-labelledby={headingId}
        className="flex min-w-0 flex-col gap-5 pb-14"
      >
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2
              id={headingId}
              className="font-mono text-2xl font-semibold tracking-tight"
            >
              v{release.version}
            </h2>
            {release.latest && (
              <Badge variant="outline" className="gap-1">
                <RocketIcon aria-hidden="true" />
                Latest
              </Badge>
            )}
            <time
              dateTime={release.date}
              className="text-sm text-muted-foreground md:hidden"
            >
              {formatDate(release.date)}
            </time>
          </div>
          <p className="text-lg leading-snug font-medium text-balance">
            {release.title}
          </p>
          <ul
            className="flex flex-wrap gap-1.5"
            aria-label={`Tags for version ${release.version}`}
          >
            {release.tags.map((tag) => (
              <li key={tag}>
                <TagBadge tag={tag} />
              </li>
            ))}
          </ul>
        </header>

        <p className="text-sm/relaxed text-muted-foreground">
          {release.summary}
        </p>

        {release.breakingNote && (
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>Breaking change</AlertTitle>
            <AlertDescription>{release.breakingNote}</AlertDescription>
          </Alert>
        )}

        <ul className="flex flex-col gap-2 text-sm/relaxed">
          {release.changes.map((change) => (
            <li key={change} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
              />
              <span className="min-w-0">{change}</span>
            </li>
          ))}
        </ul>

        {release.snippets && release.snippets.length > 0 && (
          <div className="flex flex-col gap-3">
            {release.snippets.map((snippet) => (
              <CodeSnippet key={snippet.title} snippet={snippet} />
            ))}
          </div>
        )}
      </article>
    </li>
  );
}

export default function ChangelogPage() {
  const [query, setQuery] = React.useState("");
  const [activeTags, setActiveTags] = React.useState<Tag[]>([]);

  const counts = React.useMemo(() => {
    const result: Record<Tag, number> = {
      feature: 0,
      improvement: 0,
      fix: 0,
      security: 0,
      breaking: 0,
    };
    for (const release of RELEASES) {
      for (const tag of release.tags) result[tag] += 1;
    }
    return result;
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELEASES.filter((release) => {
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((tag) => release.tags.includes(tag));
      if (!matchesTags) return false;
      if (!q) return true;
      const haystack = [
        release.version,
        release.title,
        release.summary,
        ...release.changes,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, activeTags]);

  const hasFilters = query.trim() !== "" || activeTags.length > 0;

  const resetFilters = () => {
    setQuery("");
    setActiveTags([]);
  };

  const installCommand = "npm install @lumen/sdk@latest";
  const [installCopied, setInstallCopied] = React.useState(false);
  const installTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(() => {
    return () => {
      if (installTimeout.current) clearTimeout(installTimeout.current);
    };
  }, []);

  const copyInstall = async () => {
    const ok = await copyText(installCommand);
    if (!ok) {
      toast.error("Couldn't copy to clipboard");
      return;
    }
    setInstallCopied(true);
    toast.success("Install command copied");
    if (installTimeout.current) clearTimeout(installTimeout.current);
    installTimeout.current = setTimeout(() => setInstallCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#releases"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to releases
      </a>

      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 md:py-20">
        {/* Page header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Badge variant="secondary" className="w-fit">
              <PackageIcon aria-hidden="true" />
              Lumen Analytics
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Changelog
            </h1>
            <p className="max-w-2xl text-base/relaxed text-muted-foreground">
              New features, improvements and fixes shipped to Lumen, newest
              first. Current version is{" "}
              <span className="font-mono font-medium text-foreground">
                v{RELEASES[0].version}
              </span>
              .
            </p>
          </div>

          <div className="flex max-w-md items-center gap-2 rounded-lg border bg-muted/40 py-1.5 pr-1.5 pl-3">
            <code className="min-w-0 flex-1 truncate font-mono text-sm">
              <span aria-hidden="true" className="text-muted-foreground">
                ${" "}
              </span>
              {installCommand}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyInstall}
              aria-label={`Copy install command: ${installCommand}`}
            >
              {installCopied ? (
                <CheckIcon data-icon="inline-start" />
              ) : (
                <CopyIcon data-icon="inline-start" />
              )}
              {installCopied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Filters */}
        <section
          aria-label="Filter releases"
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="w-full md:max-w-xs">
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search releases"
                aria-label="Search releases"
              />
              {query !== "" && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                  >
                    <XIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>

          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            spacing={2}
            value={activeTags}
            onValueChange={(value) => setActiveTags(value as Tag[])}
            aria-label="Filter by tag"
            className="flex-wrap"
          >
            {TAG_ORDER.map((tag) => {
              const { label, icon: Icon } = TAG_META[tag];
              return (
                <ToggleGroupItem
                  key={tag}
                  value={tag}
                  aria-label={`${label} (${counts[tag]} releases)`}
                >
                  <Icon aria-hidden="true" />
                  {label}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {counts[tag]}
                  </span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </section>

        <p
          className="mt-4 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Showing {filtered.length} of {RELEASES.length} releases
        </p>

        {/* Timeline */}
        <section id="releases" aria-label="Releases" className="mt-10">
          {filtered.length > 0 ? (
            <ol className="flex flex-col">
              {filtered.map((release, index) => (
                <ReleaseEntry
                  key={release.version}
                  release={release}
                  isLast={index === filtered.length - 1}
                />
              ))}
            </ol>
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No releases match</EmptyTitle>
                <EmptyDescription>
                  Try a different search term or remove a tag filter to see more
                  of the changelog.
                </EmptyDescription>
              </EmptyHeader>
              {hasFilters && (
                <EmptyContent>
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          )}
        </section>

        {filtered.length > 0 && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            You&apos;ve reached the beginning of the changelog.
          </p>
        )}
      </main>
    </div>
  );
}
```