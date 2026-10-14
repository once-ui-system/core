### Gate pass rate

| Arm | Runs | Accepted (≤3 repairs) | Passed first attempt | Failed | Pending | First-attempt failures by gate |
|---|---|---|---|---|---|---|
| A Once UI + harness | 60 | 60 | 35 | 0 | 0 | render 3, typecheck 22 |
| B Once UI, memory | 60 | 60 | 30 | 0 | 0 | typecheck 28, render 2 |
| C Tailwind + shadcn/ui + docs | 60 | 60 | 55 | 0 | 0 | typecheck 5 |
| D Tailwind, memory | 60 | 60 | 54 | 0 | 0 | render 4, typecheck 2 |

### Visible output tokens (proxy): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 9,743 (8,342–15,186) | 8,562 (8,257–17,103) | 7,340 (7,220–7,526) | 9,711 (9,317–9,714) |
| 2. Settings page | 13,686 (13,193–13,919) | 13,757 (13,535–13,868) | 14,157 (13,016–14,271) | 10,621 (9,789–10,740) |
| 3. Pricing page | 7,459 (7,112–7,538) | 8,202 (7,953–8,905) | 6,888 (6,319–7,176) | 6,375 (6,233–6,379) |
| 4. Chat UI | 15,897 (15,204–16,531) | 18,221 (9,606–22,024) | 12,413 (12,203–12,817) | 10,120 (9,510–10,613) |
| 5. Marketing hero | 7,356 (6,415–8,589) | 5,642 (5,383–5,739) | 5,027 (4,922–5,611) | 4,919 (4,864–5,708) |
| 6. Auth flow | 8,235 (7,990–13,699) | 12,218 (11,472–12,460) | 8,800 (8,779–8,856) | 11,757 (11,548–12,053) |
| 7. E-commerce product card grid | 10,833 (9,470–11,330) | 10,151 (9,361–12,624) | 9,814 (8,644–10,177) | 7,752 (7,041–8,176) |
| 8. Onboarding checklist | 7,310 (7,169–11,947) | 7,259 (6,868–11,680) | 6,854 (6,670–12,370) | 6,790 (6,693–6,958) |
| 9. Data table page | 7,700 (7,573–14,145) | 15,577 (15,382–16,911) | 11,846 (11,356–12,731) | 9,574 (8,800–12,336) |
| 10. User profile popover | 6,512 (6,466–10,680) | 8,761 (7,360–9,719) | 5,821 (5,681–6,632) | 6,551 (6,197–6,908) |
| 11. Changelog/timeline page | 7,159 (6,950–7,310) | 10,512 (7,180–10,911) | 7,333 (6,604–7,520) | 6,912 (6,673–7,043) |
| 12. Feedback widget | 7,162 (6,171–11,941) | 8,978 (8,209–9,328) | 5,167 (4,313–5,382) | 7,024 (6,206–7,425) |

### Total tokens, net of Claude Code overhead (exact input + proxy output): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 554,281 (483,776–594,588) | 22,609 (22,324–42,584) | 69,706 (68,970–73,714) | 17,665 (16,980–18,127) |
| 2. Settings page | 453,263 (417,747–496,379) | 24,472 (24,359–27,946) | 90,372 (72,891–99,761) | 16,860 (16,031–16,976) |
| 3. Pricing page | 320,782 (277,021–322,785) | 22,545 (22,465–23,456) | 38,259 (32,220–45,804) | 12,615 (12,485–12,634) |
| 4. Chat UI | 638,405 (614,405–706,983) | 41,258 (23,750–46,650) | 324,622 (292,864–372,450) | 16,388 (15,778–16,872) |
| 5. Marketing hero | 522,105 (511,927–552,134) | 19,059 (16,524–19,969) | 26,886 (25,906–30,375) | 11,108 (11,076–11,166) |
| 6. Auth flow | 499,074 (459,463–521,511) | 45,630 (34,935–47,956) | 71,256 (54,500–73,496) | 20,618 (20,437–20,987) |
| 7. E-commerce product card grid | 443,575 (431,584–502,241) | 20,795 (19,459–32,157) | 70,800 (47,617–78,112) | 14,850 (14,008–15,889) |
| 8. Onboarding checklist | 447,657 (382,300–589,848) | 20,603 (18,025–31,340) | 52,258 (41,398–66,809) | 15,101 (13,174–15,681) |
| 9. Data table page | 416,516 (406,567–452,857) | 40,129 (36,246–42,053) | 132,796 (93,403–150,966) | 15,801 (15,012–21,156) |
| 10. User profile popover | 511,888 (510,945–694,823) | 21,456 (18,949–27,642) | 33,521 (30,013–43,280) | 13,120 (11,926–13,979) |
| 11. Changelog/timeline page | 463,896 (460,782–518,790) | 32,976 (20,012–33,168) | 36,364 (35,343–39,439) | 15,490 (13,151–15,825) |
| 12. Feedback widget | 463,316 (399,249–505,584) | 30,597 (26,281–31,432) | 42,926 (41,871–58,750) | 15,942 (15,031–16,360) |

