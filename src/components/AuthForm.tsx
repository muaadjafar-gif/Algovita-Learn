"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";

function safeNext(next: string | null): string {
  // only allow same-site relative paths to prevent open redirects
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isRegister = mode === "register";
  const next = safeNext(params.get("next"));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setUser(data.user);
      router.replace(data.user.role === "admin" && next === "/dashboard" ? "/admin" : next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <span className="orb orb-violet -left-24 -top-24 h-96 w-96" aria-hidden="true" />
      <span className="orb orb-pink -right-24 bottom-0 h-96 w-96" aria-hidden="true" />

      <div className="container-page relative flex min-h-[calc(100dvh-4rem)] items-center justify-center py-10">
        <div className="w-full max-w-md rounded-card border border-mist bg-white p-6 shadow-float sm:p-8">
          <p className="eyebrow text-brand">{isRegister ? "Create account" : "Welcome back"}</p>
          <h1 className="text-h2 mt-3">{isRegister ? "Start learning today" : "Log in to continue"}</h1>
          <p className="mt-2 text-sm text-muted">
            {isRegister ? "One account for every course, your progress and receipts." : "Pick up right where you left off."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {isRegister && (
              <div>
                <label htmlFor="name" className="label">Full name</label>
                <input id="name" name="name" type="text" autoComplete="name" required minLength={2} className="input" placeholder="Your name" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
            </div>
            {isRegister && (
              <div>
                <label htmlFor="phone" className="label">Phone <span className="font-normal text-muted">(optional)</span></label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" className="input" placeholder="+91 98765 43210" />
              </div>
            )}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                  minLength={isRegister ? 8 : 1}
                  className="input pr-16"
                  placeholder={isRegister ? "At least 8 characters, with a number" : "Your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-brand hover:bg-field"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-btn bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary btn-block">
              {busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isRegister ? "Already have an account? " : "New to Algovita Learn? "}
            <Link
              href={`${isRegister ? "/login" : "/register"}${params.get("next") ? `?next=${encodeURIComponent(params.get("next") as string)}` : ""}`}
              className="font-semibold text-brand hover:underline"
            >
              {isRegister ? "Log in" : "Sign up for free"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
