import "server-only";

import { isCanvasSyncConfigured } from "./canvas-ticket";

/**
 * tldraw hides its editor a few seconds after loading on a production domain without a license key
 * (localhost is always allowed). Production builds without one show an explanation instead of
 * an editor that vanishes.
 */
export function hasTldrawLicense() {
  return Boolean(process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY) || process.env.NODE_ENV !== "production";
}

/** Whether the live canvas can run, or why not. */
export function getCanvasAvailability(): "ready" | "no-sync" | "no-license" {
  if (!isCanvasSyncConfigured()) return "no-sync";
  if (!hasTldrawLicense()) return "no-license";
  return "ready";
}
