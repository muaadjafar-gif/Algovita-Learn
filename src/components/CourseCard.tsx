import Link from "next/link";
import { hashIndex, formatINR } from "@/lib/utils";
import { lessonCount, type CourseDTO } from "@/types";

const palettes = [
  "from-field via-white to-white",
  "from-mint via-white to-white",
  "from-fog via-field to-white",
  "from-field via-mint to-white",
];

const orbs = ["orb-violet", "orb-pink", "orb-violet", "orb-amber"];

export default function CourseCard({ course }: { course: CourseDTO }) {
  const idx = hashIndex(course.slug, palettes.length);
  const lessons = lessonCount(course);
  const discount =
    course.originalPrice > course.price && course.price > 0
      ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="motion-lift group flex h-full flex-col overflow-hidden rounded-card border border-mist bg-white"
    >
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${palettes[idx]} sm:h-40`}>
        <span className={`orb ${orbs[idx]} -right-10 -top-10 h-44 w-44`} />
        <div className="relative flex h-full flex-col justify-between p-5">
          <span className="pill pill-fog self-start bg-white/80">{course.category}</span>
          <span className="text-h3 line-clamp-1 text-ink/90 transition-transform duration-300 group-hover:translate-x-1">
            {course.durationWeeks} weeks
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
          <span className="pill pill-field">{course.level}</span>
          {lessons > 0 && <span>{lessons} lessons</span>}
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-ink">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{course.shortDescription}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-ink">{formatINR(course.price)}</span>
              {discount > 0 && (
                <span className="text-sm text-muted line-through">{formatINR(course.originalPrice)}</span>
              )}
            </div>
            {discount > 0 && <span className="text-xs font-semibold text-brand-deep">{discount}% off</span>}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
            View
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
