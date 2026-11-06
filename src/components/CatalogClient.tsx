"use client";

import { useMemo, useState } from "react";
import CourseCard from "@/components/CourseCard";
import { cn } from "@/lib/utils";
import type { CourseDTO } from "@/types";

type Sort = "popular" | "price-asc" | "price-desc" | "duration";

export default function CatalogClient({
  courses,
  categories,
  initialCategory = "",
}: {
  courses: CourseDTO[];
  categories: string[];
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : "");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState<Sort>("popular");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (category && c.category !== category) return false;
      if (level && c.level !== level) return false;
      if (q && !`${c.title} ${c.shortDescription} ${c.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === "popular") sorted.sort((a, b) => b.enrolledCount - a.enrolledCount);
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "duration") sorted.sort((a, b) => a.durationWeeks - b.durationWeeks);
    return sorted;
  }, [courses, query, category, level, sort]);

  const hasFilters = Boolean(query || category || level);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses"
            aria-label="Search courses"
            className="input pl-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Filter by level" className="input sm:w-44">
            <option value="">All levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort courses" className="input sm:w-48">
            <option value="popular">Most popular</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="duration">Shortest first</option>
          </select>
        </div>
      </div>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="tablist" aria-label="Categories">
        {["", ...categories].map((c) => (
          <button
            key={c || "all"}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "pill shrink-0 px-4 py-2 text-sm transition-colors",
              category === c ? "bg-brand text-white" : "bg-fog text-graphite hover:bg-field hover:text-brand-deep"
            )}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "course" : "courses"}
        {hasFilters && (
          <button
            type="button"
            className="ml-3 font-semibold text-brand hover:underline"
            onClick={() => {
              setQuery("");
              setCategory("");
              setLevel("");
            }}
          >
            Clear filters
          </button>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-mist bg-fog px-6 py-16 text-center">
          <p className="text-h3">No courses match</p>
          <p className="mt-2 text-sm text-muted">Try a different search or clear your filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {filtered.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
