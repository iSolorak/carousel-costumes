"use client";

import { useTransition } from "react";
import { deleteCostumeAction } from "@/app/admin/actions";

export default function DeleteCostumeButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
        startTransition(() => {
          deleteCostumeAction(id);
        });
      }}
      className="text-sm text-red-700 hover:text-red-800 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
