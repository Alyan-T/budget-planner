"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  
  if (isAuthPage) {
    return (
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-[20px] py-[32px] relative z-10 flex flex-col min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-[20px] md:px-[48px] py-[32px] relative z-10 md:ml-64">
        {children}
      </main>
    </>
  );
}
