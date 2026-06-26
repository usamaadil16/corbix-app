"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Service } from "@/types/database";
import { getServiceHref } from "@/lib/cms/get-services";
import { smoothScrollToTop } from "@/lib/scroll";

type HeaderProps = {
  services: Service[];
};

export function Header({ services }: HeaderProps) {
  const pathname = usePathname();
  const [isSolid, setIsSolid] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const servicesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setIsSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the services dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!showServices) return;
    const onPointerDown = (event: MouseEvent) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setShowServices(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showServices]);

  const handleHomeClick = (event: React.MouseEvent) => {
    // On the landing page, return to the very top (outside the tunnel)
    if (pathname === "/") {
      event.preventDefault();
      setShowServices(false);
      smoothScrollToTop();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b border-transparent transition-all ${
        isSolid ? "border-white/10 bg-surface/95 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-xl tracking-wide text-white">
          Corbrix
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/" onClick={handleHomeClick} className="hover:text-white">
            Home
          </Link>
          <div ref={servicesRef} className="relative">
            <button
              type="button"
              aria-expanded={showServices}
              onClick={() => setShowServices((open) => !open)}
              className="hover:text-white"
            >
              Services
            </button>
            {showServices ? (
              <div className="absolute left-0 top-full mt-2 w-80 rounded-lg border border-white/10 bg-surface p-2 shadow-xl">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={getServiceHref(service)}
                    onClick={() => setShowServices(false)}
                    className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-white"
                  >
                    {service.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/case-studies" className="hover:text-white">
            Case Studies
          </Link>
          <Link href="/careers" className="hover:text-white">
            Careers
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
