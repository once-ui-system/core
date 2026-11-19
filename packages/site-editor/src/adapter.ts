// Where a site lives. The editor talks only to this interface, so a product
// keeps its own tables, files or MDX, and the editor works the same on all.

import type { Page, PageEntry, SiteStyle } from "./model.js";

export interface SiteAdapter {
  listPages(): Promise<PageEntry[]>;
  loadPage(id: string): Promise<Page>;
  savePage(id: string, page: Page): Promise<void>;
  loadStyle(): Promise<SiteStyle>;
  saveStyle(style: SiteStyle): Promise<void>;
  /** Present = the Pages panel can add pages. */
  createPage?(input: { title: string; slug: string }): Promise<PageEntry>;
  /** Present = the Pages panel can rename pages. */
  updatePage?(id: string, input: { title: string; slug: string }): Promise<PageEntry>;
  /** Present = the Pages panel can remove pages (never the home page). */
  removePage?(id: string): Promise<void>;
  /**
   * Present = saves are drafts and the primary action is Publish. Absent =
   * saves go live and the primary action is Open site.
   */
  publish?(): Promise<void>;
  /** Whether anything saved has not been published yet. */
  hasUnpublished?(): Promise<boolean>;
  /** The preview iframe's address for a page. Same origin as the editor. */
  previewUrl(pageId: string, lang?: string): string;
  /** The live site, for Open site. */
  siteUrl?: string;
}

/** What a local site holds: everything, in one record. */
export interface LocalSite {
  pages: PageEntry[];
  content: Record<string, Page>;
  style: SiteStyle;
  /** What was last published: the same shape, frozen at Publish. */
  published?: { pages: PageEntry[]; content: Record<string, Page>; style: SiteStyle };
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const blankSite = (): LocalSite => ({
  pages: [{ id: "home", title: "Home", slug: "", home: true }],
  content: { home: { sections: [] } },
  style: { config: { brand: "blue", accent: "indigo", neutral: "gray", theme: "light" } },
});

/**
 * A site kept in the browser's localStorage, so a demo or a template runs with
 * no backend. Every method is async like a real store's, and the key is per
 * site, so several can sit side by side.
 */
export function createLocalAdapter({
  key,
  previewPath,
  seed = blankSite,
  siteUrl,
}: {
  key: string;
  /** The preview route; the page id and language go on its query string. */
  previewPath: string;
  /** The site a first visit starts from. */
  seed?: () => LocalSite;
  siteUrl?: string;
}): SiteAdapter & { read(): LocalSite; reset(): void } {
  const storageKey = `once-ui.site-editor.${key}`;

  const read = (): LocalSite => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as LocalSite;
    } catch {
      // Blocked or unreadable storage: start from the seed rather than fail.
    }
    const site = seed();
    write(site);
    return site;
  };

  const write = (site: LocalSite) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(site));
      // Other tabs (and the preview frame) hear about it.
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
    } catch {
      // Full or blocked: the editor keeps its state, and says the save failed.
      throw new Error("Could not save to this browser's storage.");
    }
  };

  const update = (change: (site: LocalSite) => void) => {
    const site = read();
    change(site);
    write(site);
    return site;
  };

  return {
    read,
    reset: () => write(seed()),
    async listPages() {
      return read().pages;
    },
    async loadPage(id) {
      return read().content[id] ?? { sections: [] };
    },
    async savePage(id, page) {
      update((site) => {
        site.content[id] = page;
      });
    },
    async loadStyle() {
      return read().style;
    },
    async saveStyle(style) {
      update((site) => {
        site.style = style;
      });
    },
    async createPage({ title, slug }) {
      let entry: PageEntry = { id: "", title, slug };
      update((site) => {
        const base = slugify(slug || title) || "page";
        let unique = base;
        for (let n = 2; site.pages.some((page) => page.slug === unique); n += 1) {
          unique = `${base}-${n}`;
        }
        entry = { id: `p-${unique}`, title: title || unique, slug: unique };
        site.pages.push(entry);
        site.content[entry.id] = { sections: [] };
      });
      return entry;
    },
    async updatePage(id, { title, slug }) {
      let entry: PageEntry | undefined;
      update((site) => {
        const page = site.pages.find((p) => p.id === id);
        if (!page) return;
        page.title = title;
        if (!page.home) page.slug = slugify(slug) || page.slug;
        entry = { ...page };
      });
      if (!entry) throw new Error(`No page ${id}`);
      return entry;
    },
    async removePage(id) {
      update((site) => {
        const page = site.pages.find((p) => p.id === id);
        if (!page || page.home) return;
        site.pages = site.pages.filter((p) => p.id !== id);
        delete site.content[id];
      });
    },
    async publish() {
      update((site) => {
        site.published = structuredClone({
          pages: site.pages,
          content: site.content,
          style: site.style,
        });
      });
    },
    async hasUnpublished() {
      const site = read();
      if (!site.published) return true;
      return (
        JSON.stringify({ pages: site.pages, content: site.content, style: site.style }) !==
        JSON.stringify(site.published)
      );
    },
    previewUrl(pageId, lang) {
      const query = new URLSearchParams({ page: pageId });
      if (lang) query.set("lang", lang);
      return `${previewPath}?${query.toString()}`;
    },
    siteUrl,
  };
}
