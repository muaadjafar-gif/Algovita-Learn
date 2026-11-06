"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import { cn, toEmbedUrl } from "@/lib/utils";
import type { CourseDTO, LessonDTO } from "@/types";

interface LearnData {
  course: CourseDTO;
  progress: { completedLessons: string[]; progressPercent: number; lastLessonId: string; preview: boolean };
}

export default function LearnPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [data, setData] = useState<LearnData | null>(null);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState("");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [percent, setPercent] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/learn/${slug}`, { cache: "no-store" })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? "Could not load this course");
        if (cancelled) return;
        const learn = d as LearnData;
        setData(learn);
        setDone(new Set(learn.progress.completedLessons));
        setPercent(learn.progress.progressPercent);
        const flat = learn.course.modules.flatMap((m) => m.lessons);
        const firstIncomplete = flat.find((l) => !learn.progress.completedLessons.includes(l._id));
        setActiveId(
          flat.find((l) => l._id === learn.progress.lastLessonId)?._id ?? firstIncomplete?._id ?? flat[0]?._id ?? ""
        );
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load this course"));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const flat = useMemo<LessonDTO[]>(() => data?.course.modules.flatMap((m) => m.lessons) ?? [], [data]);
  const activeIndex = flat.findIndex((l) => l._id === activeId);
  const active = flat[activeIndex];
  const nextLesson = activeIndex >= 0 ? flat[activeIndex + 1] : undefined;
  const preview = data?.progress.preview ?? false;

  const toggle = useCallback(async () => {
    if (!data || !active || preview) return;
    const completed = !done.has(active._id);
    setSaving(true);
    try {
      const res = await fetch(`/api/enrollments/${data.course._id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: active._id, completed }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Could not save progress");
      setDone(new Set(d.completedLessons as string[]));
      setPercent(d.progressPercent);
      if (completed && nextLesson) setActiveId(nextLesson._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save progress");
    } finally {
      setSaving(false);
    }
  }, [data, active, preview, done, nextLesson]);

  if (error && !data) {
    return (
      <div className="container-page flex min-h-[50dvh] flex-col items-center justify-center py-16 text-center">
        <h1 className="text-h2">Cannot open this course</h1>
        <p className="mt-3 max-w-md text-muted">{error}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/courses/${slug}`} className="btn btn-primary">View course page</Link>
          <Link href="/dashboard" className="btn btn-ghost">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-page py-8">
        <div className="h-8 w-64 animate-pulse rounded-btn bg-fog" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="aspect-video animate-pulse rounded-card bg-fog" />
          <div className="h-80 animate-pulse rounded-card bg-fog" />
        </div>
      </div>
    );
  }

  const embed = toEmbedUrl(active?.videoUrl);
  const isDone = active ? done.has(active._id) : false;

  return (
    <div className="container-page py-6 md:py-10">
      <Link href="/dashboard" className="text-sm font-medium text-graphite hover:text-brand">
        &larr; My learning
      </Link>
      <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <h1 className="text-h2 min-w-0">{data.course.title}</h1>
        {!preview && (
          <div className="flex w-full max-w-xs items-center gap-3 sm:w-64">
            <ProgressBar value={percent} />
            <span className="text-sm font-semibold">{percent}%</span>
          </div>
        )}
      </div>
      {preview && (
        <p className="mt-4 rounded-btn bg-field px-4 py-2 text-sm text-brand-deep">Admin preview: progress is not saved.</p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <section className="min-w-0">
          <div className="overflow-hidden rounded-card border border-mist bg-ink">
            {embed ? (
              <iframe
                key={active?._id}
                src={embed}
                title={active?.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-field via-white to-mint p-6 text-center">
                <div>
                  <p className="eyebrow text-brand">Lesson</p>
                  <p className="text-h3 mt-2 text-ink">{active?.title ?? "No lessons yet"}</p>
                  <p className="mt-2 text-sm text-muted">Video for this lesson has not been added yet.</p>
                </div>
              </div>
            )}
          </div>

          {active && (
            <div className="mt-5 rounded-card border border-mist bg-white p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted">
                    Lesson {activeIndex + 1} of {flat.length} &middot; {active.durationMin} min
                  </p>
                  <h2 className="text-h3 mt-1">{active.title}</h2>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  {!preview && (
                    <button type="button" onClick={toggle} disabled={saving} className={cn("btn btn-sm", isDone ? "btn-ghost" : "btn-primary")}>
                      {saving ? "Saving..." : isDone ? "Mark as incomplete" : "Mark complete"}
                    </button>
                  )}
                  {nextLesson && (
                    <button type="button" onClick={() => setActiveId(nextLesson._id)} className="btn btn-dark btn-sm">
                      Next lesson
                    </button>
                  )}
                </div>
              </div>
              {active.notes && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-graphite">{active.notes}</p>}
              {error && (
                <p role="alert" className="mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
          )}
        </section>

        <aside className="min-w-0">
          <div className="rounded-card border border-mist bg-white lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
            <h2 className="eyebrow border-b border-mist px-5 py-4 text-ink">Course content</h2>
            {data.course.modules.map((m, mi) => (
              <div key={m._id} className="border-b border-mist last:border-b-0">
                <p className="bg-fog px-5 py-3 text-sm font-semibold text-ink">
                  {mi + 1}. {m.title}
                </p>
                <ul>
                  {m.lessons.map((l) => {
                    const completed = done.has(l._id);
                    const current = l._id === activeId;
                    return (
                      <li key={l._id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(l._id)}
                          aria-current={current ? "true" : undefined}
                          className={cn(
                            "flex w-full items-center gap-3 px-5 py-3 text-left text-sm transition-colors hover:bg-field/60",
                            current && "bg-field"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                              completed ? "border-brand bg-brand text-white" : "border-mist bg-white text-transparent"
                            )}
                            aria-hidden="true"
                          >
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12l5 5 9-10" />
                            </svg>
                          </span>
                          <span className="min-w-0 flex-1 truncate text-ink">{l.title}</span>
                          <span className="shrink-0 text-xs text-muted">{l.durationMin}m</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
