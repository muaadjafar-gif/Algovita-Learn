"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminEnrollments from "@/components/admin/AdminEnrollments";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminStudents from "@/components/admin/AdminStudents";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses" },
  { id: "students", label: "Students" },
  { id: "enrollments", label: "Enrollments & payments" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="container-page py-8 md:py-12">
      <p className="eyebrow text-brand">Admin</p>
      <h1 className="text-h1 mt-3">Manage Algovita Learn</h1>

      <div
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto border-b border-mist px-4 pb-3 sm:mx-0 sm:px-0"
        role="tablist"
        aria-label="Admin sections"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-btn px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id ? "bg-brand text-white" : "text-graphite hover:bg-field hover:text-brand-deep"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && <AdminOverview />}
        {tab === "courses" && <AdminCourses />}
        {tab === "students" && <AdminStudents currentUserId={user?._id ?? ""} />}
        {tab === "enrollments" && <AdminEnrollments />}
      </div>
    </div>
  );
}
