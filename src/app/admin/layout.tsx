export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">{children}</div>
    </div>
  );
}
