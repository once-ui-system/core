"use client";

import { useEffect, useState } from "react";
import { type MascotDesign, parseMascotDesign } from "./design.js";
import { mascotIdentity } from "./mascotIdentities.js";

/*
 * A person's mascot, looked up by their Once UI username. The look a name
 * hatches, or the one its owner saved in the character designer, lives on
 * once-ui.com, so `<Mascot username="foxdev" />` shows the same character in
 * every app. Opt-in: nothing is fetched unless `username` is passed. Only the
 * look comes back (a `MascotDesign`), never account details, and it goes
 * through `parseMascotDesign` before it is drawn.
 */

/** Where skins are read from, unless `skinSource` says otherwise. */
export const MASCOT_SKIN_SOURCE = "https://once-ui.com/api/mascot/skin";

export interface MascotSkin {
  /** The name it was read for, cleaned. */
  name: string;
  /** The look to draw. */
  design: MascotDesign;
  /** A canonical mascot the name stands for, owned and customised by its holder. */
  identity?: string;
}

/** A username as it is stored: lowercase, no @, only a-z 0-9 - _. */
export const cleanMascotUsername = (raw: string) =>
  raw
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30);

const pending = new Map<string, Promise<MascotSkin | null>>();
const settled = new Map<string, MascotSkin | null>();

/**
 * Reads a username's skin once per page and source: later calls share the
 * first request. Resolves to null when the name has none or the source can't
 * be reached, so the caller falls back to the seed.
 */
export function fetchMascotSkin(
  username: string,
  source: string = MASCOT_SKIN_SOURCE,
): Promise<MascotSkin | null> {
  const name = cleanMascotUsername(username);
  if (!name) return Promise.resolve(null);
  const key = `${source}|${name}`;
  const known = pending.get(key);
  if (known) return known;
  const request = fetch(`${source.replace(/\/$/, "")}/${encodeURIComponent(name)}`, {
    credentials: "omit",
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((body: unknown): MascotSkin | null => {
      if (!body || typeof body !== "object") return null;
      const b = body as Record<string, unknown>;
      const identity =
        typeof b.identity === "string" ? mascotIdentity(b.identity)?.handle : undefined;
      return { name, design: parseMascotDesign(b.design), ...(identity ? { identity } : {}) };
    })
    .catch(() => null)
    .then((skin) => {
      settled.set(key, skin);
      return skin;
    });
  pending.set(key, request);
  return request;
}

/** How long a mascot waits, hidden, for its skin before it shows its seeded look. */
const WAIT_MS = 800;

/**
 * A username's skin for a component: `ready` turns true when it arrived, or
 * failed, or took longer than a moment, so the mascot never stays hidden.
 */
export function useMascotSkin(username: string | undefined, source: string = MASCOT_SKIN_SOURCE) {
  const name = username ? cleanMascotUsername(username) : "";
  const key = `${source}|${name}`;
  const [state, setState] = useState<{ key: string; skin: MascotSkin | null; ready: boolean }>(
    () => ({
      key,
      skin: settled.get(key) ?? null,
      ready: !name || settled.has(key),
    }),
  );
  const current =
    state.key === key ? state : { key, skin: settled.get(key) ?? null, ready: settled.has(key) };

  useEffect(() => {
    if (!name || settled.has(key)) return;
    let live = true;
    const timer = setTimeout(() => {
      if (live) setState((s) => (s.key === key && !s.ready ? { ...s, ready: true } : s));
    }, WAIT_MS);
    fetchMascotSkin(name, source).then((skin) => {
      if (live) setState({ key, skin, ready: true });
    });
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [key, name, source]);

  return { skin: current.skin, ready: !name || current.ready };
}
