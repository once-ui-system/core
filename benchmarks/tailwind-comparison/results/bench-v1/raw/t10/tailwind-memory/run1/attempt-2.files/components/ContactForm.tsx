"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AGENT } from "@/lib/data";

type Values = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const inputCls =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700";

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please enter your name.";
  if (!v.email.trim()) e.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "Enter a valid email address, like name@example.com.";
  if (!v.message.trim()) e.message = "Please write a message for the agent.";
  return e;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    message: `Hello ${AGENT.name.split(" ")[0]}, I'd like to arrange a viewing of "${homeTitle}".`,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const e = validate(values);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSent(true);
      return;
    }
    const first = (["name", "email", "message"] as const).find((k) => e[k]);
    if (first) document.getElementById(`c-${first}`)?.focus();
  }

  function update(key: keyof Values, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (errors[key]) setErrors({ ...errors, [key]: validate(next)[key] });
  }

  if (sent) {
    return (
      <div
        role="status"
        className="rounded-xl border border-teal-200 bg-teal-50 p-5"
      >
        <CheckCircle2 className="size-6 text-teal-700" aria-hidden="true" />
        <p className="mt-2 font-semibold text-teal-950">Message sent</p>
        <p className="mt-1 text-sm text-teal-900">
          Thanks, {values.name.trim()}. {AGENT.name} will reply to{" "}
          {values.email.trim()} shortly.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-3 text-sm font-medium text-teal-900 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="c-name"
          className="mb-1 block text-sm font-medium text-stone-800"
        >
          Name
        </label>
        <input
          id="c-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "c-name-err" : undefined}
          className={`${inputCls} ${errors.name ? "border-red-600" : "border-stone-300"}`}
        />
        {errors.name && (
          <p id="c-name-err" className="mt-1 text-sm text-red-700">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="c-email"
          className="mb-1 block text-sm font-medium text-stone-800"
        >
          Email
        </label>
        <input
          id="c-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "c-email-err" : undefined}
          className={`${inputCls} ${errors.email ? "border-red-600" : "border-stone-300"}`}
        />
        {errors.email && (
          <p id="c-email-err" className="mt-1 text-sm text-red-700">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="c-message"
          className="mb-1 block text-sm font-medium text-stone-800"
        >
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "c-message-err" : undefined}
          className={`${inputCls} ${errors.message ? "border-red-600" : "border-stone-300"}`}
        />
        {errors.message && (
          <p id="c-message-err" className="mt-1 text-sm text-red-700">
            {errors.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Contact {AGENT.name.split(" ")[0]}
      </button>
    </form>
  );
}
