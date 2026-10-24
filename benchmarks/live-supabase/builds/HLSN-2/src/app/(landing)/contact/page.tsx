import { notFound } from "next/navigation";

/** Not part of this app: the route answers 404. */
export default function Gone() {
  notFound();
}
