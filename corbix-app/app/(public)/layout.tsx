import type { ReactNode } from "react";
import { ConditionalFooter } from "@/components/public/ConditionalFooter";
import { Header } from "@/components/public/Header";
import { Loader } from "@/components/public/Loader";
import { SmoothScroll } from "@/components/public/SmoothScroll";
import { getServices } from "@/lib/cms/get-services";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const services = await getServices();

  return (
    <SmoothScroll>
      <Loader />
      <Header services={services} />
      <main>{children}</main>
      <ConditionalFooter />
    </SmoothScroll>
  );
}
