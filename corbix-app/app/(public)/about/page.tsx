import { getPageContent } from "@/lib/cms/get-page-content";

function asText(value: unknown, fallback: string) {
  if (typeof value === "string") return value;
  return fallback;
}

export default async function AboutPage() {
  const content = await getPageContent("about");
  const title = asText(content.body?.title, "Built for Ambitious Operators");
  const text = asText(
    content.body?.text,
    "Corbrix exists to remove friction from growth. We align market strategy, regulatory clarity, and execution support under one partner.",
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <h1 className="font-display text-5xl text-white">{title}</h1>
      <p className="mt-6 text-lg leading-8 text-muted">{text}</p>
    </div>
  );
}
