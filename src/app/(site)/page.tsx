import Link from "next/link";
import type { Metadata } from "next";
import FadeInSection from "@/components/FadeInSection";
import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import { getFeaturedCostumes } from "@/lib/costumes";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const featured = await getFeaturedCostumes();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />

      {featured.length > 0 && <ProductCarousel costumes={featured} />}

      <FadeInSection className="flex flex-col items-center gap-6 px-5 py-24 text-center">
        <h2 className="font-display text-2xl text-fg sm:text-3xl">
          See the full collection
        </h2>
        <Link
          href="/catalogue"
          className="border border-accent px-6 py-3 text-sm tracking-widest text-accent transition-colors hover:bg-accent hover:text-bg"
        >
          VIEW CATALOGUE
        </Link>
      </FadeInSection>
    </>
  );
}
