import { orgPath } from "@/lib/orgs/types";
import { baseURL, product } from "@/resources";
import { Heading, Meta, Schema } from "@once-ui-system/core";
import TableClient from "./components/TableClient";

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
      <Heading paddingLeft="16" variant="display-strong-s">
        Members
      </Heading>
      <TableClient />
    </>
  );
}
