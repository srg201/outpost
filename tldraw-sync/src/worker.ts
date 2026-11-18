import { verifyTicket } from "./ticket";

export { TldrawRoom } from "./TldrawRoom";

// GET /connect/<workspaceId>?sessionId=…&ticket=… upgrades to a WebSocket on that workspace's
// room (one Durable Object per canvas), but only with a valid ticket from the app.
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/connect\/([\w-]+)$/);
    if (!match) return new Response("Not found", { status: 404 });
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });

    const room = match[1];
    const ticket = url.searchParams.get("ticket");
    if (!ticket || !env.CANVAS_SYNC_SECRET || !(await verifyTicket(ticket, room, env.CANVAS_SYNC_SECRET))) {
      return new Response("Forbidden", { status: 403 });
    }

    return env.TLDRAW_ROOM.get(env.TLDRAW_ROOM.idFromName(room)).fetch(request);
  },
};
