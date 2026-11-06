"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/#features", label: "Features" },
  { href: "/#testimonials", label: "Stories" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-mist/70 bg-white/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => {
            const active = l.href === pathname || (l.href !== "/" && !l.href.includes("#") && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-nav px-3 py-2 text-[15px] font-medium transition-colors hover:text-brand",
                  active ? "text-brand" : "text-ink"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-10 w-28 animate-pulse rounded-btn bg-fog" />
          ) : user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="rounded-nav px-3 py-2 text-[15px] font-medium text-ink hover:text-brand">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                My learning
              </Link>
              <button onClick={logout} className="rounded-nav px-3 py-2 text-[15px] font-medium text-graphite hover:text-brand">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-nav px-3 py-2 text-[15px] font-medium text-ink hover:text-brand">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign up for free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-btn border border-mist md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-white md:hidden">
          <nav className="container-page flex flex-col gap-1 py-6" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-btn px-3 py-3 text-lg font-medium text-ink hover:bg-fog">
                {l.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-mist pt-6">
              {user ? (
                <>
                  <Link href="/dashboard" className="btn btn-primary btn-block">
                    My learning
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className="btn btn-ghost btn-block">
                      Admin panel
                    </Link>
                  )}
                  <button onClick={logout} className="btn btn-ghost btn-block">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register" className="btn btn-primary btn-block">
                    Sign up for free
                  </Link>
                  <Link href="/login" className="btn btn-ghost btn-block">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
