import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import PageTransition from "@/components/PageTransition";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <PageTransition />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
