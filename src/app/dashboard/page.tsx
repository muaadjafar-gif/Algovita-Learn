"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ProgressBar from "@/components/ProgressBar";
import { formatDate } from "@/lib/utils";
import { lessonCount, type EnrollmentDTO } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<EnrollmentDTO[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/enrollments", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load your courses");
        if (!cancelled) setItems(data.enrollments);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load your courses"));
    return () => {
      cancelled = true;
    };
  }, []);

  const completed = items?.filter((e) => e.progressPercent === 100).length ?? 0;
  const avg = items && items.length ? Math.round(items.reduce((s, e) => s + e.progressPercent, 0) / items.length) : 0;
  const resume = items?.find((e) => e.progressPercent < 100) ?? items?.[0];

  return (
    <div className="container-page py-8 md:py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-brand">Student dashboard</p>
          <h1 className="text-h1 mt-3">Hi{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
          <p className="text-lead mt-2">Here is where you left off.</p>
        </div>
        <Link href="/courses" className="btn btn-ghost self-start sm:self-auto">
          Browse more courses
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-8 rounded-btn bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!items && !error && (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-card bg-fog" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <div className="mt-10 rounded-card border border-dashed border-mist bg-fog px-6 py-16 text-center">
          <h2 className="text-h3">You have not enrolled in a course yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Start with the free foundations course or pick a full program from the catalog.
          </p>
          <Link href="/courses" className="btn btn-primary mt-6">
            Explore courses
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Enrolled courses", value: items.length },
              { label: "Average progress", value: `${avg}%` },
              { label: "Completed", value: completed },
            ].map((s) => (
              <div key={s.label} className="rounded-card border border-mist bg-white p-5">
                <p className="text-sm text-muted">{s.label}</p>
                <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">{s.value}</p>
              </div>
            ))}
          </div>

          {resume && (
            <div className="relative mt-6 overflow-hidden rounded-card bg-field p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="eyebrow text-ink">Continue where you left off</p>
                  <h2 className="text-h3 mt-2 text-ink">{resume.course.title}</h2>
                  <div className="mt-3 flex max-w-sm items-center gap-3">
                    <ProgressBar value={resume.progressPercent} className="bg-white" />
                    <span className="text-sm font-semibold text-ink">{resume.progressPercent}%</span>
                  </div>
                </div>
                <Link href={`/dashboard/learn/${resume.course.slug}`} className="btn btn-dark shrink-0">
                  Resume course
                </Link>
              </div>
            </div>
          )}

          <h2 className="text-h2 mt-12">My courses</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <article key={e._id} className="motion-lift flex flex-col rounded-card border border-mist bg-white p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="pill pill-field">{e.course.category}</span>
                  {e.progressPercent === 100 && <span className="pill pill-mint">Completed</span>}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold leading-snug tracking-tight">{e.course.title}</h3>
                <p className="mt-1 text-xs text-muted">
                  {lessonCount(e.course)} lessons &middot; enrolled {formatDate(e.createdAt)}
                </p>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted">Progress</span>
                    <span className="font-semibold text-ink">{e.progressPercent}%</span>
                  </div>
                  <ProgressBar value={e.progressPercent} />
                </div>
                <Link href={`/dashboard/learn/${e.course.slug}`} className="btn btn-primary btn-sm btn-block mt-6">
                  {e.progressPercent === 0 ? "Start learning" : e.progressPercent === 100 ? "Review course" : "Continue"}
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
