import { notFound } from "next/navigation";

// Always a 404, so there is no page for instant-navigation validation to render.
export const instant = false;

// Unknown URLs inside a locale render [lang]/not-found.tsx, in the site's layout and language,
// instead of Next's unstyled default.
export default function MissingPage() {
  notFound();
}
