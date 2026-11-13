import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CalendarIcon, MailIcon, ShieldIcon } from "lucide-react";

import { MemberAvatar } from "@/components/member-avatar";
import { RoleBadge, StatusBadge } from "@/components/member-badges";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  MEMBERS,
  ROLE_DESCRIPTIONS,
  formatJoined,
  getActivity,
  getMember,
} from "@/lib/data";
import { ActivityIcon } from "lucide-react";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return MEMBERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Team · Lumen` : "Member not found · Lumen" };
}

export default async function MemberPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Team</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{member.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2.5">
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" />
              Back to team
            </Link>
          </Button>
        </div>
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <MemberAvatar name={member.name} size="lg" className="size-16 text-xl" />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{member.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={member.role} />
            <StatusBadge status={member.status} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Account details in the Acme Labs workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium break-words">{member.email}</dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <ShieldIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="flex flex-col gap-1">
                    <span className="font-medium">{member.role}</span>
                    <span className="text-muted-foreground">{ROLE_DESCRIPTIONS[member.role]}</span>
                  </dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <span
                  className="mt-1.5 inline-block size-2 shrink-0 rounded-full bg-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium">{member.status}</dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="font-medium">
                    {member.joined ? (
                      <time dateTime={member.joined}>{formatJoined(member.joined)}</time>
                    ) : (
                      "Invitation pending"
                    )}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest actions by {member.name.split(" ")[0]} in Lumen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <Empty className="border p-6 md:p-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ActivityIcon />
                  </EmptyMedia>
                  <EmptyTitle>No activity yet</EmptyTitle>
                  <EmptyDescription>
                    {member.status === "Invited"
                      ? `Activity will show up here once ${member.name.split(" ")[0]} accepts the invitation.`
                      : "Nothing to show for this member yet."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ol className="flex flex-col">
                {activity.map((item, index) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      {index < activity.length - 1 ? (
                        <span className="w-px flex-1 bg-border" />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5 pb-5">
                      <p className="text-sm">
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium">{item.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.when}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
