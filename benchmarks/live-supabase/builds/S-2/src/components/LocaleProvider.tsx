"use client";

import { createContext, useContext } from "react";
import { defaultLocale } from "@/lib/i18n";

const LocaleContext = createContext(defaultLocale);

/** Hands the request's locale, resolved by the root layout, to client components. */
export function LocaleProvider({
  locale,
  children,
}: { locale: string; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** The locale the page renders in. Server components call `getLocale()` instead. */
export function useLocale(): string {
  return useContext(LocaleContext);
}
