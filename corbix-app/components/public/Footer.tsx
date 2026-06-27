import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-surface/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <h3 className="font-display text-3xl text-white">
            Let&apos;s build your future together
          </h3>
          <p className="text-sm text-muted">
            Corbrix unifies market strategy, trade execution, and global mobility
            under one trusted team.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-background transition-colors hover:bg-accent/90"
          >
            Start a Conversation
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-white">Quick Links</p>
            <Link href="/" className="block text-muted hover:text-white">
              Home
            </Link>
            <Link href="/about" className="block text-muted hover:text-white">
              About
            </Link>
            <Link href="/case-studies" className="block text-muted hover:text-white">
              Case Studies
            </Link>
            <Link href="/careers" className="block text-muted hover:text-white">
              Careers
            </Link>
            <Link href="/contact" className="block text-muted hover:text-white">
              Contact
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white">Contact</p>
            <p className="text-muted">hello@corbrix.com</p>
            <p className="text-muted">+971 00 000 0000</p>
            <p className="text-muted">Dubai, UAE</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
