import Image from "next/image";
import Link from "next/link";
import { getAllCostumes, uploadUrl } from "@/lib/costumes";
import DeleteCostumeButton from "@/components/admin/DeleteCostumeButton";

export default async function AdminDashboardPage() {
  const costumes = await getAllCostumes();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-fg">Costumes</h1>
        <Link
          href="/admin/costumes/new"
          className="border border-accent px-4 py-2 text-sm tracking-wide text-accent hover:bg-accent hover:text-bg"
        >
          + Add new
        </Link>
      </div>

      {costumes.length === 0 ? (
        <p className="text-sm text-muted">No costumes yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {costumes.map((costume) => {
            const image = uploadUrl(costume.imagePath);
            return (
              <li
                key={costume.id}
                className="flex items-center gap-4 py-4"
              >
                {image && (
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-bg-raised">
                    <Image
                      src={image}
                      alt={costume.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-fg">{costume.title}</p>
                  {costume.featured && (
                    <span className="text-xs tracking-wide text-accent">
                      Featured on Home
                    </span>
                  )}
                </div>
                <Link
                  href={`/admin/costumes/${costume.id}/edit`}
                  className="text-sm text-muted hover:text-accent"
                >
                  Edit
                </Link>
                <DeleteCostumeButton id={costume.id} title={costume.title} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
