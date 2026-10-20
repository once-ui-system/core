import { redirect } from "next/navigation";
import { navLinks } from "../resources/app";

export default function Index() {
  redirect(navLinks[0].href);
}
