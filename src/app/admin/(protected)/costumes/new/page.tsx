import { createCostumeAction } from "@/app/admin/actions";
import CostumeForm from "@/components/admin/CostumeForm";

export default function NewCostumePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-fg">Add Costume</h1>
      <CostumeForm action={createCostumeAction} submitLabel="ADD COSTUME" />
    </div>
  );
}
