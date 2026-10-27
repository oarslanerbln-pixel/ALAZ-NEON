import { describe, it, expect, afterEach } from "vitest";
import { getJoinUrl } from "../roomUrls";

const originalLocation = window.location;

function setLocation(loc: Pick<Location, "protocol" | "hostname" | "port" | "host">) {
  Object.defineProperty(window, "location", { value: loc, configurable: true, writable: true });
}

describe("getJoinUrl", () => {
  afterEach(() => {
    Object.defineProperty(window, "location", { value: originalLocation, configurable: true, writable: true });
  });

  it("produces join URL on localhost using __LOCAL_IP__ if defined", () => {
    // @ts-expect-error test global mock
    globalThis.__LOCAL_IP__ = "192.168.1.100";
    setLocation({ protocol: "http:", hostname: "localhost", port: "5173", host: "localhost:5173" });

    expect(getJoinUrl("ABCD")).toBe("http://192.168.1.100:5173/join?code=ABCD");
  });

  it("keeps localhost when no LAN IP is defined (build / E2E preview)", () => {
    // @ts-expect-error test global mock
    globalThis.__LOCAL_IP__ = "";
    setLocation({ protocol: "http:", hostname: "127.0.0.1", port: "4173", host: "127.0.0.1:4173" });

    expect(getJoinUrl("ABCD")).toBe("http://127.0.0.1:4173/join?code=ABCD");
  });

  it("produces join URL on production host directly", () => {
    // @ts-expect-error test global mock
    globalThis.__LOCAL_IP__ = "192.168.1.100";
    setLocation({ protocol: "https:", hostname: "hengametv.com", port: "", host: "hengametv.com" });

    expect(getJoinUrl("WXYZ")).toBe("https://hengametv.com/join?code=WXYZ");
  });

  it("handles empty or null code cleanly", () => {
    setLocation({ protocol: "https:", hostname: "hengametv.com", port: "", host: "hengametv.com" });

    expect(getJoinUrl()).toBe("https://hengametv.com/join");
  });
});
