"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, ReceiptText, PiggyBank, LogOut, CalendarClock, MessageSquareText, Target, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === "/login") return null;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ReceiptText },
    { href: "/budgets", label: "Budgets", icon: PiggyBank },
    { href: "/subscriptions", label: "Bills", icon: CalendarClock },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/advisor", label: "Advisor", icon: MessageSquareText },
  ];

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-surface-dim overflow-y-auto">
        <div className="p-6">
          <div className="flex flex-col items-center gap-3 mb-10">
             <div className="w-16 h-16 rounded-2xl bg-surface-dim flex items-center justify-center overflow-hidden shadow-soft">
               <Image src="/images/main.png" alt="Logo" width={64} height={64} className="object-cover w-full h-full" />
             </div>
             <span className="text-xl font-black tracking-tight text-primary text-center leading-tight">Modern Wealth<br/>Planner</span>
          </div>
          
          <nav className="flex flex-col gap-2">
            {links.map((l) => {
              const isActive = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-on-primary shadow-soft"
                      : "text-on-surface-variant hover:bg-surface-dim hover:text-primary"
                  }`}
                >
                  <Icon size={18} />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 flex flex-col gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-[14px] font-bold text-on-surface-variant hover:bg-surface-dim hover:text-primary transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          )}

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-[14px] font-bold text-error hover:bg-error-bg transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav Row (Bottom or Top) */}
      <nav className="md:hidden flex overflow-x-auto px-[20px] py-4 gap-3 bg-surface border-b border-surface-dim sticky top-0 z-50">
        <div className="flex items-center gap-3 mr-4">
           <div className="w-10 h-10 rounded-xl bg-surface-dim flex items-center justify-center overflow-hidden flex-shrink-0">
             <Image src="/images/main.png" alt="Logo" width={40} height={40} className="object-cover w-full h-full" />
           </div>
        </div>
        {links.map((l) => {
          const isActive = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-on-primary shadow-soft"
                  : "bg-surface-dim text-on-surface-variant"
              }`}
            >
              <Icon size={16} />
              {l.label}
            </Link>
          );
        })}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center px-4 py-2.5 bg-surface-dim text-on-surface-variant rounded-2xl whitespace-nowrap font-bold"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}
      </nav>
    </>
  );
}
