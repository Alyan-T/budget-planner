import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

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
          <Sidebar />
          <main className="flex-1 w-full max-w-[1200px] mx-auto px-[20px] md:px-[48px] py-[32px] relative z-10 md:ml-64">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
