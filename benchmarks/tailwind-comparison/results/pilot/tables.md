### Gate pass rate

| Arm | Runs | Accepted (≤3 repairs) | Passed first attempt | Failed | Pending | First-attempt failures by gate |
|---|---|---|---|---|---|---|
| A Once UI + harness | 9 | 9 | 7 | 0 | 0 | typecheck 2 |
| B Once UI, memory | 9 | 9 | 2 | 0 | 0 | typecheck 7 |
| C Tailwind + shadcn/ui + docs | 9 | 9 | 9 | 0 | 0 | – |
| D Tailwind, memory | 9 | 9 | 9 | 0 | 0 | – |

### Visible output tokens (proxy): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 3,526 (3,447–4,607) | 3,551 (3,551–5,068) | 3,802 (3,693–3,832) | 4,122 (4,087–4,289) |
| 6. Auth flow | 1,964 (1,957–1,989) | 3,995 (3,987–4,074) | 3,158 (2,918–3,284) | 5,465 (5,313–5,936) |
| 9. Data table page | 5,103 (4,749–6,325) | 8,970 (8,253–9,094) | 6,932 (6,814–7,150) | 6,838 (6,133–7,027) |

### Total tokens, net of Claude Code overhead (exact input + proxy output): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 110,820 (101,811–121,968) | 7,290 (7,276–17,478) | 20,668 (16,471–24,774) | 5,930 (5,805–6,349) |
| 6. Auth flow | 63,836 (63,671–69,346) | 18,352 (18,352–19,365) | 26,209 (19,756–26,560) | 10,212 (9,564–11,176) |
| 9. Data table page | 167,999 (126,345–179,316) | 50,326 (40,318–50,507) | 42,015 (36,414–76,837) | 12,648 (11,488–13,646) |

### Input tokens, net of overhead (exact): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 105,133 (97,205–117,441) | 3,739 (3,725–12,411) | 17,084 (12,778–21,051) | 1,808 (1,718–2,061) |
| 6. Auth flow | 61,872 (61,682–67,389) | 14,373 (14,365–15,300) | 23,051 (16,839–23,276) | 4,747 (4,251–5,240) |
| 9. Data table page | 162,896 (121,597–172,991) | 41,356 (32,066–41,413) | 35,319 (29,382–70,023) | 5,810 (5,355–6,619) |

### Code tokens, normalised (proxy o200k): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 2,321 (2,279–2,431) | 2,958 (2,860–3,007) | 3,041 (2,946–3,091) | 3,528 (3,506–3,666) |
| 6. Auth flow | 1,256 (1,231–1,296) | 1,650 (1,624–1,695) | 2,560 (2,361–2,642) | 4,665 (4,553–5,096) |
| 9. Data table page | 3,608 (3,280–3,809) | 4,281 (3,915–4,309) | 6,022 (6,002–6,378) | 6,632 (5,870–6,691) |

### Code tokens, normalised (proxy legacy-Claude): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 2,408 (2,369–2,526) | 3,131 (3,033–3,168) | 3,258 (3,160–3,319) | 3,916 (3,870–4,050) |
| 6. Auth flow | 1,324 (1,301–1,362) | 1,742 (1,716–1,786) | 2,768 (2,561–2,865) | 5,247 (5,078–5,708) |
| 9. Data table page | 3,777 (3,448–3,980) | 4,511 (4,116–4,519) | 6,386 (6,351–6,731) | 7,199 (6,365–7,268) |

### Code lines, normalised: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 339 (334–351) | 440 (417–451) | 397 (388–408) | 406 (397–422) |
| 6. Auth flow | 186 (185–194) | 240 (238–252) | 333 (308–337) | 507 (491–583) |
| 9. Data table page | 522 (457–553) | 623 (578–632) | 903 (850–909) | 776 (685–790) |

### Code bytes, normalised: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 10,630 (10,500–11,158) | 13,775 (13,289–14,255) | 13,726 (13,125–13,790) | 14,888 (14,629–15,535) |
| 6. Auth flow | 5,732 (5,587–6,003) | 7,197 (7,164–7,522) | 12,011 (11,013–12,380) | 19,115 (18,871–20,916) |
| 9. Data table page | 12,603 (12,305–13,729) | 18,501 (16,745–18,542) | 24,872 (24,524–25,742) | 25,822 (22,480–26,269) |

### API calls per run: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 8 (8–9) | 4 (4–5) | 4 (4–5) | 2 (2–2) |
| 6. Auth flow | 7 (7–7) | 6 (6–6) | 4 (4–4) | 2 (2–2) |
| 9. Data table page | 10 (9–10) | 7 (7–7) | 4 (4–5) | 4 (3–4) |

### Docs files read per run: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 8 (8–9) | 0 (0–0) | 0 (0–1) | 0 (0–0) |
| 6. Auth flow | 8 (8–8) | 0 (0–0) | 1 (1–1) | 0 (0–0) |
| 9. Data table page | 12 (11–12) | 0 (0–0) | 1 (1–2) | 0 (0–0) |

### Repair rounds to acceptance: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 0 (0–1) | 0 (0–1) | 0 (0–0) | 0 (0–0) |
| 6. Auth flow | 0 (0–0) | 1 (1–1) | 0 (0–0) | 0 (0–0) |
| 9. Data table page | 0 (0–1) | 1 (1–1) | 0 (0–0) | 0 (0–0) |

### Vendored component lines (C): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | – | – | 407 (407–407) | – |
| 6. Auth flow | – | – | 588 (582–602) | – |
| 9. Data table page | – | – | 919 (919–1,061) | – |

