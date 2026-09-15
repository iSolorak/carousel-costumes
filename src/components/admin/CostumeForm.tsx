"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

type FormState = { error: string } | undefined;
type FormAction = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

export default function CostumeForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: FormAction;
  initialValues?: {
    title: string;
    description: string;
    featured: boolean;
    imageUrl: string | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [preview, setPreview] = useState<string | null>(
    initialValues?.imageUrl ?? null
  );

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-sm text-muted">
          Image {initialValues ? "(leave empty to keep current)" : ""}
        </label>
        {preview && (
          <div className="relative mb-2 aspect-[3/4] w-40 overflow-hidden rounded-sm bg-bg-raised">
            <Image src={preview} alt="" fill className="object-cover" />
          </div>
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required={!initialValues}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="text-sm text-muted file:mr-4 file:border file:border-border file:bg-bg-raised file:px-3 file:py-2 file:text-fg"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm text-muted">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialValues?.title}
          className="border border-border bg-bg-raised px-3 py-2 text-fg outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-muted">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          defaultValue={initialValues?.description}
          className="border border-border bg-bg-raised px-3 py-2 text-fg outline-none focus:border-accent"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={initialValues?.featured}
          className="h-4 w-4 accent-[var(--color-accent)]"
        />
        Feature on the homepage spotlight
      </label>

      {state?.error && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start border border-accent px-5 py-2 text-sm tracking-widest text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-50"
      >
        {pending ? "SAVING…" : submitLabel}
      </button>
    </form>
  );
}
