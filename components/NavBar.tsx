"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  if (pathname === "/login") return null;

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Transactions" },
    { href: "/budgets", label: "Budgets" },
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex gap-6">
        <span className="font-medium">Budget Planner</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "font-medium" : "text-gray-500"}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <button onClick={signOut} className="text-sm text-gray-500">
        Sign out
      </button>
    </nav>
  );
}
