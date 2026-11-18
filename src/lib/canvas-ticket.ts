import "server-only";

import { createHmac } from "node:crypto";

// Signs the short-lived tickets the canvas sync Worker accepts (tldraw-sync/src/ticket.ts
// verifies them, keep the two in sync). Format: base64url(JSON payload) + "." +
// base64url(HMAC-SHA256(secret, payload part)). Signed only after the access check, so holding a
// ticket proves access; it opens just the one room and expires within a minute.

const TICKET_TTL_SECONDS = 60;

export function isCanvasSyncConfigured() {
  return Boolean(process.env.CANVAS_SYNC_SECRET && process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL);
}

export function signCanvasTicket(room: string, userId: string) {
  const secret = process.env.CANVAS_SYNC_SECRET;
  if (!secret) throw new Error("CANVAS_SYNC_SECRET is not set");

  const payload = { room, user: userId, exp: Math.floor(Date.now() / 1000) + TICKET_TTL_SECONDS };
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payloadPart).digest("base64url");
  return `${payloadPart}.${signature}`;
}
