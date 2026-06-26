"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background text-white md:flex">
      <AdminSidebar />
      <main className="w-full p-4 md:p-6">{children}</main>
    </div>
  );
}
