import { Meta, Schema } from "@once-ui-system/core";
import { baseURL, product } from "@/resources";
import { orgPath } from "@/lib/orgs/types";
import MembersClient from "./client";

type PageProps = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.members.title,
    description: product.members.description,
    baseURL: baseURL,
    path: orgPath(org, "/members"),
    image: product.members.image,
    robots: product.members.robots,
    alternates: product.members.alternates,
  });
}

export default async function Members({ params }: PageProps) {
  const { org } = await params;
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.members.title}
        description={product.members.description}
        path={orgPath(org, "/members")}
      />
      <MembersClient org={org} />
    </>
  );
}
