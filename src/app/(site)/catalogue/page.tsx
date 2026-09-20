import type { Metadata } from "next";
import CatalogueGrid from "@/components/CatalogueGrid";
import PageBackdrop from "@/components/PageBackdrop";
import { getAllCostumes } from "@/lib/costumes";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Browse the full costume collection.",
  alternates: { canonical: "/catalogue" },
};

export default async function CataloguePage() {
  const costumes = await getAllCostumes();

  return (
    <>
      <PageBackdrop />
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
        <h1 className="font-display text-3xl text-fg sm:text-4xl">
          The Collection
        </h1>

        {costumes.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            Costumes coming soon.
          </p>
        ) : (
          <div className="mt-10">
            <CatalogueGrid costumes={costumes} />
          </div>
        )}
      </section>
    </>
  );
}
