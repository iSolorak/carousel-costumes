import type { Metadata, Viewport } from "next";
import { Alegreya, Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import TorchLight from "@/components/TorchLight";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Replaces the (Latin-only) self-hosted Flaviotte as the site's display
// font — same warm, characterful, slightly bold boutique feel, but with
// real Greek + Greek Extended glyph coverage.
const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin", "greek"],
  weight: ["700"],
  style: ["normal", "italic"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Handmade Costume Collection`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Handmade Costume Collection`,
    description: SITE_DESCRIPTION,
    images: ["/hero/spotlight-reveal.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Handmade Costume Collection`,
    description: SITE_DESCRIPTION,
    images: ["/hero/spotlight-reveal.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2a1830",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${alegreya.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <TorchLight />
        {children}
      </body>
    </html>
  );
}
