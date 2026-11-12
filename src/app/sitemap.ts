import type { MetadataRoute } from "next";
import { buildAllSitemapEntries } from "@/lib/sitemap-builder";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildAllSitemapEntries();
}
