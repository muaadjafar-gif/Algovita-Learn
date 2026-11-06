import Link from "next/link";

export function SparkleIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.9 5.6a4 4 0 002.5 2.5L22 12l-5.6 1.9a4 4 0 00-2.5 2.5L12 22l-1.9-5.6a4 4 0 00-2.5-2.5L2 12l5.6-1.9a4 4 0 002.5-2.5L12 2z" />
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="Algovita Learn home">
      <SparkleIcon className="h-6 w-6 text-brand" />
      <span className="text-lg font-semibold tracking-tight text-ink">Algovita Learn</span>
    </Link>
  );
}
