Voided pilot runs (METHODOLOGY.md §7: command execution voids the run). The subagent used
a shell command (sed/python) during a repair round to patch its own output file. No
information came from outside the sandbox, but a shell patch replaces re-writing the file,
which would understate output tokens. Regenerated with fresh subagents under the same prompt.
Also voided: three render-gate results (t06 A runs 1-3, attempt 0) caused by gate bugs fixed
before regating (Next.js prefetch 404s counted as errors; SSR readiness probe).
