import { SplitServicePage } from "@/components/public/SplitServicePage";
import { servicePages } from "@/data/service-pages";

export default function CommercialBrokeragePage() {
  return <SplitServicePage config={servicePages["commercial-brokerage"]} />;
}
