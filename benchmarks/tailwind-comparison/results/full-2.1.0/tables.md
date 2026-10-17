### Gate pass rate

| Arm | Runs | Accepted (≤3 repairs) | Passed first attempt | Failed | Pending | First-attempt failures by gate |
|---|---|---|---|---|---|---|
| A Once UI + harness | 36 | 36 | 29 | 0 | 0 | typecheck 7 |
| B Once UI, memory | 0 | 0 | 0 | 0 | 0 | – |
| C Tailwind + shadcn/ui + docs | 36 | 36 | 33 | 0 | 0 | build 1, typecheck 2 |
| D Tailwind, memory | 0 | 0 | 0 | 0 | 0 | – |

### Visible output tokens (proxy): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 15,718 (12,432–16,522) | – | 8,673 (8,279–9,161) | – |
| 2. Settings page | 7,326 (7,268–7,419) | – | 26,952 (21,526–27,383) | – |
| 3. Pricing page | 6,978 (6,833–7,056) | – | 6,675 (6,555–6,817) | – |
| 4. Chat UI | 10,330 (9,821–13,008) | – | 11,507 (11,303–12,279) | – |
| 5. Marketing hero | 4,169 (4,007–4,471) | – | 4,992 (4,860–6,045) | – |
| 6. Auth flow | 7,382 (6,641–7,471) | – | 8,440 (8,295–9,734) | – |
| 7. E-commerce product card grid | 10,452 (9,185–14,535) | – | 9,713 (9,485–13,843) | – |
| 8. Onboarding checklist | 6,632 (6,585–8,978) | – | 6,289 (6,082–6,511) | – |
| 9. Data table page | 8,636 (7,951–11,283) | – | 11,381 (11,302–12,415) | – |
| 10. User profile popover | 7,967 (7,091–9,465) | – | 6,648 (6,243–6,673) | – |
| 11. Changelog/timeline page | 6,267 (6,007–10,496) | – | 8,144 (7,870–8,859) | – |
| 12. Feedback widget | 6,201 (6,124–8,860) | – | 5,561 (4,758–5,625) | – |

### Total tokens, net of Claude Code overhead (exact input + proxy output): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 726,008 (528,208–767,923) | – | 91,100 (81,709–91,958) | – |
| 2. Settings page | 158,966 (151,371–167,930) | – | 167,456 (165,143–171,840) | – |
| 3. Pricing page | 135,611 (135,462–136,887) | – | 30,868 (30,756–31,889) | – |
| 4. Chat UI | 309,617 (275,368–347,073) | – | 247,499 (218,882–263,174) | – |
| 5. Marketing hero | 178,558 (169,897–179,342) | – | 49,394 (38,504–56,465) | – |
| 6. Auth flow | 181,162 (179,300–201,268) | – | 67,070 (64,338–69,178) | – |
| 7. E-commerce product card grid | 344,687 (305,690–367,429) | – | 62,671 (60,270–104,450) | – |
| 8. Onboarding checklist | 145,025 (118,476–147,739) | – | 40,529 (39,073–46,435) | – |
| 9. Data table page | 178,120 (148,509–284,662) | – | 100,958 (93,146–141,793) | – |
| 10. User profile popover | 174,918 (151,106–219,879) | – | 46,514 (45,468–47,938) | – |
| 11. Changelog/timeline page | 264,281 (238,976–274,224) | – | 31,234 (29,057–67,542) | – |
| 12. Feedback widget | 217,658 (179,432–277,205) | – | 43,804 (41,544–44,039) | – |

