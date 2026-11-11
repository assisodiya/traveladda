import {
  buildMetroRouteSlug,
  POPULAR_METRO_ROUTES,
} from "@/lib/metro-types";

export {
  default,
  generateMetadata,
} from "@/app/metro/[routeSlug]/page";

export async function generateStaticParams() {
  return POPULAR_METRO_ROUTES.map((r) => ({
    routeSlug: buildMetroRouteSlug(r.fromSlug, r.toSlug),
  }));
}

