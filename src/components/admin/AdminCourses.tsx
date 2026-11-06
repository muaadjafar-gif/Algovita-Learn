"use client";

import { useCallback, useEffect, useState } from "react";
import CourseForm from "@/components/admin/CourseForm";
import { api } from "@/lib/client";
import { formatINR } from "@/lib/utils";
import { lessonCount, type CourseDTO } from "@/types";

export default function AdminCourses() {
  const [courses, setCourses] = useState<CourseDTO[] | null>(null);
  const [editing, setEditing] = useState<CourseDTO | "new" | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await api<{ courses: CourseDTO[] }>("/api/admin/courses");
      setCourses(d.courses);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load courses");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(c: CourseDTO) {
    if (!window.confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    setError("");
    try {
      await api(`/api/admin/courses/${c._id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete course");
    }
  }

  async function togglePublish(c: CourseDTO) {
    setError("");
    try {
      await api(`/api/admin/courses/${c._id}`, {
        method: "PUT",
        json: {
          title: c.title,
          slug: c.slug,
          shortDescription: c.shortDescription,
          description: c.description,
          category: c.category,
          level: c.level,
          durationWeeks: c.durationWeeks,
          instructor: c.instructor,
          price: c.price,
          originalPrice: c.originalPrice,
          features: c.features,
          modules: c.modules,
          published: !c.published,
        },
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update course");
    }
  }

  if (editing) {
    return (
      <CourseForm
        course={editing === "new" ? undefined : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          void load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h3">Courses</h2>
        <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm">
          New course
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-btn bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!courses ? (
        <div className="mt-6 h-48 animate-pulse rounded-card bg-fog" />
      ) : courses.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-mist bg-fog px-6 py-14 text-center">
          <p className="text-sm text-muted">No courses yet. Create one, or run <code className="font-semibold">npm run seed</code>.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto rounded-card border border-mist bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-fog text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Lessons</th>
                  <th className="px-4 py-3 font-semibold">Enrolled</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist">
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-semibold text-ink">{c.title}</p>
                      <p className="truncate text-xs text-muted">{c.category} &middot; {c.level}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatINR(c.price)}</td>
                    <td className="px-4 py-3">{lessonCount(c)}</td>
                    <td className="px-4 py-3">{c.enrolledCount}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => togglePublish(c)} className={c.published ? "pill pill-mint" : "pill pill-fog"} title="Toggle published">
                        {c.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button type="button" onClick={() => setEditing(c)} className="mr-2 font-semibold text-brand hover:underline">Edit</button>
                      <button type="button" onClick={() => remove(c)} className="font-semibold text-red-700 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {courses.map((c) => (
              <div key={c._id} className="rounded-card border border-mist bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{c.title}</p>
                    <p className="text-xs text-muted">{c.category} &middot; {c.level}</p>
                  </div>
                  <button type="button" onClick={() => togglePublish(c)} className={`shrink-0 ${c.published ? "pill pill-mint" : "pill pill-fog"}`}>
                    {c.published ? "Published" : "Draft"}
                  </button>
                </div>
                <p className="mt-3 text-sm text-graphite">
                  {formatINR(c.price)} &middot; {lessonCount(c)} lessons &middot; {c.enrolledCount} enrolled
                </p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => setEditing(c)} className="btn btn-ghost btn-sm flex-1">Edit</button>
                  <button type="button" onClick={() => remove(c)} className="btn btn-danger btn-sm flex-1">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
