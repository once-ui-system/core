import { describe, expect, it } from "vitest";
import { escapeHtml, safeScriptJson, sanitizeHref } from "../utils/safe-html";

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

describe("sanitizeHref", () => {
  it("allows http(s), mailto, tel, sms, and relative hrefs", () => {
    expect(sanitizeHref("https://example.com")).toBe("https://example.com");
    expect(sanitizeHref("http://example.com/path")).toBe("http://example.com/path");
    expect(sanitizeHref("mailto:hi@example.com")).toBe("mailto:hi@example.com");
    expect(sanitizeHref("tel:+15551212")).toBe("tel:+15551212");
    expect(sanitizeHref("sms:+15551212")).toBe("sms:+15551212");
    expect(sanitizeHref("/docs")).toBe("/docs");
    expect(sanitizeHref("#section")).toBe("#section");
    expect(sanitizeHref("?q=1")).toBe("?q=1");
  });

  it("blocks javascript and data schemes", () => {
    expect(sanitizeHref("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeHref("JAVASCRIPT:alert(1)")).toBeUndefined();
    expect(sanitizeHref(" data:text/html,hi ")).toBeUndefined();
    expect(sanitizeHref("vbscript:msgbox(1)")).toBeUndefined();
  });

  it("blocks schemes with embedded whitespace or control characters", () => {
    expect(sanitizeHref("java\nscript:alert(1)")).toBeUndefined();
    expect(sanitizeHref("java\tscript:alert(1)")).toBeUndefined();
  });

  it("returns undefined for empty values", () => {
    expect(sanitizeHref(undefined)).toBeUndefined();
    expect(sanitizeHref(null)).toBeUndefined();
    expect(sanitizeHref("   ")).toBeUndefined();
  });
});
