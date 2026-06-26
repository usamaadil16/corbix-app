"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/public/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  // The homepage folds the footer into its 3D closing panel.
  if (pathname === "/") return null;
  return <Footer />;
}
