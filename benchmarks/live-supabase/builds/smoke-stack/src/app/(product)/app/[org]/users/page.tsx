import { Heading, Meta, Schema } from "@once-ui-system/core";
import TableClient from "./components/TableClient";
import { baseURL, product } from "@/resources";
import { orgPath } from "@/lib/orgs/types";

type PageProps = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.users.title,
    description: product.users.description,
    baseURL: baseURL,
    path: orgPath(org, "/users"),
    image: product.users.image,
    robots: product.users.robots,
    alternates: product.users.alternates,
  });
}

export default async function Users({ params }: PageProps) {
  const { org } = await params;

  return (
    <>
    <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.users.title}
        description={product.users.description}
        path={orgPath(org, "/users")}
      />
        <Heading paddingLeft="16" variant="display-strong-s">
          Users
        </Heading>
        <TableClient />
    </>
  )
}
