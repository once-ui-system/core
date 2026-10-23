import { BrandClient } from "./client";
import { Meta, Schema } from "@once-ui-system/core";
import { baseURL, landing } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    baseURL: baseURL,
    title: landing.brand.title,
    description: landing.brand.description,
    image: landing.brand.image,
    path: landing.brand.path,
  });
}

export default function Brand() {
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.brand.title}
        description={landing.brand.description}
        path={landing.brand.path}
      />
      <BrandClient/>
    </>
  );
}