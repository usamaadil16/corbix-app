type LenisLike = { scrollTo: (target: number | string, opts?: unknown) => void };

function getLenis(): LenisLike | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { lenis?: LenisLike }).lenis;
}

/** Smoothly scroll to an absolute Y position, using Lenis when available. */
export function smoothScrollTo(y: number) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(y);
  } else {
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

/** Smoothly scroll back to the very top of the page. */
export function smoothScrollToTop() {
  smoothScrollTo(0);
}
