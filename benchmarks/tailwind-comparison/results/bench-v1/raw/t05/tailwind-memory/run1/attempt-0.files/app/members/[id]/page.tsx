import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Mail, ShieldCheck } from "lucide-react";
import { formatDate, getActivity, getMember, members, ROLE_DESCRIPTIONS } from "@/lib/data";
import { Avatar } from "@/components/avatar";
import { RoleBadge, StatusBadge } from "@/components/badges";

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }));
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 sm:px-6">
          <span
            aria-hidden="true"
            className="inline-flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
          >
            L
          </span>
          <span className="text-base font-semibold">Lumen</span>
          <span className="text-sm text-slate-500">/ Acme Labs</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to team
        </Link>

        <section
          aria-labelledby="profile-heading"
          className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar name={member.name} size="lg" />
            <div className="min-w-0">
              <h1 id="profile-heading" className="text-2xl font-semibold tracking-tight">
                {member.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${member.email}`}
                  className="truncate hover:text-indigo-700 hover:underline"
                >
                  {member.email}
                </a>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <RoleBadge role={member.role} />
                <StatusBadge status={member.status} />
              </div>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Role
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {member.role}
                <span className="block text-slate-600">{ROLE_DESCRIPTIONS[member.role]}</span>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Calendar className="size-4" aria-hidden="true" />
                Joined
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {member.joined ? (
                  <time dateTime={member.joined}>{formatDate(member.joined)}</time>
                ) : (
                  "Invitation pending"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="activity-heading"
          className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 id="activity-heading" className="text-lg font-semibold">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              {member.status === "Invited"
                ? `${member.name} hasn't accepted the invitation yet, so there's no activity to show.`
                : "No recent activity."}
            </p>
          ) : (
            <ol className="mt-4 divide-y divide-slate-100">
              {activity.map((a) => (
                <li key={a.id} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="text-sm text-slate-900">{a.text}</span>
                  <span className="shrink-0 text-sm text-slate-500">{a.when}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
