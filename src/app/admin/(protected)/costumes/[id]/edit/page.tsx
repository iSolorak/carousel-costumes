import { notFound } from "next/navigation";
import { updateCostumeAction } from "@/app/admin/actions";
import { getCostumeById, uploadUrl } from "@/lib/costumes";
import CostumeForm from "@/components/admin/CostumeForm";

export default async function EditCostumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const costume = await getCostumeById(id);
  if (!costume) notFound();

  const action = updateCostumeAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-fg">Edit Costume</h1>
      <CostumeForm
        action={action}
        submitLabel="SAVE CHANGES"
        initialValues={{
          title: costume.title,
          description: costume.description,
          featured: costume.featured,
          imageUrl: uploadUrl(costume.imagePath),
        }}
      />
    </div>
  );
}
