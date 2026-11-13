import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MailIcon,
  ShieldIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { RoleBadge, StatusBadge } from "@/components/team/member-badges"
import {
  PRODUCT_NAME,
  ROLE_DESCRIPTIONS,
  formatDate,
  getActivity,
  getInitials,
  getMember,
  members,
} from "@/lib/data"

type PageProps = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const member = getMember(id)
  return {
    title: member
      ? `${member.name} · Team · ${PRODUCT_NAME}`
      : `Member not found · ${PRODUCT_NAME}`,
  }
}

export default async function MemberPage({ params }: PageProps) {
  const { id } = await params
  const member = getMember(id)
  if (!member) notFound()

  const activity = getActivity(member.id)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
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

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-16">
          <AvatarFallback aria-hidden="true" className="text-xl">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {member.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={member.role} />
            <StatusBadge status={member.status} />
            <span className="break-all text-sm text-muted-foreground">
              {member.email}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Account details for this {PRODUCT_NAME} workspace member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MailIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium break-all">{member.email}</dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <ShieldIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="flex flex-col items-start gap-1">
                    <RoleBadge role={member.role} />
                    <span className="text-muted-foreground">
                      {ROLE_DESCRIPTIONS[member.role]}
                    </span>
                  </dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <ClockIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={member.status} />
                  </dd>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <CalendarIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="font-medium">
                    {member.joined
                      ? formatDate(member.joined)
                      : "Hasn’t accepted the invite yet"}
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              The latest actions {member.name} took in {PRODUCT_NAME}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClockIcon />
                  </EmptyMedia>
                  <EmptyTitle>No activity yet</EmptyTitle>
                  <EmptyDescription>
                    Activity will show up here once {member.name} joins and
                    starts working in the workspace.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ol className="flex flex-col">
                {activity.map((item, index) => (
                  <li key={item.id} className="flex flex-col gap-4">
                    {index > 0 ? <Separator /> : null}
                    <div
                      className={
                        index > 0
                          ? "flex flex-col gap-1 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                          : "flex flex-col gap-1 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                      }
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="text-sm font-medium">{item.summary}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                      <time
                        dateTime={item.date}
                        className="shrink-0 text-sm text-muted-foreground"
                      >
                        {formatDate(item.date)}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeftIcon data-icon="inline-start" />
            Back to team
          </Link>
        </Button>
      </div>
    </main>
  )
}
