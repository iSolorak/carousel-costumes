"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { generateCredentialsAction } from "@/app/admin/actions";

export default function AdminSetupPage() {
  const [state, formAction, pending] = useActionState(
    generateCredentialsAction,
    undefined
  );
  const [copied, setCopied] = useState(false);

  async function copyEnvBlock() {
    if (!state?.envBlock) return;
    try {
      await navigator.clipboard.writeText(state.envBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — user can still select/copy manually.
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 pt-24">
      <div>
        <h1 className="font-display text-2xl text-fg">Set up admin access</h1>
        <p className="mt-2 text-sm text-muted">
          Pick a username and password. This generates the values to paste
          into your <code className="text-fg">.env</code> file — no terminal
          commands needed. Restart the server after saving for the new
          credentials to take effect.
        </p>
      </div>

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
            minLength={8}
            autoComplete="new-password"
            className="border border-border bg-bg-raised px-3 py-2 text-fg outline-none focus:border-accent"
          />
          <span className="text-xs text-muted">At least 8 characters.</span>
        </div>

        {state?.error && (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 border border-accent px-4 py-2 text-sm tracking-widest text-accent transition-colors hover:bg-accent hover:text-bg disabled:opacity-50"
        >
          {pending ? "GENERATING…" : "GENERATE"}
        </button>
      </form>

      {state?.envBlock && (
        <div className="flex flex-col gap-2 border border-border bg-bg-raised p-4">
          <p className="text-sm text-muted">
            Paste this into <code className="text-fg">.env</code>, then
            restart the server:
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-fg">
            {state.envBlock}
          </pre>
          <button
            type="button"
            onClick={copyEnvBlock}
            className="self-start border border-border px-3 py-1 text-xs tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      )}

      <Link href="/admin/login" className="text-sm text-muted hover:text-accent">
        Back to login
      </Link>
    </div>
  );
}
