"use client";

import { useEffect, useRef } from "react";
import styles from "./Banner.module.scss";
import { IconButton } from "./IconButton";

/** localStorage key holding the dismissed banners, space-separated. ThemeInit
 *  copies it onto `<html data-banner-dismissed>` before the first paint. */
export const BANNER_DISMISSED_KEY = "once-ui-banners-dismissed";

function readDismissed(): string[] {
  try {
    return (localStorage.getItem(BANNER_DISMISSED_KEY) ?? "").split(" ").filter(Boolean);
  } catch {
    return [];
  }
}

function applyDismissed(list: string[]) {
  document.documentElement.setAttribute("data-banner-dismissed", list.join(" "));
}

interface BannerCloseProps {
  dismissKey?: string;
  label: string;
}

/**
 * The Banner's dismiss button: the one client piece, so Banner itself stays a
 * server component. With a `dismissKey` the dismissal is remembered; without
 * one the banner only hides until the next page load.
 */
export function BannerClose({ dismissKey, label }: BannerCloseProps) {
  const ref = useRef<HTMLButtonElement>(null);

  // Pages rendered without ThemeInit (or on the client only) learn about an
  // earlier dismissal here, after mount.
  useEffect(() => {
    if (!dismissKey) return;
    const list = readDismissed();
    if (list.includes(dismissKey)) applyDismissed(list);
  }, [dismissKey]);

  const dismiss = () => {
    if (dismissKey) {
      const list = Array.from(new Set([...readDismissed(), dismissKey]));
      try {
        localStorage.setItem(BANNER_DISMISSED_KEY, list.join(" "));
      } catch {}
      applyDismissed(list);
    } else {
      const banner = ref.current?.closest<HTMLElement>("[data-banner]");
      if (banner) banner.style.display = "none";
    }
  };

  return (
    <IconButton
      ref={ref}
      className={styles.close}
      icon="close"
      size="s"
      variant="ghost"
      aria-label={label}
      onClick={dismiss}
    />
  );
}
