"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ReceiptText, PiggyBank, LogOut, CalendarClock, MessageSquareText, Target } from "lucide-react";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

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
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-surface-dim">
      <div className="max-w-[1440px] mx-auto px-[20px] md:px-[32px] h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center overflow-hidden">
               {/* Placeholder for avatar */}
               <div className="w-6 h-6 bg-surface-bright rounded-full mt-2" />
             </div>
             <span className="text-[22px] font-bold tracking-tight text-primary">Financier</span>
          </div>
          
          <div className="hidden md:flex gap-4 ml-8">
            {links.map((l) => {
              const isActive = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-dim hover:text-primary"
                  }`}
                >
                  <Icon size={16} />
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center justify-center w-10 h-10 rounded-full text-on-surface-variant hover:bg-surface-dim transition-all"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex overflow-x-auto px-[20px] py-3 gap-3 bg-background border-b border-surface-dim">
        {links.map((l) => {
          const isActive = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "bg-surface text-on-surface-variant border border-surface-dim"
              }`}
            >
              <Icon size={16} />
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