### Input tokens, net of overhead (exact): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 708,683 (514,972–751,402) | – | 81,451 (72,548–83,191) | – |
| 2. Settings page | 151,455 (144,011–160,512) | – | 139,643 (137,760–149,884) | – |
| 3. Pricing page | 128,478 (128,406–129,976) | – | 23,968 (23,939–25,222) | – |
| 4. Chat UI | 300,306 (265,547–334,574) | – | 235,992 (207,579–250,895) | – |
| 5. Marketing hero | 174,714 (165,890–175,034) | – | 44,402 (33,644–50,420) | – |
| 6. Auth flow | 173,602 (171,829–194,538) | – | 58,920 (56,043–59,589) | – |
| 7. E-commerce product card grid | 334,235 (291,155–358,244) | – | 53,414 (50,785–90,835) | – |
| 8. Onboarding checklist | 133,701 (109,546–138,761) | – | 34,654 (32,769–40,353) | – |
| 9. Data table page | 170,855 (140,558–274,065) | – | 89,577 (81,844–129,378) | – |
| 10. User profile popover | 168,704 (144,015–211,291) | – | 39,866 (39,225–41,265) | – |
| 11. Changelog/timeline page | 249,556 (228,480–263,988) | – | 23,638 (21,187–58,958) | – |
| 12. Feedback widget | 211,612 (173,308–268,423) | – | 38,116 (36,723–38,415) | – |

### Code tokens, normalised (exact count_tokens where measured, else proxy o200k): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 4,673 (4,553–4,709) | – | 4,789 (4,638–5,041) | – |
| 2. Settings page | 3,544 (3,541–3,652) | – | 7,722 (7,496–8,040) | – |
| 3. Pricing page | 3,602 (3,520–3,705) | – | 3,687 (3,623–3,806) | – |
| 4. Chat UI | 4,630 (4,562–4,944) | – | 5,424 (5,273–5,800) | – |
| 5. Marketing hero | 1,684 (1,462–1,826) | – | 2,872 (2,649–3,433) | – |
| 6. Auth flow | 3,522 (3,025–3,546) | – | 4,374 (4,231–4,911) | – |
| 7. E-commerce product card grid | 5,669 (4,821–5,701) | – | 5,600 (5,555–5,620) | – |
| 8. Onboarding checklist | 3,426 (3,331–3,466) | – | 3,229 (3,215–3,383) | – |
| 9. Data table page | 4,193 (4,076–4,733) | – | 6,790 (6,685–7,137) | – |
| 10. User profile popover | 2,696 (2,588–3,365) | – | 3,571 (3,304–3,584) | – |
| 11. Changelog/timeline page | 2,747 (2,684–2,856) | – | 4,755 (4,564–4,929) | – |
| 12. Feedback widget | 2,691 (2,691–2,811) | – | 2,874 (2,373–2,881) | – |

### Code tokens, normalised (proxy legacy-Claude): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 4,878 (4,724–4,886) | – | 4,971 (4,807–5,218) | – |
| 2. Settings page | 3,689 (3,683–3,824) | – | 8,250 (8,034–8,599) | – |
| 3. Pricing page | 3,759 (3,670–3,867) | – | 3,961 (3,887–4,064) | – |
| 4. Chat UI | 4,850 (4,791–5,197) | – | 5,939 (5,764–6,331) | – |
| 5. Marketing hero | 1,682 (1,481–1,831) | – | 2,929 (2,802–3,562) | – |
| 6. Auth flow | 3,693 (3,182–3,712) | – | 4,739 (4,602–5,345) | – |
| 7. E-commerce product card grid | 5,844 (5,016–5,885) | – | 5,858 (5,807–5,907) | – |
| 8. Onboarding checklist | 3,536 (3,444–3,596) | – | 3,434 (3,429–3,590) | – |
| 9. Data table page | 4,382 (4,257–4,927) | – | 7,261 (7,126–7,597) | – |
| 10. User profile popover | 2,784 (2,682–3,536) | – | 3,843 (3,573–3,851) | – |
| 11. Changelog/timeline page | 2,868 (2,826–2,982) | – | 5,102 (4,890–5,304) | – |
| 12. Feedback widget | 2,865 (2,852–2,982) | – | 3,101 (2,566–3,105) | – |