### Input tokens, net of overhead (exact): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 546,035 (474,033–579,402) | 14,214 (14,067–25,417) | 62,486 (61,444–65,437) | 8,791 (6,279–8,800) |
| 2. Settings page | 440,070 (409,208–482,693) | 14,227 (10,604–14,411) | 78,575 (58,734–83,068) | 6,242 (6,239–6,251) |
| 3. Pricing page | 308,334 (269,562–315,673) | 14,551 (14,263–14,613) | 31,371 (26,216–36,698) | 6,252 (6,240–6,255) |
| 4. Chat UI | 622,508 (605,646–690,149) | 23,037 (14,144–24,626) | 312,419 (281,284–358,936) | 6,268 (6,268–6,268) |
| 5. Marketing hero | 514,749 (503,338–545,719) | 14,126 (10,882–14,586) | 20,883 (20,879–24,764) | 6,244 (6,220–6,247) |
| 6. Auth flow | 478,856 (452,123–513,521) | 33,170 (23,463–35,738) | 62,477 (45,700–64,640) | 8,889 (8,861–8,934) |
| 7. E-commerce product card grid | 432,742 (422,114–490,911) | 10,644 (10,098–19,533) | 62,156 (37,440–67,801) | 6,256 (6,232–8,790) |
| 8. Onboarding checklist | 440,488 (367,985–582,538) | 13,735 (10,766–19,660) | 45,404 (35,126–54,439) | 8,891 (6,219–8,905) |
| 9. Data table page | 408,816 (392,422–445,284) | 24,552 (20,864–25,142) | 121,440 (81,557–132,795) | 6,227 (6,212–8,820) |
| 10. User profile popover | 505,422 (504,433–684,143) | 14,096 (10,286–17,923) | 27,700 (24,431–36,254) | 6,212 (5,375–7,782) |
| 11. Changelog/timeline page | 456,586 (454,043–511,840) | 20,007 (13,438–22,464) | 29,760 (28,971–32,106) | 8,771 (6,239–8,782) |
| 12. Feedback widget | 451,375 (393,078–498,422) | 21,619 (18,072–22,104) | 38,767 (37,558–53,368) | 8,918 (8,825–8,935) |

### Code tokens, normalised (exact count_tokens where measured, else proxy o200k): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 7,016 (6,305–7,495) | 8,256 (7,782–8,340) | 6,885 (6,170–6,896) | 9,273 (9,172–9,721) |
| 2. Settings page | 5,642 (5,587–6,153) | 13,071 (9,136–13,137) | 12,291 (10,636–12,551) | 10,305 (9,466–10,519) |
| 3. Pricing page | 5,744 (5,624–5,855) | 7,476 (7,151–8,007) | 5,653 (5,404–5,969) | 5,960 (5,838–5,986) |
| 4. Chat UI | 6,855 (6,282–7,193) | 8,828 (8,660–10,648) | 9,463 (9,248–10,460) | 9,690 (9,065–10,282) |
| 5. Marketing hero | 2,355 (2,008–2,418) | 4,398 (4,268–4,831) | 4,241 (4,223–4,916) | 4,469 (4,402–5,391) |
| 6. Auth flow | 5,246 (5,185–5,698) | 5,490 (5,180–5,562) | 7,591 (7,221–7,711) | 10,508 (10,508–10,682) |
| 7. E-commerce product card grid | 8,067 (7,184–8,381) | 8,763 (8,236–8,990) | 8,713 (7,497–9,201) | 7,572 (6,799–7,966) |
| 8. Onboarding checklist | 4,434 (4,363–4,681) | 6,094 (5,668–6,127) | 5,616 (5,525–5,718) | 6,218 (6,162–6,428) |
| 9. Data table page | 6,104 (6,033–6,271) | 8,136 (7,925–8,979) | 9,392 (8,782–10,776) | 9,876 (8,612–9,927) |
| 10. User profile popover | 3,965 (3,635–3,974) | 5,760 (5,444–6,358) | 4,809 (4,716–5,656) | 5,992 (5,739–6,303) |
| 11. Changelog/timeline page | 5,239 (5,217–5,499) | 5,920 (5,463–6,531) | 6,564 (5,627–6,624) | 6,524 (6,079–6,525) |
| 12. Feedback widget | 4,791 (4,291–5,089) | 3,674 (3,368–4,095) | 3,870 (3,397–4,126) | 5,530 (5,485–6,259) |

