import type { ReactNode } from "react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { getServices } from "@/lib/cms/get-services";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const services = await getServices();

  return (
    <>
      <Header services={services} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
