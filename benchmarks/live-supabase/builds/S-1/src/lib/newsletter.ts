"use client";

import { useToast } from "@once-ui-system/core";
import { useState } from "react";

/**
 * Newsletter capture through an Aveiro embed form. Set
 * NEXT_PUBLIC_AVEIRO_SITE_ID to your Aveiro site's ID (Audience → Embed) and
 * addresses are posted to Aveiro's public subscribe endpoint; it needs no
 * secret, so a surface using it still declares no slices. Without the
 * variable the form says so instead of pretending to subscribe anyone.
 */
const AVEIRO_SUBSCRIBE_URL = "https://www.aveiro.app/api/email/subscribe";
const siteId = process.env.NEXT_PUBLIC_AVEIRO_SITE_ID;

/** What the form tells the visitor. A surface with a labels file passes its own language's. */
export type NewsletterMessages = {
  notConfigured: string;
  invalidEmail: string;
  failed: string;
  subscribed: string;
};

const ENGLISH: NewsletterMessages = {
  notConfigured: "The newsletter is not configured yet.",
  invalidEmail: "Enter a valid email address.",
  failed: "Could not subscribe. Try again later.",
  subscribed: "Thanks, you're on the list.",
};

export function useNewsletter(messages: NewsletterMessages = ENGLISH) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const { addToast } = useToast();

  const subscribe = async () => {
    if (!siteId) {
      addToast({ variant: "danger", message: messages.notConfigured });
      return;
    }
    if (!email.includes("@")) {
      addToast({ variant: "danger", message: messages.invalidEmail });
      return;
    }
    setPending(true);
    try {
      const response = await fetch(AVEIRO_SUBSCRIBE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, email }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? messages.failed);
      }
      addToast({ variant: "success", message: messages.subscribed });
      setEmail("");
    } catch (error) {
      addToast({
        variant: "danger",
        message: error instanceof Error ? error.message : messages.failed,
      });
    } finally {
      setPending(false);
    }
  };

  return { email, setEmail, pending, subscribe };
}