### Distinct library components imported: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 13 (13–13) | 7 (7–7) | 20 (20–21) | 0 (0–0) |
| 6. Auth flow | 11 (11–11) | 7 (7–8) | 18 (17–19) | 0 (0–0) |
| 9. Data table page | 13 (12–14) | 6 (6–7) | 27 (27–30) | 0 (0–0) |

### axe violation rules (1440 px): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 3. Pricing page | 0 (0–0) | 1 (1–2) | 0 (0–0) | 1 (1–1) |
| 6. Auth flow | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–1) |
| 9. Data table page | 0 (0–0) | 0 (0–0) | 0 (0–1) | 1 (1–1) |

### Reductions (per-task median reduction of X relative to Y; positive = X smaller)

| Pair | Metric | Tasks | Median | Range | Tasks where X < Y | 95% bootstrap CI |
|---|---|---|---|---|---|---|
| A vs C | Visible output tokens (proxy) | 3 | 26% | 7% to 38% | 3/3 | 7% to 38% |
| A vs C | Total tokens, net of Claude Code overhead (exact input + proxy output) | 3 | -300% | -436% to -144% | 0/3 | -436% to -144% |
| A vs C | Code tokens, normalised (proxy o200k) | 3 | 40% | 24% to 51% | 3/3 | 24% to 51% |
| A vs C | Code lines, normalised | 3 | 42% | 15% to 44% | 3/3 | 15% to 44% |
| A vs C | Code bytes, normalised | 3 | 49% | 23% to 52% | 3/3 | 23% to 52% |
| A vs D | Visible output tokens (proxy) | 3 | 25% | 14% to 64% | 3/3 | 14% to 64% |
| A vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 3 | -1228% | -1769% to -525% | 0/3 | -1769% to -525% |
| A vs D | Code tokens, normalised (proxy o200k) | 3 | 46% | 34% to 73% | 3/3 | 34% to 73% |
| A vs D | Code lines, normalised | 3 | 33% | 17% to 63% | 3/3 | 17% to 63% |
| A vs D | Code bytes, normalised | 3 | 51% | 29% to 70% | 3/3 | 29% to 70% |
| B vs C | Visible output tokens (proxy) | 3 | -27% | -29% to 7% | 1/3 | -29% to 7% |
| B vs C | Total tokens, net of Claude Code overhead (exact input + proxy output) | 3 | 30% | -20% to 65% | 2/3 | -20% to 65% |
| B vs C | Code tokens, normalised (proxy o200k) | 3 | 29% | 3% to 36% | 3/3 | 3% to 36% |
| B vs C | Code lines, normalised | 3 | 28% | -11% to 31% | 2/3 | -11% to 31% |
| B vs C | Code bytes, normalised | 3 | 26% | 0% to 40% | 2/3 | 0% to 40% |
| B vs D | Visible output tokens (proxy) | 3 | 14% | -31% to 27% | 2/3 | -31% to 27% |
| B vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 3 | -80% | -298% to -23% | 0/3 | -298% to -23% |
| B vs D | Code tokens, normalised (proxy o200k) | 3 | 35% | 16% to 65% | 3/3 | 16% to 65% |
| B vs D | Code lines, normalised | 3 | 20% | -8% to 53% | 2/3 | -8% to 53% |
| B vs D | Code bytes, normalised | 3 | 28% | 7% to 62% | 3/3 | 7% to 62% |
| A vs B | Visible output tokens (proxy) | 3 | 43% | 1% to 51% | 3/3 | 1% to 51% |
| A vs B | Total tokens, net of Claude Code overhead (exact input + proxy output) | 3 | -248% | -1420% to -234% | 0/3 | -1420% to -234% |
| A vs B | Code tokens, normalised (proxy o200k) | 3 | 22% | 16% to 24% | 3/3 | 16% to 24% |
| A vs B | Code lines, normalised | 3 | 22% | 16% to 23% | 3/3 | 16% to 23% |
| A vs B | Code bytes, normalised | 3 | 23% | 20% to 32% | 3/3 | 20% to 32% |
| C vs D | Visible output tokens (proxy) | 3 | 8% | -1% to 42% | 2/3 | -1% to 42% |
| C vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 3 | -232% | -249% to -157% | 0/3 | -249% to -157% |
| C vs D | Code tokens, normalised (proxy o200k) | 3 | 14% | 9% to 45% | 3/3 | 9% to 45% |
| C vs D | Code lines, normalised | 3 | 2% | -16% to 34% | 2/3 | -16% to 34% |
| C vs D | Code bytes, normalised | 3 | 8% | 4% to 37% | 3/3 | 4% to 37% |
| A vs C (excl. 1, 5, 8) | Visible output tokens (proxy) | 3 | 26% | 7% to 38% | 3/3 | 7% to 38% |
| A vs C (excl. 1, 5, 8) | Total tokens, net of Claude Code overhead (exact input + proxy output) | 3 | -300% | -436% to -144% | 0/3 | -436% to -144% |
| A vs C (excl. 1, 5, 8) | Code tokens, normalised (proxy o200k) | 3 | 40% | 24% to 51% | 3/3 | 24% to 51% |
| A vs C (excl. 1, 5, 8) | Code lines, normalised | 3 | 42% | 15% to 44% | 3/3 | 15% to 44% |
| A vs C (excl. 1, 5, 8) | Code bytes, normalised | 3 | 49% | 23% to 52% | 3/3 | 23% to 52% |

### Blinded rating (1–5): median over accepted runs, pooled across tasks

| Arm | Polish | Completeness | Responsiveness | Restraint |
|---|---|---|---|---|
| A Once UI + harness | 4 | 4 | 3 | 4 |
| B Once UI, memory | 3 | 4 | 3 | 5 |
| C Tailwind + shadcn/ui + docs | 4 | 4 | 4 | 5 |
| D Tailwind, memory | 5 | 5 | 4 | 5 |
