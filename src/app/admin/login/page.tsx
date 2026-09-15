"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 pt-24">
      <h1 className="font-display text-2xl text-fg">Admin Login</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm text-muted">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            className="border border-border bg-bg-raised px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-muted">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="border border-border bg-bg-raised px-3 py-2 text-fg outline-none focus:border-accent"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 border border-accent px-4 py-2 text-sm tracking-widest text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-50"
        >
          {pending ? "LOGGING IN…" : "LOG IN"}
        </button>
      </form>
    </div>
  );
}
