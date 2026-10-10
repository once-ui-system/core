// @vitest-environment node
import { describe, expect, it } from "vitest";
import { classifyHostname, isPublicIpAddress, parseIPv4, parseIPv6 } from "../server/og-address";

const dotted = (value: number | null) =>
  value === null
    ? null
    : [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join(".");

describe("parseIPv4", () => {
  it("reads every form the URL parser and inet_aton accept", () => {
    expect(dotted(parseIPv4("127.0.0.1"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("2130706433"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("0x7f000001"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("0x7f.1"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("0x7F.0.0.1"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("017700000001"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("0177.0.0.1"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("127.1"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("127.0.1"))).toBe("127.0.0.1");
    expect(dotted(parseIPv4("169.254.43518"))).toBe("169.254.169.254");
    expect(dotted(parseIPv4("0xa9fea9fe"))).toBe("169.254.169.254");
    expect(dotted(parseIPv4("10.0.0.1."))).toBe("10.0.0.1");
    expect(dotted(parseIPv4("0"))).toBe("0.0.0.0");
  });

  it("rejects what is not an IPv4 address", () => {
    for (const input of [
      "",
      "256.0.0.1",
      "1.2.3.4.5",
      "4294967296",
      "1.16777216",
      "08.0.0.1",
      "0x1g.0.0.1",
      "example.com",
      "1..2.3",
    ]) {
      expect(parseIPv4(input), input).toBeNull();
    }
  });
});

describe("parseIPv6", () => {
  it("reads compressed, bracketed and dotted-tail forms", () => {
    expect(parseIPv6("::")).toBe(0n);
    expect(parseIPv6("::1")).toBe(1n);
    expect(parseIPv6("[::1]")).toBe(1n);
    expect(parseIPv6("::ffff:127.0.0.1")).toBe(parseIPv6("::ffff:7f00:1"));
    expect(parseIPv6("0:0:0:0:0:0:0:1")).toBe(1n);
    expect(parseIPv6("FD00:EC2::254")).toBe(parseIPv6("fd00:ec2:0:0:0:0:0:254"));
  });

  it("rejects malformed addresses and zone identifiers", () => {
    for (const input of [
      "1:2:3:4:5:6:7",
      "1::2::3",
      "1:2:3:4:5:6:7:8:9",
      "12345::",
      "fe80::1%eth0",
    ]) {
      expect(parseIPv6(input), input).toBeNull();
    }
  });
});

describe("isPublicIpAddress", () => {
  it.each([
    ["0.0.0.0", "unspecified"],
    ["0.1.2.3", "this network"],
    ["10.0.0.1", "private"],
    ["10.255.255.255", "private"],
    ["100.64.0.1", "carrier-grade NAT"],
    ["100.100.100.200", "carrier-grade NAT (cloud metadata)"],
    ["100.127.255.255", "carrier-grade NAT"],
    ["127.0.0.1", "loopback"],
    ["127.255.255.254", "loopback"],
    ["169.254.0.1", "link-local"],
    ["169.254.169.254", "cloud metadata"],
    ["172.16.0.1", "private"],
    ["172.31.255.255", "private"],
    ["192.0.0.192", "IETF assignments (cloud metadata)"],
    ["192.0.2.1", "documentation"],
    ["192.88.99.1", "6to4 relay"],
    ["192.168.1.1", "private"],
    ["198.18.0.1", "benchmarking"],
    ["198.19.255.255", "benchmarking"],
    ["198.51.100.1", "documentation"],
    ["203.0.113.1", "documentation"],
    ["224.0.0.1", "multicast"],
    ["239.255.255.250", "multicast"],
    ["240.0.0.1", "reserved"],
    ["255.255.255.255", "broadcast"],
  ])("refuses IPv4 %s (%s)", (address) => {
    expect(isPublicIpAddress(address)).toBe(false);
  });

  it.each([
    ["::", "unspecified"],
    ["::1", "loopback"],
    ["::ffff:127.0.0.1", "IPv4-mapped loopback"],
    ["::ffff:7f00:1", "IPv4-mapped loopback, hex"],
    ["::ffff:10.0.0.1", "IPv4-mapped private"],
    ["::ffff:169.254.169.254", "IPv4-mapped metadata"],
    ["::ffff:0:127.0.0.1", "IPv4-translated loopback"],
    ["::127.0.0.1", "IPv4-compatible"],
    ["::8.8.8.8", "IPv4-compatible (deprecated)"],
    ["64:ff9b::7f00:1", "NAT64 of loopback"],
    ["64:ff9b::a9fe:a9fe", "NAT64 of metadata"],
    ["64:ff9b:1::1", "local-use NAT64"],
    ["100::1", "discard"],
    ["fc00::1", "unique local"],
    ["fd12:3456::1", "unique local"],
    ["fd00:ec2::254", "cloud metadata"],
    ["fe80::1", "link-local"],
    ["febf::1", "link-local"],
    ["fec0::1", "site-local"],
    ["ff02::1", "multicast"],
    ["ff05::1:3", "multicast"],
    ["2001::1", "Teredo"],
    ["2001:2::1", "benchmarking"],
    ["2001:db8::1", "documentation"],
    ["2002:7f00:1::1", "6to4"],
    ["3fff::1", "documentation"],
    ["fe80::1%eth0", "zone identifier"],
  ])("refuses IPv6 %s (%s)", (address) => {
    expect(isPublicIpAddress(address)).toBe(false);
  });

  it.each([
    "8.8.8.8",
    "1.1.1.1",
    "93.184.216.34",
    "100.63.255.255",
    "100.128.0.0",
    "172.15.255.255",
    "172.32.0.0",
    "192.0.3.1",
    "198.17.255.255",
    "198.20.0.0",
    "223.255.255.255",
    "2606:4700:4700::1111",
    "2001:4860:4860::8888",
    "2a00:1450:4001::200e",
    "::ffff:8.8.8.8",
    "64:ff9b::808:808",
  ])("allows public %s", (address) => {
    expect(isPublicIpAddress(address)).toBe(true);
  });

  it("refuses what is not an address", () => {
    expect(isPublicIpAddress("example.com")).toBe(false);
    expect(isPublicIpAddress("")).toBe(false);
    expect(isPublicIpAddress("2130706433")).toBe(false);
  });
});

describe("classifyHostname", () => {
  it.each([
    "localhost",
    "LOCALHOST",
    "localhost.",
    "app.localhost",
    "printer.local",
    "metadata",
    "metadata.google.internal",
    "service.internal",
    "router.home.arpa",
    "nas.lan",
    "intranet",
    "127.0.0.1",
    "2130706433",
    "0x7f.1",
    "0177.0.0.1",
    "127.1",
    "169.254.169.254",
    "[::1]",
    "[::ffff:7f00:1]",
    "[fd00:ec2::254]",
    "[fe80::1]",
    "[not-an-address]",
    "",
  ])("blocks %s", (hostname) => {
    expect(classifyHostname(hostname)).toBe("blocked");
  });

  it("passes public IP literals and names", () => {
    expect(classifyHostname("8.8.8.8")).toBe("ip");
    expect(classifyHostname("[2606:4700:4700::1111]")).toBe("ip");
    expect(classifyHostname("example.com")).toBe("name");
    expect(classifyHostname("example.com.")).toBe("name");
    expect(classifyHostname("cdn.example.co.uk")).toBe("name");
  });
});
