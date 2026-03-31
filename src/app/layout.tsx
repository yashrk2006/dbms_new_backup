import type { Metadata } from "next";
import { Inter, Public_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const dmMono = DM_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SkillSync | Professional Talent Platform",
  description: "Advanced career development and professional internship matching platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${publicSans.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground font-body antialiased relative overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Premium Background Architecture */}
          <div className="fixed inset-0 pointer-events-none z-[-1]" suppressHydrationWarning>
             <div className="absolute inset-0 bg-mesh-gradient opacity-100" suppressHydrationWarning />
             <div className="absolute inset-0 bg-grid-pattern opacity-100" suppressHydrationWarning />
          </div>

          {/* Global Frame Overlay */}
          <div className="fixed inset-0 pointer-events-none border border-border/5 z-20" suppressHydrationWarning />

          <div className="relative z-10" suppressHydrationWarning>
            <ToasterProvider />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