### Code tokens, normalised (proxy legacy-Claude): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 4,812 (4,384–4,965) | 5,749 (5,499–5,750) | 4,602 (4,171–4,630) | 6,609 (6,579–7,003) |
| 2. Settings page | 3,621 (3,501–3,852) | 8,675 (5,942–8,924) | 7,746 (7,002–8,143) | 7,044 (6,458–7,149) |
| 3. Pricing page | 3,771 (3,663–3,800) | 5,087 (5,063–5,456) | 3,891 (3,700–4,047) | 4,308 (4,186–4,339) |
| 4. Chat UI | 4,563 (4,101–4,676) | 6,149 (6,077–7,362) | 6,028 (6,025–6,889) | 6,749 (6,331–7,200) |
| 5. Marketing hero | 1,552 (1,354–1,556) | 3,142 (2,991–3,387) | 2,982 (2,940–3,446) | 3,146 (3,109–3,827) |
| 6. Auth flow | 3,424 (3,364–3,647) | 3,616 (3,424–3,692) | 4,914 (4,578–5,067) | 7,275 (7,268–7,390) |
| 7. E-commerce product card grid | 5,453 (4,873–5,788) | 6,138 (5,894–6,379) | 6,047 (5,281–6,338) | 5,452 (4,837–5,660) |
| 8. Onboarding checklist | 2,940 (2,866–3,100) | 4,075 (3,799–4,201) | 3,819 (3,788–3,941) | 4,353 (4,333–4,481) |
| 9. Data table page | 4,323 (4,216–4,392) | 5,643 (5,294–6,193) | 6,308 (5,816–7,260) | 6,979 (6,037–6,998) |
| 10. User profile popover | 2,548 (2,420–2,717) | 3,995 (3,792–4,442) | 3,338 (3,275–3,889) | 4,227 (3,943–4,444) |
| 11. Changelog/timeline page | 3,545 (3,523–3,683) | 4,011 (3,758–4,586) | 4,552 (3,884–4,591) | 4,502 (4,231–4,574) |
| 12. Feedback widget | 3,089 (2,873–3,370) | 2,449 (2,269–2,770) | 2,620 (2,326–2,774) | 3,901 (3,849–4,414) |

### Code lines, normalised: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 667 (622–701) | 755 (745–774) | 591 (545–601) | 744 (730–769) |
| 2. Settings page | 495 (481–521) | 930 (799–972) | 971 (820–972) | 773 (675–778) |
| 3. Pricing page | 536 (527–552) | 722 (510–767) | 468 (445–504) | 446 (435–447) |
| 4. Chat UI | 647 (583–652) | 738 (564–881) | 776 (760–852) | 679 (655–726) |
| 5. Marketing hero | 238 (194–242) | 379 (361–447) | 326 (281–352) | 285 (268–368) |
| 6. Auth flow | 461 (454–498) | 468 (421–493) | 569 (539–602) | 735 (712–759) |
| 7. E-commerce product card grid | 634 (622–736) | 736 (644–776) | 722 (622–775) | 555 (504–560) |
| 8. Onboarding checklist | 416 (416–427) | 502 (499–509) | 447 (433–476) | 422 (417–442) |
| 9. Data table page | 584 (579–596) | 779 (680–810) | 735 (702–919) | 792 (618–799) |
| 10. User profile popover | 393 (360–398) | 398 (369–449) | 390 (356–445) | 423 (402–455) |
| 11. Changelog/timeline page | 454 (445–476) | 472 (432–487) | 519 (425–542) | 454 (447–468) |
| 12. Feedback widget | 437 (407–462) | 341 (294–360) | 312 (267–347) | 374 (374–434) |

