import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Syne } from "next/font/google";
import { AmbientBackground } from "../components/AmbientBackground";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-hero",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ClawCFO - Autonomous On-Chain Wealth Manager",
  description:
    "Set financial rules once. Your AI agent monitors, rebalances, and executes - with every decision verified on-chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${plusJakarta.variable}`}>
      <body>
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
