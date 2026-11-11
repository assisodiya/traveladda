import type { Metadata } from "next";
import MetroDynamicSeoPage, {
  generateMetadata as baseGenerateMetadata,
} from "@/app/delhi-metro/route/[routeSlug]/page";

export async function generateStaticParams() {
  return [
    "red-line",
    "yellow-line",
    "blue-line",
    "blue-line-vaishali",
    "green-line",
    "violet-line",
    "pink-line",
    "magenta-line",
    "grey-line",
    "airport-express-line",
    "gurgaon-rapid-metro",
    "noida-aqua-line",
    "mg-road",
    "anand-vihar",
    "rajiv-chowk",
    "new-delhi",
    "kashmere-gate",
    "huda-city-centre",
    "igi-airport",
    "noida-electronic-city",
  ].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return baseGenerateMetadata({
    params: Promise.resolve({ routeSlug: slug }),
  });
}

export default async function DelhiMetroSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return MetroDynamicSeoPage({
    params: Promise.resolve({ routeSlug: slug }),
  });
}