### Code bytes, normalised: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 19,100 (17,496–20,934) | 20,591 (19,131–21,151) | 17,756 (15,294–17,811) | 22,805 (22,677–23,917) |
| 2. Settings page | 16,928 (16,855–18,112) | 37,589 (28,141–38,215) | 34,892 (32,005–35,614) | 30,144 (27,167–30,452) |
| 3. Pricing page | 17,421 (16,959–17,845) | 20,544 (19,339–21,902) | 16,284 (15,677–17,402) | 15,264 (15,075–15,951) |
| 4. Chat UI | 18,658 (17,702–19,921) | 22,587 (22,380–27,132) | 26,507 (25,206–26,886) | 25,002 (23,650–27,192) |
| 5. Marketing hero | 7,336 (5,776–7,655) | 10,683 (10,175–11,870) | 10,580 (10,453–12,020) | 11,569 (11,401–13,796) |
| 6. Auth flow | 14,862 (14,608–15,866) | 14,882 (13,633–15,033) | 21,107 (21,015–22,551) | 27,719 (27,154–27,900) |
| 7. E-commerce product card grid | 19,935 (18,019–20,109) | 20,198 (19,120–20,576) | 21,437 (19,133–23,032) | 18,366 (16,060–19,032) |
| 8. Onboarding checklist | 14,018 (13,941–14,326) | 17,379 (16,819–18,015) | 16,462 (16,185–17,078) | 17,325 (17,147–18,181) |
| 9. Data table page | 14,829 (14,717–15,467) | 22,901 (22,388–24,805) | 25,143 (24,451–28,918) | 25,594 (24,103–26,106) |
| 10. User profile popover | 11,151 (10,846–12,517) | 14,758 (14,045–15,251) | 13,550 (13,195–15,557) | 16,686 (16,025–16,985) |
| 11. Changelog/timeline page | 13,904 (13,793–14,429) | 16,027 (14,902–16,864) | 17,297 (14,334–17,389) | 16,480 (16,137–17,517) |
| 12. Feedback widget | 13,698 (12,126–14,069) | 10,454 (9,400–11,056) | 10,319 (9,223–11,156) | 14,586 (14,418–16,641) |

### API calls per run: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 11 (11–12) | 6 (6–7) | 6 (6–6) | 5 (4–5) |
| 2. Settings page | 12 (11–13) | 6 (5–6) | 6 (6–7) | 4 (4–4) |
| 3. Pricing page | 9 (9–9) | 6 (6–6) | 5 (5–5) | 4 (4–4) |
| 4. Chat UI | 13 (12–13) | 6 (6–6) | 10 (10–11) | 4 (4–4) |
| 5. Marketing hero | 12 (11–13) | 6 (5–6) | 5 (5–5) | 4 (4–4) |
| 6. Auth flow | 12 (12–13) | 8 (7–8) | 7 (6–7) | 5 (5–5) |
| 7. E-commerce product card grid | 11 (11–12) | 5 (5–6) | 6 (6–6) | 4 (4–5) |
| 8. Onboarding checklist | 12 (11–12) | 6 (5–6) | 7 (6–7) | 5 (4–5) |
| 9. Data table page | 10 (10–10) | 7 (6–7) | 8 (7–9) | 4 (4–5) |
| 10. User profile popover | 13 (12–14) | 6 (5–6) | 5 (5–6) | 4 (4–5) |
| 11. Changelog/timeline page | 11 (11–11) | 6 (6–7) | 6 (6–7) | 5 (4–5) |
| 12. Feedback widget | 11 (11–12) | 7 (6–7) | 6 (6–7) | 5 (5–5) |

### Docs files read per run: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 19 (18–19) | 0 (0–0) | 2 (2–2) | 0 (0–0) |
| 2. Settings page | 29 (27–29) | 0 (0–0) | 3 (3–3) | 0 (0–0) |
| 3. Pricing page | 16 (15–16) | 0 (0–0) | 3 (3–3) | 0 (0–0) |
| 4. Chat UI | 27 (26–31) | 0 (0–0) | 9 (8–9) | 0 (0–0) |
| 5. Marketing hero | 26 (25–26) | 0 (0–0) | 1 (1–3) | 0 (0–0) |
| 6. Auth flow | 25 (22–26) | 0 (0–0) | 3 (3–3) | 0 (0–0) |
| 7. E-commerce product card grid | 20 (19–20) | 0 (0–0) | 3 (2–3) | 0 (0–0) |
| 8. Onboarding checklist | 17 (16–19) | 0 (0–0) | 3 (3–3) | 0 (0–0) |
| 9. Data table page | 17 (17–19) | 0 (0–0) | 4 (3–5) | 0 (0–0) |
| 10. User profile popover | 25 (24–29) | 0 (0–0) | 3 (3–3) | 0 (0–0) |
| 11. Changelog/timeline page | 15 (15–16) | 0 (0–0) | 2 (2–2) | 0 (0–0) |
| 12. Feedback widget | 17 (17–22) | 0 (0–0) | 3 (3–3) | 0 (0–0) |

