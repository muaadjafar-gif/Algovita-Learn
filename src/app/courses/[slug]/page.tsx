import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnrollButton from "@/components/EnrollButton";
import { getCourseBySlug } from "@/lib/data";
import { formatINR } from "@/lib/utils";
import { lessonCount, totalMinutes } from "@/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.shortDescription };
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lessons = lessonCount(course);
  const minutes = totalMinutes(course);
  const discount =
    course.originalPrice > course.price && course.price > 0
      ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
      : 0;

  return (
    <>
      {/* Header band */}
      <section className="relative overflow-hidden bg-field">
        <div className="container-page py-10 md:py-16">
          <nav className="text-sm text-graphite" aria-label="Breadcrumb">
            <Link href="/courses" className="hover:text-brand">Courses</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{course.category}</span>
          </nav>
          <h1 className="text-h1 mt-4 max-w-[760px] text-ink">{course.title}</h1>
          <p className="mt-4 max-w-[680px] text-base text-graphite md:text-lg">{course.shortDescription}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="pill bg-white text-ink">{course.level}</span>
            <span className="pill bg-white text-ink">{course.durationWeeks} weeks</span>
            {lessons > 0 && <span className="pill bg-white text-ink">{lessons} lessons</span>}
            {minutes > 0 && <span className="pill bg-white text-ink">{formatDuration(minutes)} of video</span>}
            <span className="text-graphite">by {course.instructor}</span>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 md:py-14 lg:grid-cols-[1fr_380px] lg:gap-14">
        {/* Purchase card: first on mobile, sticky sidebar on desktop */}
        <aside className="order-first lg:order-last">
          <div className="rounded-card border border-mist bg-white p-6 lg:sticky lg:top-24">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-semibold tracking-tight text-ink">{formatINR(course.price)}</span>
              {discount > 0 && <span className="text-base text-muted line-through">{formatINR(course.originalPrice)}</span>}
              {discount > 0 && <span className="pill pill-mint">{discount}% off</span>}
            </div>
            <EnrollButton course={{ _id: course._id, slug: course.slug, title: course.title, price: course.price }} className="mt-5" />
            {course.price > 0 && (
              <p className="mt-3 text-center text-xs text-muted">Secure payment via Razorpay: UPI, cards and net banking</p>
            )}
            {course.features.length > 0 && (
              <>
                <h2 className="eyebrow mt-6 text-ink">This course includes</h2>
                <ul className="mt-3 space-y-2.5">
                  {course.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-graphite">
                      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <section>
            <h2 className="text-h2">About this course</h2>
            <p className="mt-4 whitespace-pre-line text-base text-graphite">{course.description}</p>
          </section>

          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-h2">Curriculum</h2>
              <p className="text-sm text-muted">
                {course.modules.length} modules &middot; {lessons} lessons
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {course.modules.map((m, i) => (
                <details key={m._id} open={i === 0} className="group rounded-img border border-mist bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-field text-xs font-bold text-brand-deep">
                        {i + 1}
                      </span>
                      <span className="truncate text-base font-semibold text-ink">{m.title}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-xs text-muted">
                      <span className="hidden sm:inline">{m.lessons.length} lessons</span>
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <ul className="border-t border-mist px-4 py-2 sm:px-5">
                    {m.lessons.map((l) => (
                      <li key={l._id} className="flex items-center justify-between gap-3 py-2.5 text-sm text-graphite">
                        <span className="flex min-w-0 items-center gap-2.5">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="currentColor" aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span className="truncate">{l.title}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted">{l.durationMin} min</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
