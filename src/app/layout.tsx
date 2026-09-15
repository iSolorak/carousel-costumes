import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import TorchLight from "@/components/TorchLight";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const flaviotte = localFont({
  src: "../fonts/Flaviotte.woff2",
  variable: "--font-flaviotte",
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
      className={`${geistSans.variable} ${flaviotte.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <TorchLight />
        {children}
      </body>
    </html>
  );
}
