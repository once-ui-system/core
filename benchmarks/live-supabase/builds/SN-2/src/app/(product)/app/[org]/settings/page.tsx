import { orgPath } from "@/lib/orgs/types";
import { baseURL, product } from "@/resources";
import { Heading, Meta, Schema } from "@once-ui-system/core";
import SettingsClient from "./client";

type PageProps = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.settings.title,
    description: product.settings.description,
    baseURL: baseURL,
    path: orgPath(org, "/settings"),
    image: product.settings.image,
    robots: product.settings.robots,
    alternates: product.settings.alternates,
  });
}

export default async function Settings({ params }: PageProps) {
  const { org } = await params;

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.settings.title}
        description={product.settings.description}
        path={orgPath(org, "/settings")}
      />
      <Heading paddingLeft="16" variant="display-strong-s">
        Settings
      </Heading>
      <SettingsClient org={org} />
    </>
  );
}
