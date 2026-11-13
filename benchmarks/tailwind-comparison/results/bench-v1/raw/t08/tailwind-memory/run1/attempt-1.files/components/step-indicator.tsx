import { Check } from "lucide-react";
import { steps } from "@/lib/data";

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex items-start">
        {steps.map((s, i) => {
          const done = s.id < current;
          const active = s.id === current;
          return (
            <li
              key={s.id}
              aria-current={active ? "step" : undefined}
              className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold ${
                    done
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : active
                        ? "border-indigo-600 bg-white text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600"
                  }`}
                >
                  {done ? <Check className="size-4" aria-hidden="true" /> : s.id}
                </span>
                <span className="text-center sm:text-left">
                  <span
                    className={`block text-xs font-medium sm:text-sm ${
                      active ? "text-slate-900" : "text-slate-600"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="hidden text-xs text-slate-600 lg:block">{s.hint}</span>
                  <span className="sr-only">
                    {done ? " (completed)" : active ? " (current step)" : " (upcoming)"}
                  </span>
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-2 mt-[18px] h-0.5 flex-1 self-start sm:mx-4 sm:mt-[17px] ${
                    done ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
