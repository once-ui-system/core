import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { nextSteps, user } from "@/lib/data";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready.",
};

export default function WelcomePage() {
  const firstName = user.name.split(" ")[0];
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            You&apos;re all set, {firstName}!
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Your Lumen workspace is ready. Here&apos;s a short checklist to get real value from it
            in your first week.
          </p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-600">
            Next steps
          </h2>
          <ol className="mt-3 space-y-3">
            {nextSteps.map((s) => (
              <li
                key={s.title}
                className="flex gap-3 rounded-xl border border-slate-200 p-4"
              >
                <Circle className="mt-0.5 size-5 shrink-0 text-indigo-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{s.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to onboarding
            </Link>
            <p className="text-sm text-slate-600">
              Signed in as {user.email} · {user.role}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
