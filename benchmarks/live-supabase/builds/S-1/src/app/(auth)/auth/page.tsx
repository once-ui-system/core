import { Meta, Schema } from "@once-ui-system/core";

import { baseURL, auth } from "@/resources";
import { AuthForms } from "./components/AuthForms";
export async function generateMetadata() {
  return Meta.generate({
    title: auth.auth.title,
    description: auth.auth.description,
    baseURL: baseURL,
    path: auth.auth.path,
    canonical: auth.auth.canonical,
    image: auth.auth.image,
    robots: auth.auth.robots,
    alternates: auth.auth.alternates,
  });
}

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ state?: string | string[] }>;
}) {
  const { state } = await searchParams;
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={auth.auth.title}
        description={auth.auth.description}
        path={auth.auth.path}
      />
      <AuthForms state={Array.isArray(state) ? state[0] : state} />
    </>
  );
}
