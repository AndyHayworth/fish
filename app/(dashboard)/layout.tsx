"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Plus, Settings, Ship, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", icon: LayoutGrid, label: "Board" },
  { href: "/dashboard/shipments", icon: Ship, label: "Shipments" },
  { href: "/dashboard/profile", icon: Settings, label: "Profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1B6B4A] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🐟</span>
            </div>
            <span className="font-bold text-[#1B6B4A] text-lg">StockBoard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/board/add"
              className="flex items-center gap-1.5 bg-[#1B6B4A] text-white text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-[#134e37] transition-colors"
            >
              <Plus size={16} />
              Add item
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-30 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                  active ? "text-[#1B6B4A]" : "text-gray-400"
                )}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
