You are rating a screenshot set of one generated web page. You do not know, and should not guess, which technology produced it.

Task the page was built for: {{TASK}}

You get three full-page screenshots of the same page, at 375 px (phone), 768 px (tablet) and 1440 px (desktop) wide.

Score each axis from 1 (poor) to 5 (excellent):

- polish: consistent spacing rhythm, type scale and surface hierarchy; looks like a carefully designed product page.
- completeness: every element the task asks for is present and plausible (judge only what is visible; interactive states may be hidden).
- responsiveness: the layout adapts sensibly across the three widths; nothing overflows, overlaps or becomes unusable.
- restraint: effects and decoration support the content rather than dominate it.

Reply with only a JSON object: {"id": "{{ID}}", "polish": n, "completeness": n, "responsiveness": n, "restraint": n, "note": "one short sentence"}
