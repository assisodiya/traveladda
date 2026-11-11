import type { Metadata } from "next";
import MetroDynamicSeoPage, {
  generateMetadata as baseGenerateMetadata,
} from "@/app/metro/[routeSlug]/page";

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
    "rajiv-chowk",
    "new-delhi",
    "kashmere-gate",
    "huda-city-centre",
    "mg-road",
    "anand-vihar",
    "igi-airport",
    "noida-electronic-city",
    "hauz-khas",
    "botanical-garden",
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

