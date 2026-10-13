import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UvaXtreme – Code. Compete. Conquer.",
  description:
    "UvaXtreme is a group-based coding competition presented by the IEEE Computer Society Uva Wellassa University Student Branch Chapter. Sharpen your skills, compete with the best, and win.",
  keywords: [
    "UvaXtreme",
    "hackathon",
    "IEEE",
    "Uva Wellassa University",
    "coding competition",
    "programming",
    "Sri Lanka",
  ],
  openGraph: {
    title: "UvaXtreme – Code. Compete. Conquer.",
    description:
      "A group-based coding hackathon by IEEE CS UWU Student Branch Chapter.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body>{children}</body>
    </html>
  );
}
