import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">
          We couldn&apos;t find that home
        </h1>
        <p className="mt-2 text-stone-600">
          It may have been sold or the link may be wrong.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Back to search
        </Link>
      </main>
    </div>
  );
}
