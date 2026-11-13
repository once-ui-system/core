import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Schedule } from "@/components/Schedule";

export const metadata: Metadata = { title: "Today's schedule" };

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Schedule />
      </main>
    </>
  );
}
