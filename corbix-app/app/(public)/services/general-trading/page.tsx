import { SplitServicePage } from "@/components/public/SplitServicePage";
import { servicePages } from "@/data/service-pages";

export default function GeneralTradingPage() {
  return <SplitServicePage config={servicePages["general-trading"]} />;
}
