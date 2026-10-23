import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getJoinUrl } from "../roomUrls";

describe("getJoinUrl", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // @ts-expect-error test mock
    delete window.location;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("produces join URL on localhost using __LOCAL_IP__ if defined", () => {
    // @ts-expect-error test global mock
    globalThis.__LOCAL_IP__ = "192.168.1.100";
    window.location = {
      protocol: "http:",
      hostname: "localhost",
      port: "5173",
      host: "localhost:5173",
    } as Location;

    expect(getJoinUrl("ABCD")).toBe("http://192.168.1.100:5173/join?code=ABCD");
  });

  it("produces join URL on production host directly", () => {
    // @ts-expect-error test global mock
    globalThis.__LOCAL_IP__ = "192.168.1.100";
    window.location = {
      protocol: "https:",
      hostname: "hengametv.com",
      port: "",
      host: "hengametv.com",
    } as Location;

    expect(getJoinUrl("WXYZ")).toBe("https://hengametv.com/join?code=WXYZ");
  });

  it("handles empty or null code cleanly", () => {
    window.location = {
      protocol: "https:",
      hostname: "hengametv.com",
      port: "",
      host: "hengametv.com",
    } as Location;

    expect(getJoinUrl()).toBe("https://hengametv.com/join");
  });
});
