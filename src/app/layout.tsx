import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import ScrollReveal from "@/components/ScrollReveal";
import { Analytics } from "@vercel/analytics/next";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-serif",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const description =
  "Procrastination is not laziness. It is a freeze response from a dysregulated nervous system. Alight uses 2-minute somatic resets to help you calm down and start. Take the free 2-minute quiz.";

export const metadata: Metadata = {
  metadataBase: new URL("https://alight.vercel.app"),
  title: {
    default: "Alight: stop procrastinating by regulating your nervous system",
    template: "%s · Alight",
  },
  description,
  applicationName: "Alight",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "Alight", statusBarStyle: "default" },
  keywords: [
    "procrastination",
    "nervous system regulation",
    "somatic",
    "polyvagal",
    "anxiety",
    "focus",
    "freeze response",
  ],
  openGraph: {
    title: "Alight: stop procrastinating by regulating your nervous system",
    description,
    url: "/",
    siteName: "Alight",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Alight", description },
};

export const viewport: Viewport = {
  themeColor: "#FFF6FB",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body>
        {children}
        <PWARegister />
        <ScrollReveal />
        <Analytics />
      </body>
    </html>
  );
}
