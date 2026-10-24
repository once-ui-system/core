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

export default function Login() {
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={auth.auth.title}
        description={auth.auth.description}
        path={auth.auth.path}
      />
      <AuthForms />
    </>
  );
}
