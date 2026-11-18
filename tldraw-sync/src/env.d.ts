interface Env {
  TLDRAW_ROOM: DurableObjectNamespace;
  /** HMAC key shared with the Next.js app, which signs room tickets with it. */
  CANVAS_SYNC_SECRET: string;
}
