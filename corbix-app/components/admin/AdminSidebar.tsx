"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/cms/services", label: "CMS / Services" },
  { href: "/admin/cms/pages", label: "CMS / Pages" },
  { href: "/admin/cms/programs", label: "CMS / Programs" },
  { href: "/admin/cms/case-studies", label: "CMS / Case Studies" },
  { href: "/admin/cms/careers", label: "CMS / Careers" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-full border-r border-white/10 bg-surface md:w-72">
      <div className="p-5">
        <p className="font-display text-2xl text-white">Corbrix Admin</p>
      </div>
      <nav className="space-y-1 px-3 pb-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-white",
              pathname === item.href && "bg-white/10 text-white",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3">
        <Button variant="outline" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