### Code lines, normalised: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 628 (627–633) | – | 605 (591–660) | – |
| 2. Settings page | 512 (509–522) | – | 1,056 (1,010–1,090) | – |
| 3. Pricing page | 539 (520–552) | – | 469 (459–518) | – |
| 4. Chat UI | 670 (664–722) | – | 766 (754–806) | – |
| 5. Marketing hero | 262 (227–297) | – | 304 (272–372) | – |
| 6. Auth flow | 519 (441–522) | – | 536 (532–619) | – |
| 7. E-commerce product card grid | 733 (650–749) | – | 672 (669–676) | – |
| 8. Onboarding checklist | 520 (505–526) | – | 436 (418–438) | – |
| 9. Data table page | 602 (583–662) | – | 898 (893–973) | – |
| 10. User profile popover | 400 (379–483) | – | 454 (417–459) | – |
| 11. Changelog/timeline page | 364 (362–379) | – | 604 (585–627) | – |
| 12. Feedback widget | 401 (395–412) | – | 350 (298–353) | – |

### Code bytes, normalised: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 18,216 (17,983–18,232) | – | 18,086 (17,775–19,677) | – |
| 2. Settings page | 17,590 (17,554–18,069) | – | 42,111 (41,244–43,050) | – |
| 3. Pricing page | 17,923 (16,966–18,225) | – | 16,090 (16,075–17,244) | – |
| 4. Chat UI | 20,240 (19,751–21,325) | – | 26,722 (26,267–27,195) | – |
| 5. Marketing hero | 6,782 (6,197–7,691) | – | 9,656 (9,624–12,236) | – |
| 6. Auth flow | 16,293 (13,736–16,509) | – | 20,004 (19,497–22,347) | – |
| 7. E-commerce product card grid | 20,979 (18,543–21,243) | – | 20,417 (20,395–20,631) | – |
| 8. Onboarding checklist | 16,960 (16,481–17,004) | – | 14,279 (14,258–15,126) | – |
| 9. Data table page | 15,631 (15,182–18,590) | – | 26,502 (26,349–28,795) | – |
| 10. User profile popover | 13,343 (12,159–15,503) | – | 14,835 (14,434–15,136) | – |
| 11. Changelog/timeline page | 11,324 (11,093–11,906) | – | 19,216 (19,043–20,412) | – |
| 12. Feedback widget | 12,120 (11,805–12,424) | – | 12,033 (10,053–12,262) | – |

### API calls per run: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 17 (15–17) | – | 7 (6.50–7) | – |
| 2. Settings page | 9 (9–9.50) | – | 8 (7.50–8) | – |
| 3. Pricing page | 8 (8–8) | – | 5 (5–5) | – |
| 4. Chat UI | 11 (11–12) | – | 9 (8.50–9.50) | – |
| 5. Marketing hero | 9 (9–9.50) | – | 7 (6–7.50) | – |
| 6. Auth flow | 10 (10–11) | – | 7 (7–7) | – |
| 7. E-commerce product card grid | 11 (11–12) | – | 7 (6.50–8.50) | – |
| 8. Onboarding checklist | 8 (7.50–8) | – | 6 (5.50–6.50) | – |
| 9. Data table page | 10 (9.50–13) | – | 8 (7.50–9) | – |
| 10. User profile popover | 10 (9.50–11) | – | 6 (6–6) | – |
| 11. Changelog/timeline page | 10 (10–11) | – | 6 (5.50–6.50) | – |
| 12. Feedback widget | 10 (9.50–11) | – | 6 (6–6) | – |

### Docs files read per run: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 23 (21–25) | – | 2 (2–2) | – |
| 2. Settings page | 15 (15–17) | – | 3 (2.50–3.50) | – |
| 3. Pricing page | 10 (10–10) | – | 3 (3–3) | – |
| 4. Chat UI | 19 (19–20) | – | 7 (5.50–7) | – |
| 5. Marketing hero | 16 (15–17) | – | 3 (3–3) | – |
| 6. Auth flow | 15 (15–16) | – | 3 (3–3) | – |
| 7. E-commerce product card grid | 17 (16–18) | – | 3 (3–3) | – |
| 8. Onboarding checklist | 10 (9.50–12) | – | 3 (3–3) | – |
| 9. Data table page | 15 (13–15) | – | 4 (4–5.50) | – |
| 10. User profile popover | 20 (18–21) | – | 3 (3–3) | – |
| 11. Changelog/timeline page | 14 (14–15) | – | 2 (2–2.50) | – |
| 12. Feedback widget | 17 (17–20) | – | 3 (3–3) | – |

