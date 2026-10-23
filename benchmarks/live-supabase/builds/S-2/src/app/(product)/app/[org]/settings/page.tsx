import { baseURL, product } from "@/resources";
import { Schema, Meta } from "@once-ui-system/core";
import { orgPath } from "@/lib/orgs/types";
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
      <SettingsClient/>
    </>
  );
}
