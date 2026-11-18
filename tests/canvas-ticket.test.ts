import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signCanvasTicket } from "@/lib/canvas-ticket";
import { verifyTicket } from "../tldraw-sync/src/ticket";

// The app signs tickets with Node's crypto and the Cloudflare Worker verifies them with WebCrypto.
// These run both real implementations against each other, so the two can't drift apart.
const SECRET = "test-secret-at-least-32-characters-long";

describe("canvas sync tickets", () => {
  beforeEach(() => {
    vi.stubEnv("CANVAS_SYNC_SECRET", SECRET);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("opens the room it was signed for", async () => {
    const ticket = signCanvasTicket("workspace-1", "user-1");
    await expect(verifyTicket(ticket, "workspace-1", SECRET)).resolves.toMatchObject({
      room: "workspace-1",
      user: "user-1",
    });
  });

  it("does not open any other room", async () => {
    const ticket = signCanvasTicket("workspace-1", "user-1");
    await expect(verifyTicket(ticket, "workspace-2", SECRET)).resolves.toBeNull();
  });

  it("is rejected under a different secret", async () => {
    const ticket = signCanvasTicket("workspace-1", "user-1");
    await expect(verifyTicket(ticket, "workspace-1", "another-secret-of-the-same-length!!!!!")).resolves.toBeNull();
  });

  it("expires after a minute", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const ticket = signCanvasTicket("workspace-1", "user-1");
    vi.setSystemTime(Date.now() + 61_000);
    await expect(verifyTicket(ticket, "workspace-1", SECRET)).resolves.toBeNull();
  });

  it("rejects a payload edited to name another room", async () => {
    const [, signature] = signCanvasTicket("workspace-1", "user-1").split(".");
    const forged = Buffer.from(JSON.stringify({ room: "workspace-2", user: "user-1", exp: 9_999_999_999 })).toString(
      "base64url",
    );
    await expect(verifyTicket(`${forged}.${signature}`, "workspace-2", SECRET)).resolves.toBeNull();
  });

  it("rejects malformed tickets", async () => {
    await expect(verifyTicket("not-a-ticket", "workspace-1", SECRET)).resolves.toBeNull();
    await expect(verifyTicket("", "workspace-1", SECRET)).resolves.toBeNull();
  });

  it("refuses to sign without a secret", () => {
    vi.stubEnv("CANVAS_SYNC_SECRET", "");
    expect(() => signCanvasTicket("workspace-1", "user-1")).toThrow();
  });
});
