import { SplitServicePage } from "@/components/public/SplitServicePage";
import { servicePages } from "@/data/service-pages";

export default function StrategicAdvisoryPage() {
  return <SplitServicePage config={servicePages["strategic-advisory"]} />;
}