### Repair rounds to acceptance: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 0 (0–1) | 0 (0–1) | 0 (0–0) | 0 (0–0) |
| 2. Settings page | 1 (1–1) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| 3. Pricing page | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| 4. Chat UI | 1 (1–1) | 1 (0–1) | 0 (0–0) | 0 (0–0) |
| 5. Marketing hero | 1 (1–1) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| 6. Auth flow | 0 (0–1) | 1 (1–1) | 0 (0–0) | 0 (0–0) |
| 7. E-commerce product card grid | 0 (0–0) | 0 (0–1) | 0 (0–0) | 0 (0–0) |
| 8. Onboarding checklist | 0 (0–1) | 0 (0–1) | 0 (0–1) | 0 (0–0) |
| 9. Data table page | 0 (0–0) | 1 (1–1) | 0 (0–0) | 0 (0–0) |
| 10. User profile popover | 0 (0–1) | 0 (0–1) | 0 (0–0) | 0 (0–0) |
| 11. Changelog/timeline page | 0 (0–0) | 1 (0–1) | 0 (0–0) | 0 (0–0) |
| 12. Feedback widget | 0 (0–1) | 1 (1–1) | 0 (0–0) | 0 (0–0) |

### Vendored component lines (C): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | – | – | 681 (657–716) | – |
| 2. Settings page | – | – | 993 (993–1,100) | – |
| 3. Pricing page | – | – | 407 (387–407) | – |
| 4. Chat UI | – | – | 1,218 (1,218–1,453) | – |
| 5. Marketing hero | – | – | 209 (109–209) | – |
| 6. Auth flow | – | – | 843 (699–866) | – |
| 7. E-commerce product card grid | – | – | 425 (380–430) | – |
| 8. Onboarding checklist | – | – | 219 (219–219) | – |
| 9. Data table page | – | – | 1,161 (1,161–1,161) | – |
| 10. User profile popover | – | – | 350 (337–350) | – |
| 11. Changelog/timeline page | – | – | 251 (245–251) | – |
| 12. Feedback widget | – | – | 490 (362–490) | – |

### Cost per run, USD, list prices, no caching (exact runs only): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 1.17 (1.05–1.31) | 0.1137 (0.1107–0.2225) | 0.1981 (0.1972–0.2136) | 0.1108 (0.1097–0.1147) |
| 2. Settings page | 1.01 (0.9038–1.10) | 0.1599 (0.1588–0.1642) | 0.2751 (0.2590–0.3137) | 0.1187 (0.1104–0.1199) |
| 3. Pricing page | 0.7025 (0.6137–0.7411) | 0.1105 (0.1078–0.1182) | 0.1316 (0.1125–0.1490) | 0.0762 (0.0748–0.0763) |
| 4. Chat UI | 1.40 (1.30–1.55) | 0.2283 (0.1243–0.2695) | 0.7469 (0.6784–0.8530) | 0.1137 (0.1076–0.1186) |
| 5. Marketing hero | 1.10 (1.09–1.16) | 0.0782 (0.0782–0.0830) | 0.1018 (0.0920–0.1056) | 0.0617 (0.0611–0.0678) |
| 6. Auth flow | 1.11 (0.9776–1.16) | 0.1909 (0.1616–0.1937) | 0.2127 (0.1794–0.2178) | 0.1353 (0.1333–0.1384) |
| 7. E-commerce product card grid | 0.9738 (0.9389–1.10) | 0.1228 (0.1138–0.1653) | 0.2108 (0.1767–0.2387) | 0.0900 (0.0881–0.0986) |
| 8. Onboarding checklist | 0.9527 (0.8791–1.24) | 0.0961 (0.0941–0.1561) | 0.1593 (0.1330–0.2326) | 0.0820 (0.0794–0.0857) |
| 9. Data table page | 0.9263 (0.8946–0.9663) | 0.2049 (0.1955–0.2194) | 0.3564 (0.2816–0.4473) | 0.1082 (0.1004–0.1410) |
| 10. User profile popover | 1.08 (1.07–1.48) | 0.1080 (0.1018–0.1330) | 0.1136 (0.1047–0.1428) | 0.0775 (0.0763–0.0815) |
| 11. Changelog/timeline page | 0.9863 (0.9755–1.09) | 0.1500 (0.0926–0.1716) | 0.1308 (0.1256–0.1375) | 0.0844 (0.0816–0.0880) |
| 12. Feedback widget | 1.02 (0.8479–1.07) | 0.1330 (0.1182–0.1375) | 0.1282 (0.1191–0.1596) | 0.0881 (0.0797–0.0921) |

### Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 0.4807 (0.4787–0.5460) | 0.0947 (0.0917–0.1834) | 0.1377 (0.1336–0.1425) | 0.1029 (0.0996–0.1035) |
| 2. Settings page | 0.3849 (0.3792–0.4465) | 0.1459 (0.1450–0.1470) | 0.2059 (0.1927–0.2147) | 0.1119 (0.1036–0.1131) |
| 3. Pricing page | 0.3889 (0.3860–0.4088) | 0.0912 (0.0883–0.0988) | 0.1030 (0.0921–0.1031) | 0.0694 (0.0680–0.0695) |
| 4. Chat UI | 0.5721 (0.5191–0.5768) | 0.1934 (0.1050–0.2312) | 0.3046 (0.2924–0.3795) | 0.1069 (0.1008–0.1118) |
| 5. Marketing hero | 0.4755 (0.3511–0.4827) | 0.0649 (0.0635–0.0657) | 0.0799 (0.0712–0.0808) | 0.0549 (0.0543–0.0617) |
| 6. Auth flow | 0.4537 (0.4353–0.4835) | 0.1385 (0.1268–0.1389) | 0.1370 (0.1313–0.1391) | 0.1238 (0.1219–0.1269) |
| 7. E-commerce product card grid | 0.4590 (0.4434–0.4767) | 0.1097 (0.1015–0.1367) | 0.1417 (0.1383–0.1631) | 0.0832 (0.0768–0.0881) |
| 8. Onboarding checklist | 0.4299 (0.3300–0.4746) | 0.0813 (0.0776–0.1274) | 0.1007 (0.0979–0.1610) | 0.0743 (0.0726–0.0753) |
| 9. Data table page | 0.4347 (0.4293–0.4788) | 0.1677 (0.1649–0.1812) | 0.2116 (0.1920–0.2420) | 0.1014 (0.0937–0.1296) |
| 10. User profile popover | 0.4479 (0.3373–0.5350) | 0.0955 (0.0825–0.1069) | 0.0889 (0.0842–0.1004) | 0.0702 (0.0679–0.0747) |
| 11. Changelog/timeline page | 0.4170 (0.4119–0.4210) | 0.1165 (0.0792–0.1246) | 0.0969 (0.0942–0.0996) | 0.0748 (0.0731–0.0768) |
| 12. Feedback widget | 0.4455 (0.3812–0.4476) | 0.1009 (0.0924–0.1046) | 0.0873 (0.0799–0.0937) | 0.0767 (0.0683–0.0807) |

### Distinct library components imported: median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 16 (15–16) | 8 (6–8) | 19 (18–19) | 0 (0–0) |
| 2. Settings page | 19 (19–20) | 6 (6–8) | 38 (37–38) | 0 (0–0) |
| 3. Pricing page | 15 (15–16) | 6 (6–6) | 20 (20–20) | 0 (0–0) |
| 4. Chat UI | 16 (15–17) | 5 (4–5) | 44 (42–49) | 0 (0–0) |
| 5. Marketing hero | 13 (13–13) | 6 (6–7) | 5 (2–5) | 0 (0–0) |
| 6. Auth flow | 17 (16–17) | 8 (8–11) | 26 (25–28) | 0 (0–0) |
| 7. E-commerce product card grid | 13 (13–14) | 6 (6–7) | 15 (9–17) | 0 (0–0) |
| 8. Onboarding checklist | 11 (11–11) | 7 (6–7) | 9 (9–9) | 0 (0–0) |
| 9. Data table page | 13 (12–13) | 5 (5–6) | 34 (34–36) | 0 (0–0) |
| 10. User profile popover | 15 (14–16) | 5 (5–6) | 12 (10–12) | 0 (0–0) |
| 11. Changelog/timeline page | 16 (14–16) | 5 (4–5) | 5 (5–5) | 0 (0–0) |
| 12. Feedback widget | 13 (12–14) | 8 (7–8) | 19 (13–19) | 0 (0–0) |

