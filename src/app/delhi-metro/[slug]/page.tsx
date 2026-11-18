import type { Metadata } from "next";
import MetroDynamicSeoPage, {
  generateMetadata as baseGenerateMetadata,
} from "@/app/delhi-metro/route/[routeSlug]/page";

export async function generateStaticParams() {
  return ["yellow-line", "rajiv-chowk"].map((slug) => ({ slug }));
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
