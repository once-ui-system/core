import { describe, expect, it } from "vitest";
import { escapeHtml, safeScriptJson } from "../utils/safe-html";

describe("safeScriptJson", () => {
  it("escapes closing script tags in string values", () => {
    const payload = { title: "</script><script>alert(1)</script>" };
    const serialized = safeScriptJson(payload);

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
    expect(JSON.parse(serialized.replace(/\\u003c/g, "<"))).toEqual(payload);
  });

  it("escapes less-than in nested schema author fields", () => {
    const schema = {
      "@context": "https://schema.org",
      author: { name: "<img src=x onerror=alert(1)>" },
    };

    const serialized = safeScriptJson(schema);

    expect(serialized).not.toContain("<img");
    expect(serialized).toContain("\\u003cimg");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML metacharacters", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });

  it("escapes ampersands first", () => {
    expect(escapeHtml("a & b < c")).toBe("a &amp; b &lt; c");
  });
});
