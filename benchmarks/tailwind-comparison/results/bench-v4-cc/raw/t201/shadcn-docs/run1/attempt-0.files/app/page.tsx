import { AppHeader } from "@/components/pawpoint/app-header";
import { ScheduleView } from "@/components/pawpoint/schedule-view";

export default function Page() {
  return (
    <>
      <AppHeader />
      <main id="main">
        <ScheduleView />
      </main>
    </>
  );
}
