import { AppHeader } from "@/components/AppHeader";
import { Schedule } from "@/components/Schedule";

export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <AppHeader />
      <Schedule />
    </>
  );
}
