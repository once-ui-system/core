"use client";

import { AppFrame } from "./AppFrame";
import { RoomPlan } from "./RoomPlan";
import { SidePanel } from "./SidePanel";

export function PlanView() {
  return (
    <AppFrame>
      <h1 className="sw-vh">Seating plan</h1>
      <div className="sw-main">
        <RoomPlan />
        <SidePanel />
      </div>
    </AppFrame>
  );
}
