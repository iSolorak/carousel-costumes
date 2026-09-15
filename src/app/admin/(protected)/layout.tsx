import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="flex items-center justify-between border-b border-border pb-6">
        <Link href="/admin/dashboard" className="font-display text-xl text-fg">
          Admin
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm tracking-wide text-muted hover:text-accent"
          >
            Log out
          </button>
        </form>
      </header>
      <div className="pt-8">{children}</div>
    </div>
  );
}