### axe violation rules (1440 px): median (IQR) over accepted runs

| Task | A Once UI + harness | B Once UI, memory | C Tailwind + shadcn/ui + docs | D Tailwind, memory |
|---|---|---|---|---|
| 1. Analytics dashboard | 1 (0–1) | 1 (1–2) | 2 (2–2) | 1 (0–1) |
| 2. Settings page | 1 (1–1) | 4 (3–5) | 1 (1–1) | 2 (2–3) |
| 3. Pricing page | 1 (0–1) | 1 (1–2) | 0 (0–0) | 1 (0–1) |
| 4. Chat UI | 1 (1–1) | 3 (2–5) | 3 (3–3) | 3 (2–3) |
| 5. Marketing hero | 0 (0–0) | 0 (0–0) | 1 (0–1) | 0 (0–0) |
| 6. Auth flow | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |
| 7. E-commerce product card grid | 1 (1–2) | 1 (1–1) | 1 (1–1) | 2 (1–2) |
| 8. Onboarding checklist | 1 (1–1) | 0 (0–0) | 0 (0–1) | 0 (0–0) |
| 9. Data table page | 0 (0–0) | 1 (0–1) | 1 (1–1) | 0 (0–1) |
| 10. User profile popover | 3 (2–4) | 2 (1–3) | 1 (1–1) | 1 (1–1) |
| 11. Changelog/timeline page | 1 (1–1) | 1 (0–2) | 0 (0–0) | 0 (0–0) |
| 12. Feedback widget | 0 (0–0) | 0 (0–0) | 0 (0–0) | 0 (0–0) |

### Reductions (per-task median reduction of X relative to Y; positive = X smaller)

