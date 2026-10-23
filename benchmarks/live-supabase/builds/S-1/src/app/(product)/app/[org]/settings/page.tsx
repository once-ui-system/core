import { orgPath } from "@/lib/orgs/types";
import { requireOrg } from "@/lib/orgs/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";
import { Meta, Schema } from "@once-ui-system/core";
import { notFound, redirect } from "next/navigation";
import SettingsClient from "./client";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.settings.title,
    description: product.settings.description,
    baseURL: baseURL,
    path: orgPath(org, "/settings"),
    image: product.settings.image,
    robots: "noindex,nofollow",
  });
}

export default async function Settings({ params }: PageProps) {
  const { org } = await params;

  let name = "Demo workspace";
  let plan: "free" | "team" = "free";
  let canManage = true;

  if (isSupabaseConfigured()) {
    const guard = await requireOrg(org);
    if (!guard.ok) {
      if (guard.status === 401) redirect("/auth");
      notFound();
    }
    name = guard.org.name;
    plan = guard.org.plan;
    canManage = guard.role === "owner" || guard.role === "admin";
  }

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.settings.title}
        description={product.settings.description}
        path={orgPath(org, "/settings")}
      />
      <SettingsClient
        org={org}
        demo={!isSupabaseConfigured()}
        name={name}
        plan={plan}
        canManage={canManage}
      />
    </>
  );
}
