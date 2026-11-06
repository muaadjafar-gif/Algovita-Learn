import { dbConnect } from "@/lib/db";
import Course from "@/models/Course";
import { seedCourses } from "@/lib/seed-data";
import type { CourseDTO } from "@/types";

/** Converts a lean Mongoose doc into a plain JSON-safe DTO. Strips private lesson fields for public pages. */
export function toCourseDTO(doc: unknown, opts: { includePrivate?: boolean } = {}): CourseDTO {
  const raw = JSON.parse(JSON.stringify(doc)) as CourseDTO & { __v?: number };
  delete raw.__v;
  if (!opts.includePrivate) {
    raw.modules = (raw.modules ?? []).map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => ({ _id: l._id, title: l.title, durationMin: l.durationMin })),
    }));
  }
  return raw;
}

function fallbackCourses(): CourseDTO[] {
  return seedCourses.map((c) => ({
    ...c,
    _id: `demo-${c.slug}`,
    modules: c.modules.map((m, mi) => ({
      _id: `demo-m${mi}`,
      title: m.title,
      lessons: m.lessons.map((l, li) => ({ _id: `demo-m${mi}-l${li}`, title: l.title, durationMin: l.durationMin })),
    })),
  }));
}

export interface CourseListResult {
  courses: CourseDTO[];
  /** true when the database could not be reached and demo content is shown instead */
  demo: boolean;
}

export async function getPublishedCourses(): Promise<CourseListResult> {
  try {
    await dbConnect();
    const docs = await Course.find({ published: true }).sort({ enrolledCount: -1, createdAt: -1 }).lean();
    return { courses: docs.map((d) => toCourseDTO(d)), demo: false };
  } catch (err) {
    console.warn("[data] Falling back to demo catalog:", err instanceof Error ? err.message : err);
    return { courses: fallbackCourses(), demo: true };
  }
}

export async function getCourseBySlug(slug: string): Promise<CourseDTO | null> {
  try {
    await dbConnect();
    const doc = await Course.findOne({ slug, published: true }).lean();
    return doc ? toCourseDTO(doc) : null;
  } catch (err) {
    console.warn("[data] Course lookup failed:", err instanceof Error ? err.message : err);
    return fallbackCourses().find((c) => c.slug === slug) ?? null;
  }
}

export function getCategories(courses: CourseDTO[]): string[] {
  return Array.from(new Set(courses.map((c) => c.category))).sort();
}