### Repair rounds to acceptance: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 1 (0.5000–1) | – | 0 (0–0) | – |
| 2. Settings page | 0 (0–0) | – | 1 (0.5000–1) | – |
| 3. Pricing page | 0 (0–0) | – | 0 (0–0) | – |
| 4. Chat UI | 0 (0–0.5000) | – | 0 (0–0) | – |
| 5. Marketing hero | 0 (0–0) | – | 0 (0–0) | – |
| 6. Auth flow | 0 (0–0) | – | 0 (0–0) | – |
| 7. E-commerce product card grid | 0 (0–0.5000) | – | 0 (0–0.5000) | – |
| 8. Onboarding checklist | 0 (0–0.5000) | – | 0 (0–0) | – |
| 9. Data table page | 0 (0–0.5000) | – | 0 (0–0) | – |
| 10. User profile popover | 0 (0–0.5000) | – | 0 (0–0) | – |
| 11. Changelog/timeline page | 0 (0–0) | – | 0 (0–0) | – |
| 12. Feedback widget | 0 (0–0) | – | 0 (0–0) | – |

### Vendored component lines (C): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | – | – | 657 (657–687) | – |
| 2. Settings page | – | – | 1,218 (1,188–1,277) | – |
| 3. Pricing page | – | – | 387 (387–397) | – |
| 4. Chat UI | – | – | 1,477 (1,471–1,477) | – |
| 5. Marketing hero | – | – | 209 (159–209) | – |
| 6. Auth flow | – | – | 843 (746–891) | – |
| 7. E-commerce product card grid | – | – | 498 (398–498) | – |
| 8. Onboarding checklist | – | – | 219 (219–233) | – |
| 9. Data table page | – | – | 1,078 (1,078–1,120) | – |
| 10. User profile popover | – | – | 381 (347–436) | – |
| 11. Changelog/timeline page | – | – | 251 (201–421) | – |
| 12. Feedback widget | – | – | 362 (362–362) | – |

### Cost per run, USD, list prices, no caching (exact runs only): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 1.59 (1.16–1.67) | – | 0.2487 (0.2314–0.2540) | – |
| 2. Settings page | 0.3780 (0.3616–0.3952) | – | 0.5413 (0.5113–0.5493) | – |
| 3. Pricing page | 0.3283 (0.3274–0.3291) | – | 0.1173 (0.1160–0.1173) | – |
| 4. Chat UI | 0.6937 (0.6293–0.7941) | – | 0.5871 (0.5282–0.6246) | – |
| 5. Marketing hero | 0.3879 (0.3718–0.3931) | – | 0.1387 (0.1159–0.1613) | – |
| 6. Auth flow | 0.4228 (0.4184–0.4564) | – | 0.1993 (0.1950–0.2151) | – |
| 7. E-commerce product card grid | 0.7730 (0.7277–0.8083) | – | 0.1994 (0.1964–0.3178) | – |
| 8. Onboarding checklist | 0.3540 (0.2951–0.3673) | – | 0.1291 (0.1286–0.1420) | – |
| 9. Data table page | 0.4144 (0.3606–0.6541) | – | 0.2930 (0.2767–0.3829) | – |
| 10. User profile popover | 0.3995 (0.3589–0.5085) | – | 0.1462 (0.1409–0.1493) | – |
| 11. Changelog/timeline page | 0.6143 (0.5459–0.6303) | – | 0.1232 (0.1211–0.2038) | – |
| 12. Feedback widget | 0.4837 (0.4079–0.6247) | – | 0.1330 (0.1216–0.1331) | – |

### Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 0.5007 (0.3997–0.5153) | – | 0.1495 (0.1469–0.1550) | – |
| 2. Settings page | 0.1972 (0.1881–0.1981) | – | 0.3605 (0.3159–0.3681) | – |
| 3. Pricing page | 0.1851 (0.1839–0.1883) | – | 0.0957 (0.0941–0.0971) | – |
| 4. Chat UI | 0.2900 (0.2810–0.3287) | – | 0.2710 (0.2632–0.2911) | – |
| 5. Marketing hero | 0.1762 (0.1671–0.1816) | – | 0.0828 (0.0772–0.0953) | – |
| 6. Auth flow | 0.2018 (0.2002–0.2056) | – | 0.1314 (0.1287–0.1463) | – |
| 7. E-commerce product card grid | 0.3102 (0.3026–0.3234) | – | 0.1433 (0.1395–0.1938) | – |
| 8. Onboarding checklist | 0.1991 (0.1765–0.2095) | – | 0.0981 (0.0945–0.0983) | – |
| 9. Data table page | 0.1971 (0.1894–0.2597) | – | 0.1855 (0.1827–0.2154) | – |
| 10. User profile popover | 0.1995 (0.1922–0.2390) | – | 0.1018 (0.0962–0.1045) | – |
| 11. Changelog/timeline page | 0.2297 (0.2146–0.2792) | – | 0.1017 (0.0993–0.1354) | – |
| 12. Feedback widget | 0.2133 (0.1988–0.2627) | – | 0.0890 (0.0795–0.0891) | – |

### Distinct library components imported: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 14 (14–15) | – | 19 (19–19) | – |
| 2. Settings page | 18 (18–19) | – | 45 (43–47) | – |
| 3. Pricing page | 13 (13–13) | – | 20 (20–21) | – |
| 4. Chat UI | 15 (15–16) | – | 53 (53–53) | – |
| 5. Marketing hero | 12 (12–13) | – | 5 (3.50–5) | – |
| 6. Auth flow | 15 (14–15) | – | 25 (23–27) | – |
| 7. E-commerce product card grid | 12 (11–13) | – | 11 (9.50–11) | – |
| 8. Onboarding checklist | 11 (11–12) | – | 9 (9–9.50) | – |
| 9. Data table page | 11 (11–11) | – | 30 (30–32) | – |
| 10. User profile popover | 13 (12–14) | – | 13 (11–16) | – |
| 11. Changelog/timeline page | 12 (11–13) | – | 5 (4.50–12) | – |
| 12. Feedback widget | 11 (10–11) | – | 13 (13–13) | – |

### axe violation rules (1440 px): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 0 (0–0) | – | 2 (1.50–2) | – |
| 2. Settings page | 1 (1–1) | – | 1 (1–1) | – |
| 3. Pricing page | 1 (1–1) | – | 0 (0–0.5000) | – |
| 4. Chat UI | 2 (1–2.50) | – | 3 (2.50–3) | – |
| 5. Marketing hero | 0 (0–0) | – | 0 (0–0.5000) | – |
| 6. Auth flow | 1 (0.5000–1) | – | 0 (0–0) | – |
| 7. E-commerce product card grid | 2 (1.50–2) | – | 1 (1–1.50) | – |
| 8. Onboarding checklist | 1 (1–1) | – | 1 (0.5000–1.50) | – |
| 9. Data table page | 0 (0–0) | – | 1 (0.5000–1.50) | – |
| 10. User profile popover | 3 (2.50–3.50) | – | 1 (1–1.50) | – |
| 11. Changelog/timeline page | 1 (1–1.50) | – | 1 (1–1.50) | – |
| 12. Feedback widget | 0 (0–0) | – | 0 (0–0) | – |

### Reductions (per-task median reduction of X relative to Y; positive = X smaller)

