// Verifies room tickets signed by the Next.js app (src/lib/canvas-ticket.ts, keep in sync).
// Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256(secret, payload part)).
// The app only signs one after checking the user can open the workspace, so a valid ticket
// is proof of access; it expires within a minute and only opens the room it names.

type TicketPayload = { room: string; user: string; exp: number };

const encoder = new TextEncoder();

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export async function verifyTicket(ticket: string, room: string, secret: string): Promise<TicketPayload | null> {
  const [payloadPart, signaturePart] = ticket.split(".");
  if (!payloadPart || !signaturePart) return null;

  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "verify",
  ]);
  // crypto.subtle.verify compares in constant time.
  const valid = await crypto.subtle.verify("HMAC", key, fromBase64Url(signaturePart), encoder.encode(payloadPart));
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart))) as TicketPayload;
    if (payload.room !== room || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
