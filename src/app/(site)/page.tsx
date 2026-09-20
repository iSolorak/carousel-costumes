import Link from "next/link";
import type { Metadata } from "next";
import FadeInSection from "@/components/FadeInSection";
import Hero from "@/components/Hero";
import PageBackdrop from "@/components/PageBackdrop";
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

      <PageBackdrop />
      <FadeInSection className="flex justify-center px-5 py-20 sm:py-28">
        <Link
          href="/catalogue"
          className="group inline-flex items-center gap-3 rounded-full bg-accent px-9 py-4 text-sm font-medium tracking-wide text-white shadow-lg shadow-accent/30 transition-all hover:scale-[1.03] hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/40 active:scale-95"
        >
          View the full collection
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </FadeInSection>
    </>
  );
}
