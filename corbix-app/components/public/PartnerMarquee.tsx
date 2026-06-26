"use client";

const partners = [
  "Atlas Holdings",
  "Nexa Ventures",
  "Al Noor Group",
  "Lumen Trade",
  "Vanguard Properties",
  "Meridian Capital",
];

export function PartnerMarquee() {
  return (
    <section className="overflow-hidden border-y border-white/10 py-4">
      <div className="marquee flex min-w-max items-center gap-10 text-sm text-muted">
        {[...partners, ...partners].map((partner, index) => (
          <span
            key={`${partner}-${index}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
          >
            {partner}
          </span>
        ))}
      </div>
      <style jsx>{`
        .marquee {
          animation: partner-marquee 28s linear infinite;
        }
        @keyframes partner-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
