"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function Footer() {
  // Year is set after mount so server and client HTML always match (no hydration mismatch).
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-mist bg-fog">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Industry-ready technical programs with live mentoring, real projects and certificates.
          </p>
        </div>
        <div>
          <h3 className="eyebrow text-ink">Learn</h3>
          <ul className="mt-4 space-y-2 text-sm text-graphite">
            <li><Link href="/courses" className="hover:text-brand">All courses</Link></li>
            <li><Link href="/courses?category=Web+Development" className="hover:text-brand">Web development</Link></li>
            <li><Link href="/courses?category=AI+%26+Automation" className="hover:text-brand">AI &amp; automation</Link></li>
            <li><Link href="/courses?category=Data+%26+AI" className="hover:text-brand">Data science</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow text-ink">Account</h3>
          <ul className="mt-4 space-y-2 text-sm text-graphite">
            <li><Link href="/register" className="hover:text-brand">Create account</Link></li>
            <li><Link href="/login" className="hover:text-brand">Log in</Link></li>
            <li><Link href="/dashboard" className="hover:text-brand">My learning</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow text-ink">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-graphite">
            <li><Link href="/#features" className="hover:text-brand">Why Algovita</Link></li>
            <li><Link href="/#faq" className="hover:text-brand">FAQ</Link></li>
            <li>Built by Algovita Digital</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-mist">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-sm text-muted sm:flex-row sm:items-center">
          <p suppressHydrationWarning>&copy; {year ?? ""} Algovita Digital. All rights reserved.</p>
          <p>Payments secured by Razorpay</p>
        </div>
      </div>
    </footer>
  );
}