| Pair | Metric | Tasks | Median | Range | Tasks where X < Y | 95% bootstrap CI |
|---|---|---|---|---|---|---|
| A vs C | Visible output tokens (proxy) | 12 | -9% | -46% to 35% | 4/12 | -30% to 3% |
| A vs C | Total tokens, net of Claude Code overhead (exact input + proxy output) | 12 | -717% | -1842% to -97% | 0/12 | -1078% to -464% |
| A vs C | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 12 | 21% | -24% to 54% | 9/12 | 3% to 33% |
| A vs C | Code lines, normalised | 12 | 12% | -40% to 49% | 8/12 | -7% to 20% |
| A vs C | Code bytes, normalised | 12 | 19% | -33% to 51% | 9/12 | 0% to 30% |
| A vs C | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 12 | -263% | -495% to -87% | 0/12 | -367% to -165% |
| A vs D | Visible output tokens (proxy) | 12 | -6% | -57% to 30% | 3/12 | -34% to 0% |
| A vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 12 | -2876% | -4600% to -2321% | 0/12 | -3417% to -2562% |
| A vs D | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 12 | 29% | -7% to 50% | 11/12 | 17% to 42% |
| A vs D | Code lines, normalised | 12 | 6% | -20% to 37% | 8/12 | -7% to 21% |
| A vs D | Code bytes, normalised | 12 | 22% | -14% to 46% | 10/12 | 11% to 39% |
| A vs D | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 12 | -455% | -767% to -244% | 0/12 | -480% to -348% |
| B vs C | Visible output tokens (proxy) | 12 | -25% | -74% to 3% | 1/12 | -45% to -9% |
| B vs C | Total tokens, net of Claude Code overhead (exact input + proxy output) | 12 | 51% | 9% to 87% | 12/12 | 33% to 70% |
| B vs C | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 12 | -2% | -32% to 28% | 5/12 | -14% to 8% |
| B vs C | Code lines, normalised | 12 | -4% | -54% to 18% | 4/12 | -14% to 5% |
| B vs C | Code bytes, normalised | 12 | -1% | -26% to 29% | 5/12 | -8% to 8% |
| B vs C | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 12 | 19% | -20% to 37% | 8/12 | -4% to 26% |
| B vs D | Visible output tokens (proxy) | 12 | -29% | -80% to 12% | 1/12 | -43% to -11% |
| B vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 12 | -75% | -154% to -28% | 0/12 | -117% to -43% |
| B vs D | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 12 | 6% | -27% to 48% | 9/12 | -7% to 14% |
| B vs D | Code lines, normalised | 12 | -6% | -62% to 36% | 4/12 | -26% to 4% |
| B vs D | Code bytes, normalised | 12 | 9% | -35% to 46% | 8/12 | -5% to 11% |
| B vs D | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 12 | -31% | -81% to 8% | 1/12 | -46% to -15% |
| A vs B | Visible output tokens (proxy) | 12 | 11% | -30% to 51% | 8/12 | -4% to 29% |
| A vs B | Total tokens, net of Claude Code overhead (exact input + proxy output) | 12 | -1600% | -2639% to -938% | 0/12 | -2179% to -1315% |
| A vs B | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 12 | 23% | -30% to 57% | 11/12 | 10% to 29% |
| A vs B | Code lines, normalised | 12 | 13% | -28% to 47% | 11/12 | 3% to 25% |
| A vs B | Code bytes, normalised | 12 | 16% | -31% to 55% | 11/12 | 4% to 28% |
| A vs B | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 12 | -323% | -633% to -159% | 0/12 | -388% to -212% |
| C vs D | Visible output tokens (proxy) | 12 | -4% | -33% to 26% | 4/12 | -23% to 18% |
| C vs D | Total tokens, net of Claude Code overhead (exact input + proxy output) | 12 | -246% | -1881% to -135% | 0/12 | -406% to -162% |
| C vs D | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 12 | 5% | -19% to 30% | 9/12 | 1% to 23% |
| C vs D | Code lines, normalised | 12 | -5% | -30% to 23% | 5/12 | -14% to 12% |
| C vs D | Code bytes, normalised | 12 | 3% | -17% to 29% | 7/12 | -6% to 20% |
| C vs D | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 12 | -41% | -185% to -11% | 0/12 | -77% to -28% |
| A vs C (excl. 1, 5, 8) | Visible output tokens (proxy) | 9 | -8% | -39% to 35% | 4/9 | -28% to 6% |
| A vs C (excl. 1, 5, 8) | Total tokens, net of Claude Code overhead (exact input + proxy output) | 9 | -600% | -1427% to -97% | 0/9 | -1176% to -214% |
| A vs C (excl. 1, 5, 8) | Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | 9 | 20% | -24% to 54% | 7/9 | -2% to 35% |
| A vs C (excl. 1, 5, 8) | Code lines, normalised | 9 | 13% | -40% to 49% | 6/9 | -15% to 21% |
| A vs C (excl. 1, 5, 8) | Code bytes, normalised | 9 | 20% | -33% to 51% | 7/9 | -7% to 41% |
| A vs C (excl. 1, 5, 8) | Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only) | 9 | -231% | -410% to -87% | 0/9 | -404% to -88% |

### Claim conditions, A vs C (METHODOLOGY.md §5.1)

| Metric | 1. CI lower bound > 0 | 2. X < Y on ≥ 9 tasks | 3. holds without tasks 1, 5, 8 | 4. pass rate within 10 pp | 5. ratings within 0.5 | Claim allowed |
|---|---|---|---|---|---|---|
| Visible output tokens (proxy) | **no** | **no** (4/12) | **no** | yes | yes | no |
| Total tokens, net of Claude Code overhead (exact input + proxy output) | **no** | **no** (0/12) | **no** | yes | yes | no |
| Code tokens, normalised (exact count_tokens where measured, else proxy o200k) | yes | yes (9/12) | yes | yes | yes | **yes** |
| Code lines, normalised | **no** | **no** (8/12) | yes | yes | yes | no |
| Code bytes, normalised | yes | yes (9/12) | yes | yes | yes | **yes** |

### Blinded rating (1–5): median over accepted runs, pooled across tasks

| Arm | Polish | Completeness | Responsiveness | Restraint |
|---|---|---|---|---|
| A Once UI + harness | 4 | 4 | 4 | 5 |
| B Once UI, memory | 4 | 4 | 4 | 5 |
| C Tailwind + shadcn/ui + docs | 4 | 4 | 4 | 5 |
| D Tailwind, memory | 4 | 4 | 4 | 5 |

_Once UI `validate-ai-code` issue counts (in summary.json) come from validator 46be018f1a0f7b9d. They are not comparable across runs that used different validator versions._
