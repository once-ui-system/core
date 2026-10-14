```tsx
"use client";

import * as React from "react";
import {
  Bug,
  Check,
  Copy,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Tag = "feature" | "fix" | "breaking" | "security" | "improvement";

type Snippet = {
  label: string;
  language: string;
  code: string;
};

type Release = {
  version: string;
  date: string;
  title: string;
  summary: string;
  tags: Tag[];
  changes: string[];
  snippets?: Snippet[];
  latest?: boolean;
};

const TAG_META: Record<
  Tag,
  { label: string; icon: React.ComponentType<{ className?: string }>; dot: string; badge: string }
> = {
  feature: {
    label: "Feature",
    icon: Sparkles,
    dot: "bg-emerald-500",
    badge:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  improvement: {
    label: "Improvement",
    icon: Wrench,
    dot: "bg-sky-500",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  fix: {
    label: "Fix",
    icon: Bug,
    dot: "bg-amber-500",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  breaking: {
    label: "Breaking",
    icon: TriangleAlert,
    dot: "bg-red-500",
    badge: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
  security: {
    label: "Security",
    icon: ShieldAlert,
    dot: "bg-violet-500",
    badge: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
};

const TAG_ORDER: Tag[] = ["feature", "improvement", "fix", "breaking", "security"];

const RELEASES: Release[] = [
  {
    version: "3.2.0",
    date: "2025-06-11",
    title: "Streaming queries and typed webhooks",
    summary:
      "Large result sets can now be consumed incrementally, and webhook payloads ship with generated TypeScript types so handlers are checked at compile time.",
    tags: ["feature", "improvement"],
    latest: true,
    changes: [
      "Added client.query().stream() which yields rows as an async iterator instead of buffering the full response.",
      "Webhook events are now exported as a discriminated union from @harbor/sdk/webhooks.",
      "Retry backoff now honours the Retry-After header returned by the API.",
      "Reduced cold-start time of the Node client by roughly 38% through lazy-loading the transport layer.",
    ],
    snippets: [
      {
        label: "Stream a large query",
        language: "ts",
        code: `import { createClient } from "@harbor/sdk";

const client = createClient({ apiKey: process.env.HARBOR_API_KEY! });

for await (const row of client.query("select * from events").stream()) {
  console.log(row.id, row.createdAt);
}`,
      },
      {
        label: "Typed webhook handler",
        language: "ts",
        code: `import type { WebhookEvent } from "@harbor/sdk/webhooks";

export function handle(event: WebhookEvent) {
  switch (event.type) {
    case "invoice.paid":
      return markPaid(event.data.invoiceId);
    case "invoice.failed":
      return notify(event.data.customerId);
  }
}`,
      },
    ],
  },
  {
    version: "3.1.2",
    date: "2025-05-27",
    title: "Patch: pagination and timeout fixes",
    summary:
      "A small maintenance release that resolves two long-standing issues reported by the community.",
    tags: ["fix"],
    changes: [
      "Fixed cursor pagination skipping the final page when the page size evenly divided the total count.",
      "Request timeouts now abort the underlying socket instead of leaving it open until the OS closes it.",
      "Corrected the return type of client.batch() when called with an empty array.",
    ],
  },
  {
    version: "3.1.0",
    date: "2025-05-06",
    title: "Edge runtime support",
    summary:
      "The SDK now runs unmodified on Cloudflare Workers, Vercel Edge and Deno, with a smaller bundle and no Node-only dependencies.",
    tags: ["feature", "improvement", "security"],
    changes: [
      "New fetch-based transport selected automatically when Node built-ins are unavailable.",
      "Bundle size reduced from 41 kB to 17 kB gzipped.",
      "API keys are now redacted from error messages and stack traces by default.",
      "Added an opt-in requestId option for correlating client logs with server traces.",
    ],
    snippets: [
      {
        label: "Use in an edge route",
        language: "ts",
        code: `import { createClient } from "@harbor/sdk";

export const runtime = "edge";

export async function GET() {
  const client = createClient({ apiKey: process.env.HARBOR_API_KEY! });
  const projects = await client.projects.list({ limit: 10 });
  return Response.json(projects);
}`,
      },
    ],
  },
  {
    version: "3.0.0",
    date: "2025-03-18",
    title: "Harbor SDK 3.0",
    summary:
      "A ground-up rewrite with first-class ESM, a unified error model and a simpler configuration object. Review the migration notes before upgrading.",
    tags: ["breaking", "feature"],
    changes: [
      "Dropped support for Node 16 and 18. Node 20 or newer is now required.",
      "Replaced the callback API with promises everywhere. Callback overloads have been removed.",
      "All errors now extend HarborError and expose a stable code property.",
      "Renamed new Harbor(options) to createClient(options). The class export is removed.",
    ],
    snippets: [
      {
        label: "Upgrade the package",
        language: "bash",
        code: `npm install @harbor/sdk@^3.0.0
npx harbor-codemod v3 ./src`,
      },
      {
        label: "Migrate client construction",
        language: "diff",
        code: `- import Harbor from "@harbor/sdk";
- const client = new Harbor({ key: process.env.HARBOR_API_KEY });
+ import { createClient } from "@harbor/sdk";
+ const client = createClient({ apiKey: process.env.HARBOR_API_KEY! });`,
      },
    ],
  },
  {
    version: "2.9.4",
    date: "2025-02-03",
    title: "Security hardening",
    summary:
      "Recommended for everyone still on the 2.x line. Backported from the 3.0 development branch.",
    tags: ["security", "fix"],
    changes: [
      "Upgraded the bundled HTTP parser to address a request smuggling advisory (HRB-2025-004).",
      "Webhook signature verification now uses a constant-time comparison.",
      "Fixed an unhandled rejection when the server closed the connection mid-response.",
    ],
    snippets: [
      {
        label: "Verify a webhook signature",
        language: "ts",
        code: `import { verifySignature } from "@harbor/sdk/webhooks";

