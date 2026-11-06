import type { Metadata } from "next";
import CatalogClient from "@/components/CatalogClient";
import { getCategories, getPublishedCourses } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse technical programs in web development, AI automation, data science, design and cloud engineering.",
};

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const { courses, demo } = await getPublishedCourses();
  const categories = getCategories(courses);

  return (
    <div className="relative overflow-hidden">
      <div className="container-page py-10 md:py-16">
        <p className="eyebrow text-brand">Course catalog</p>
        <h1 className="text-h1 mt-4 max-w-[720px]">Find your next skill</h1>
        <p className="text-lead mt-4 max-w-[620px]">
          Every program shows its full curriculum, duration and price up front. No surprises.
        </p>

        {demo && (
          <p className="mt-6 rounded-btn bg-field px-4 py-3 text-sm text-brand-deep">
            Showing demo content because the database is not connected yet.
          </p>
        )}

        <div className="mt-10">
          <CatalogClient courses={courses} categories={categories} initialCategory={category} />
        </div>
      </div>
    </div>
  );
}