| Pair | Metric | Tasks | Median | Range | Tasks where X < Y | 95% bootstrap CI |
|---|---|---|---|---|---|---|
| A vs C | Visible output tokens (proxy) | 12 | 3% | -81% to 73% | 6/12 | -10% to 20% |
| A vs C | Total tokens, net of Claude Code overhead (exact input + proxy output) | 12 | -269% | -746% to 5% | 1/12 | -423% to -123% |
| A vs C | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 12 | 17% | -6% to 54% | 10/12 | 2% to 40% |
| A vs C | Code lines, normalised | 12 | 8% | -19% to 52% | 7/12 | -12% to 23% |
| A vs C | Code bytes, normalised | 12 | 14% | -19% to 58% | 7/12 | -2% to 35% |
| A vs C | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 12 | -99% | -235% to 45% | 1/12 | -121% to -30% |
| A vs D | Visible output tokens (proxy) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs D | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs D | Code lines, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs D | Code bytes, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs D | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs C | Visible output tokens (proxy) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs C | Total tokens, net of Claude Code overhead (exact input + proxy output) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs C | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs C | Code lines, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs C | Code bytes, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs C | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs D | Visible output tokens (proxy) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs D | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs D | Code lines, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs D | Code bytes, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| B vs D | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs B | Visible output tokens (proxy) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs B | Total tokens, net of Claude Code overhead (exact input + proxy output) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs B | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs B | Code lines, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs B | Code bytes, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs B | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| C vs D | Visible output tokens (proxy) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| C vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| C vs D | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| C vs D | Code lines, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| C vs D | Code bytes, normalised | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| C vs D | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 0 | – | – to – | 0/0 | n/a (< 2 tasks) |
| A vs C (excl. 1, 5, 8) | Visible output tokens (proxy) | 9 | 10% | -20% to 73% | 5/9 | -12% to 24% |
| A vs C (excl. 1, 5, 8) | Total tokens, net of Claude Code overhead (exact input + proxy output) | 9 | -276% | -746% to 5% | 1/9 | -450% to -25% |
| A vs C (excl. 1, 5, 8) | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 9 | 19% | -1% to 54% | 8/9 | 2% to 42% |
| A vs C (excl. 1, 5, 8) | Code lines, normalised | 9 | 12% | -15% to 52% | 6/9 | -15% to 40% |
| A vs C (excl. 1, 5, 8) | Code bytes, normalised | 9 | 19% | -11% to 58% | 6/9 | -3% to 41% |
| A vs C (excl. 1, 5, 8) | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 9 | -93% | -140% to 45% | 1/9 | -126% to -6% |

### Claim conditions, A vs C (METHODOLOGY.md §5.1)

| Metric | 1. CI lower bound > 0 | 2. X < Y on ≥ 9 tasks | 3. holds without tasks 1, 5, 8 | 4. pass rate within 10 pp | 5. ratings within 0.5 | Claim allowed |
|---|---|---|---|---|---|---|
| Visible output tokens (proxy) | **no** | **no** (6/12) | yes | yes | **no** | no |
| Total tokens, net of Claude Code overhead (exact input + proxy output) | **no** | **no** (1/12) | **no** | yes | **no** | no |
| Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | yes | yes (10/12) | yes | yes | **no** | no |
| Code lines, normalised | **no** | **no** (7/12) | yes | yes | **no** | no |
| Code bytes, normalised | **no** | **no** (7/12) | yes | yes | **no** | no |

### Blinded rating (1–5): median over accepted runs, pooled across tasks

| Arm | Polish | Completeness | Responsiveness | Restraint |
|---|---|---|---|---|
| A Once UI + harness | 4 | 3 | 4 | 5 |
| B Once UI, memory | – | – | – | – |
| C Tailwind + shadcn/ui + docs | 4 | 4 | 4 | 5 |
| D Tailwind, memory | – | – | – | – |

_Once UI `validate-ai-code` issue counts (in summary.json) come from validator 46be018f1a0f7b9d. They are not comparable across runs that used different validator versions._
