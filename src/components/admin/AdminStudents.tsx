"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client";
import { formatDate } from "@/lib/utils";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "admin";
  createdAt: string;
  enrollments: number;
  avgProgress: number;
}

export default function AdminStudents({ currentUserId }: { currentUserId: string }) {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await api<{ students: Student[] }>("/api/admin/students");
      setStudents(d.students);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load students");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!students) return [];
    return q ? students.filter((s) => `${s.name} ${s.email} ${s.phone}`.toLowerCase().includes(q)) : students;
  }, [students, query]);

  async function act(fn: () => Promise<unknown>) {
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  }

  const changeRole = (s: Student) =>
    act(() =>
      api(`/api/admin/students/${s._id}`, { method: "PATCH", json: { role: s.role === "admin" ? "student" : "admin" } })
    );

  const remove = (s: Student) => {
    if (!window.confirm(`Delete ${s.name} and all their enrollments?`)) return;
    return act(() => api(`/api/admin/students/${s._id}`, { method: "DELETE" }));
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-h3">Students</h2>
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search name, email or phone"
          aria-label="Search students"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-btn bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!students ? (
        <div className="mt-6 h-48 animate-pulse rounded-card bg-fog" />
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto rounded-card border border-mist bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-fog text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Courses</th>
                  <th className="px-4 py-3 font-semibold">Avg progress</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist">
                {filtered.map((s) => (
                  <tr key={s._id}>
                    <td className="max-w-[240px] px-4 py-3">
                      <p className="truncate font-semibold">{s.name}</p>
                      <p className="truncate text-xs text-muted">{s.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{s.phone || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3">{s.enrollments}</td>
                    <td className="px-4 py-3">{s.avgProgress}%</td>
                    <td className="px-4 py-3">
                      <span className={s.role === "admin" ? "pill pill-field" : "pill pill-fog"}>{s.role}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {s._id !== currentUserId && (
                        <>
                          <button type="button" onClick={() => changeRole(s)} className="mr-3 font-semibold text-brand hover:underline">
                            {s.role === "admin" ? "Make student" : "Make admin"}
                          </button>
                          <button type="button" onClick={() => remove(s)} className="font-semibold text-red-700 hover:underline">
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {filtered.map((s) => (
              <div key={s._id} className="rounded-card border border-mist bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.name}</p>
                    <p className="truncate text-xs text-muted">{s.email}</p>
                  </div>
                  <span className={`shrink-0 ${s.role === "admin" ? "pill pill-field" : "pill pill-fog"}`}>{s.role}</span>
                </div>
                <p className="mt-3 text-sm text-graphite">
                  {s.enrollments} courses &middot; {s.avgProgress}% avg &middot; joined {formatDate(s.createdAt)}
                </p>
                {s._id !== currentUserId && (
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => changeRole(s)} className="btn btn-ghost btn-sm flex-1">
                      {s.role === "admin" ? "Make student" : "Make admin"}
                    </button>
                    <button type="button" onClick={() => remove(s)} className="btn btn-danger btn-sm flex-1">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && <p className="mt-6 text-center text-sm text-muted">No students found.</p>}
        </>
      )}
    </div>
  );
}
