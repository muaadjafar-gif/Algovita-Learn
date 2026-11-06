"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/client";
import { formatDate, formatINR } from "@/lib/utils";
import type { CourseDTO } from "@/types";

interface EnrollmentRow {
  _id: string;
  status: "active" | "revoked";
  source: string;
  progressPercent: number;
  createdAt: string;
  user?: { name: string; email: string };
  course?: { title: string };
}

interface PaymentRow {
  _id: string;
  status: "created" | "paid" | "failed";
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: string;
  user?: { name: string; email: string };
  course?: { title: string };
}

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[] | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [view, setView] = useState<"enrollments" | "payments">("enrollments");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantCourse, setGrantCourse] = useState("");

  const load = useCallback(async () => {
    try {
      const [e, c] = await Promise.all([
        api<{ enrollments: EnrollmentRow[]; payments: PaymentRow[] }>("/api/admin/enrollments"),
        api<{ courses: CourseDTO[] }>("/api/admin/courses"),
      ]);
      setEnrollments(e.enrollments);
      setPayments(e.payments);
      setCourses(c.courses);
      setGrantCourse((prev) => prev || c.courses[0]?._id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: "active" | "revoked") {
    setError("");
    try {
      await api(`/api/admin/enrollments/${id}`, { method: "PATCH", json: { status } });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update enrollment");
    }
  }

  async function grant(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      await api("/api/admin/enrollments", { method: "POST", json: { email: grantEmail, courseId: grantCourse } });
      setNotice("Access granted.");
      setGrantEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not grant access");
    }
  }

  const paymentPill = (s: PaymentRow["status"]) => (s === "paid" ? "pill pill-mint" : s === "failed" ? "pill bg-red-50 text-red-700" : "pill pill-fog");

  return (
    <div className="space-y-6">
      <form onSubmit={grant} className="rounded-card border border-mist bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Grant course access</h2>
        <p className="mt-1 text-sm text-muted">For offline payments, scholarships or support cases.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input type="email" required className="input" placeholder="Student email" aria-label="Student email" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} />
          <select className="input" aria-label="Course" value={grantCourse} onChange={(e) => setGrantCourse(e.target.value)} required>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Grant access</button>
        </div>
        {notice && <p className="mt-3 text-sm font-semibold text-emerald-700">{notice}</p>}
      </form>

      {error && (
        <p role="alert" className="rounded-btn bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2" role="tablist">
        {(["enrollments", "payments"] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`pill px-4 py-2 text-sm capitalize ${view === v ? "bg-brand text-white" : "bg-fog text-graphite hover:bg-field"}`}
          >
            {v}
          </button>
        ))}
      </div>

      {!enrollments ? (
        <div className="h-48 animate-pulse rounded-card bg-fog" />
      ) : view === "enrollments" ? (
        <div className="overflow-x-auto rounded-card border border-mist bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-fog text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {enrollments.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.user?.name ?? "Deleted user"}</p>
                    <p className="text-xs text-muted">{r.user?.email}</p>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3">{r.course?.title ?? "Deleted course"}</td>
                  <td className="px-4 py-3"><span className="pill pill-fog">{r.source}</span></td>
                  <td className="px-4 py-3">{r.progressPercent}%</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={r.status === "active" ? "pill pill-mint" : "pill bg-red-50 text-red-700"}>{r.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setStatus(r._id, r.status === "active" ? "revoked" : "active")}
                      className="font-semibold text-brand hover:underline"
                    >
                      {r.status === "active" ? "Revoke" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No enrollments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-mist bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-fog text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Razorpay IDs</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{p.user?.name ?? "Deleted user"}</p>
                    <p className="text-xs text-muted">{p.user?.email}</p>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3">{p.course?.title ?? "Deleted course"}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatINR(p.amount / 100)}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    <p>{p.razorpayOrderId}</p>
                    <p>{p.razorpayPaymentId || "-"}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3"><span className={paymentPill(p.status)}>{p.status}</span></td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
