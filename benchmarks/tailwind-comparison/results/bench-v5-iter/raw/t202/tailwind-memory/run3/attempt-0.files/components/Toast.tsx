"use client";

import { Undo2, X } from "lucide-react";
import { usePlan } from "./PlanProvider";

export function Toast() {
  const { note, canUndo, undo, dismissNote } = usePlan();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden"
    >
      {note ? (
        <div className="pointer-events-auto flex max-w-xl items-center gap-3 rounded-xl bg-stone-900 py-2 pl-4 pr-2 text-sm text-white shadow-lg">
          <span>{note}</span>
          {canUndo ? (
            <button
              type="button"
              onClick={undo}
              className="flex min-h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 font-medium hover:bg-white/20"
            >
              <Undo2 size={15} aria-hidden="true" />
              Undo
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismissNote}
            aria-label="Dismiss message"
            className="grid size-9 place-items-center rounded-lg hover:bg-white/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
