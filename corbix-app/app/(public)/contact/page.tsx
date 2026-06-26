import { LeadCaptureForm } from "@/components/public/LeadCaptureForm";
import services from "@/data/seed-services.json";
import { getPageContent } from "@/lib/cms/get-page-content";
import { getServices } from "@/lib/cms/get-services";

function asText(value: unknown, fallback: string) {
  if (typeof value === "string") return value;
  return fallback;
}

export default async function ContactPage() {
  const content = await getPageContent("contact");
  const serviceData = await getServices();
  const options =
    serviceData.map((service) => service.title) ??
    (services as Array<{ title: string }>).map((service) => service.title);

  const email = asText(content.details?.email, "hello@corbrix.com");
  const phone = asText(content.details?.phone, "+971 00 000 0000");
  const address = asText(content.details?.address, "Dubai, United Arab Emirates");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
      <section>
        <h1 className="font-display text-5xl text-white">Contact Corbrix</h1>
        <p className="mt-4 text-muted">
          Tell us where you are today and where you need to go next. We will map
          the fastest responsible path.
        </p>
        <div className="mt-8 space-y-2 text-sm text-muted">
          <p>{email}</p>
          <p>{phone}</p>
          <p>{address}</p>
        </div>
      </section>
      <LeadCaptureForm
        sourcePage="/contact"
        submitLabel="Send Inquiry"
        serviceOptions={options}
      />
    </div>
  );
}