const ok = verifySignature({
  payload: rawBody,
  header: req.headers.get("harbor-signature") ?? "",
  secret: process.env.HARBOR_WEBHOOK_SECRET!,
});`,
      },
    ],
  },
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function CodeSnippet({ snippet, id }: { snippet: Snippet; id: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      toast.success("Copied to clipboard", { description: snippet.label });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy", {
        description: "Clipboard access is unavailable. Select the code and copy it manually.",
      });
    }
  };

  return (
    <figure className="overflow-hidden rounded-lg border bg-muted/40" aria-labelledby={id}>
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/60 py-1.5 pr-1.5 pl-3">
        <div className="flex min-w-0 items-center gap-2">
          <span id={id} className="truncate text-xs font-medium">
            {snippet.label}
          </span>
          <span className="rounded bg-background px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
            {snippet.language}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy code: ${snippet.label}`}
        >
          {copied ? <Check className="text-emerald-600" aria-hidden="true" /> : <Copy aria-hidden="true" />}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </figcaption>
      <pre
        className="overflow-x-auto p-3 text-[13px] leading-relaxed focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        tabIndex={0}
        aria-label={`${snippet.label} (${snippet.language})`}
      >
        <code className="font-mono">{snippet.code}</code>
      </pre>
    </figure>
  );
}

function TagBadge({ tag }: { tag: Tag }) {
  const meta = TAG_META[tag];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn("gap-1", meta.badge)}>
      <Icon aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

function ReleaseEntry({ release }: { release: Release }) {
  const baseId = `release-${release.version.replace(/\./g, "-")}`;
  const primaryTag = release.tags.includes("breaking") ? "breaking" : release.tags[0];

  return (
    <li className="relative pl-8 sm:pl-10">
      <span
        aria-hidden="true"
        className="absolute top-1.5 left-0 flex size-6 items-center justify-center rounded-full border bg-background sm:size-7"
      >
        <span className={cn("size-2.5 rounded-full", TAG_META[primaryTag].dot)} />
      </span>

      <article aria-labelledby={`${baseId}-title`} className="pb-12">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="font-mono text-xl font-semibold tracking-tight">
              <span className="sr-only">Version </span>v{release.version}
            </h2>
            {release.latest && (
              <Badge>
                <Rocket aria-hidden="true" />
                Latest
              </Badge>
            )}
            <time dateTime={release.date} className="text-sm text-muted-foreground">
              {formatDate(release.date)}
            </time>
          </div>
          <p id={`${baseId}-title`} className="text-base font-medium sm:text-lg">
            {release.title}
          </p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {release.tags.map((tag) => (
              <li key={tag}>
                <TagBadge tag={tag} />
              </li>
            ))}
          </ul>
        </header>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {release.summary}
        </p>

        <ul className="mt-4 space-y-2 text-sm leading-relaxed">
          {release.changes.map((change) => (
            <li key={change} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50"
              />
              <span>{change}</span>
            </li>
          ))}
        </ul>

        {release.snippets && release.snippets.length > 0 && (
          <div className="mt-5 space-y-3">
            {release.snippets.map((snippet, i) => (
              <CodeSnippet key={snippet.label} snippet={snippet} id={`${baseId}-snippet-${i}`} />
            ))}
          </div>
        )}
      </article>
    </li>
  );
}

export default function ChangelogPage() {
  const [activeTags, setActiveTags] = React.useState<Tag[]>([]);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELEASES.filter((r) => {
      const tagMatch = activeTags.length === 0 || activeTags.some((t) => r.tags.includes(t));
      if (!tagMatch) return false;
      if (!q) return true;
      const haystack = [r.version, r.title, r.summary, ...r.changes].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [activeTags, query]);

  const hasFilters = activeTags.length > 0 || query.trim().length > 0;

  const clearFilters = () => {
    setActiveTags([]);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#releases"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to releases
      </a>

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 space-y-3">
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            @harbor/sdk
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">Changelog</h1>
          <p className="max-w-prose text-muted-foreground">
            New features, improvements and fixes shipped in every release of the Harbor SDK.
            Breaking changes are always called out and come with a migration snippet.
          </p>
        </header>

        <section aria-label="Filter releases" className="mb-10 space-y-3">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search versions and changes"
              aria-label="Search releases"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              spacing={2}
              value={activeTags}
              onValueChange={(v) => setActiveTags(v as Tag[])}
              aria-label="Filter by tag"
              className="flex-wrap"
            >
              {TAG_ORDER.map((tag) => {
                const Icon = TAG_META[tag].icon;
                return (
                  <ToggleGroupItem key={tag} value={tag} aria-label={`Filter by ${TAG_META[tag].label}`}>
                    <Icon aria-hidden="true" />
                    {TAG_META[tag].label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            {hasFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <X aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            Showing {filtered.length} of {RELEASES.length} releases
          </p>
        </section>

        <section id="releases" aria-label="Releases" className="scroll-mt-6">
          {filtered.length > 0 ? (
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute top-3 bottom-0 left-3 w-px -translate-x-1/2 bg-border sm:left-3.5"
              />
              <ol className="relative">
                {filtered.map((release) => (
                  <ReleaseEntry key={release.version} release={release} />
                ))}
              </ol>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <p className="font-medium">No releases match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or remove a tag filter.
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
```