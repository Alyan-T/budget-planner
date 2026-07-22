import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientLayout } from "@/components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Modern Wealth Planner",
  description: "A premium AI-powered budgeting experience",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
