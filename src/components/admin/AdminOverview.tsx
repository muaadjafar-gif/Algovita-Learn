"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { formatDate, formatINR } from "@/lib/utils";

interface Stats {
  stats: { students: number; courses: number; activeEnrollments: number; revenue: number; paidOrders: number };
  recent: Array<{ _id: string; createdAt: string; source: string; user?: { name: string; email: string }; course?: { title: string } }>;
  topCourses: Array<{ _id: string; title: string; enrolledCount: number; price: number }>;
}

export default function AdminOverview() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/admin/stats").then(setData).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p role="alert" className="rounded-btn bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!data) return <div className="h-64 animate-pulse rounded-card bg-fog" />;

  const cards = [
    { label: "Students", value: data.stats.students.toLocaleString("en-IN") },
    { label: "Courses", value: data.stats.courses },
    { label: "Active enrollments", value: data.stats.activeEnrollments.toLocaleString("en-IN") },
    { label: "Revenue (paid)", value: formatINR(data.stats.revenue) },
  ];
  const maxEnrolled = Math.max(1, ...data.topCourses.map((c) => c.enrolledCount));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-card border border-mist bg-white p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 break-words font-display text-2xl font-semibold tracking-tight sm:text-3xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-mist bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Recent enrollments</h2>
          {data.recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No enrollments yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-mist">
              {data.recent.map((r) => (
                <li key={r._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.user?.name ?? "Deleted user"}</p>
                    <p className="truncate text-xs text-muted">{r.course?.title ?? "Deleted course"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="pill pill-fog">{r.source}</span>
                    <p className="mt-1 text-xs text-muted">{formatDate(r.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-card border border-mist bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Top courses</h2>
          <ul className="mt-4 space-y-4">
            {data.topCourses.map((c) => (
              <li key={c._id}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{c.title}</span>
                  <span className="shrink-0 text-muted">{c.enrolledCount}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-fog">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(c.enrolledCount / maxEnrolled) * 100}%` }} />
                </div>
              </li>
            ))}
            {data.topCourses.length === 0 && <p className="text-sm text-muted">No courses yet.</p>}
          </ul>
        </section>
      </div>
    </div>
  );
}
