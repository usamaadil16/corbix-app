import { HomeExperience } from "@/components/public/home/HomeExperience";
import { getPageContent } from "@/lib/cms/get-page-content";
import { getServices } from "@/lib/cms/get-services";

function asText(value: unknown, fallback: string) {
  if (typeof value === "string") return value;
  return fallback;
}

export default async function HomePage() {
  const content = await getPageContent("home");
  const services = await getServices();

  const heroHeadline = asText(content.hero_headline?.text, "A Name You Trust.");
  const slogan = asText(
    content.slogan?.text,
    "Your single unified partner for local growth and global expansion.",
  );
  const brandTitle = asText(content.brand_story?.title, "COR / BRIX");
  const brandStory = asText(
    content.brand_story?.text,
    "COR stands for core trust and commitment. BRIX represents building blocks for durable growth.",
  );
  const vision = asText(
    content.vision?.text,
    "We combine strategic precision and operational execution to help businesses scale with confidence.",
  );

  return (
    <HomeExperience
      heroHeadline={heroHeadline}
      slogan={slogan}
      brandTitle={brandTitle}
      brandStory={brandStory}
      vision={vision}
      services={services}
    />
  );
}
