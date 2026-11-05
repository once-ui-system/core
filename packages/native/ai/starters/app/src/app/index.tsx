import { Redirect } from "expo-router";
import { nav, tabHref } from "../resources/app";

export default function Index() {
  return <Redirect href={tabHref(nav[0]) as never} />;
}
