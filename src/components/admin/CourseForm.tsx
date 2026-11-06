"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/client";
import { slugify } from "@/lib/utils";
import type { CourseDTO } from "@/types";

interface LessonState {
  _id?: string;
  title: string;
  durationMin: number;
  videoUrl: string;
  notes: string;
}
interface ModuleState {
  _id?: string;
  title: string;
  lessons: LessonState[];
}
interface FormState {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationWeeks: number;
  instructor: string;
  price: number;
  originalPrice: number;
  featuresText: string;
  published: boolean;
  modules: ModuleState[];
}

function fromCourse(c?: CourseDTO): FormState {
  return {
    title: c?.title ?? "",
    slug: c?.slug ?? "",
    shortDescription: c?.shortDescription ?? "",
    description: c?.description ?? "",
    category: c?.category ?? "Web Development",
    level: c?.level ?? "Beginner",
    durationWeeks: c?.durationWeeks ?? 4,
    instructor: c?.instructor ?? "Team Algovita",
    price: c?.price ?? 0,
    originalPrice: c?.originalPrice ?? 0,
    featuresText: (c?.features ?? []).join("\n"),
    published: c?.published ?? true,
    modules:
      c?.modules.map((m) => ({
        _id: m._id,
        title: m.title,
        lessons: m.lessons.map((l) => ({
          _id: l._id,
          title: l.title,
          durationMin: l.durationMin,
          videoUrl: l.videoUrl ?? "",
          notes: l.notes ?? "",
        })),
      })) ?? [],
  };
}

export default function CourseForm({
  course,
  onSaved,
  onCancel,
}: {
  course?: CourseDTO;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(() => fromCourse(course));
  const [slugTouched, setSlugTouched] = useState(Boolean(course));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setF((p) => ({ ...p, [key]: value }));

  function updateModule(i: number, patch: Partial<ModuleState>) {
    setF((p) => ({ ...p, modules: p.modules.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) }));
  }
  function updateLesson(mi: number, li: number, patch: Partial<LessonState>) {
    setF((p) => ({
      ...p,
      modules: p.modules.map((m, idx) =>
        idx === mi ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)) } : m
      ),
    }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      title: f.title,
      slug: f.slug,
      shortDescription: f.shortDescription,
      description: f.description,
      category: f.category,
      level: f.level,
      durationWeeks: f.durationWeeks,
      instructor: f.instructor,
      price: f.price,
      originalPrice: f.originalPrice,
      features: f.featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
      published: f.published,
      modules: f.modules,
    };
    try {
      if (course) await api(`/api/admin/courses/${course._id}`, { method: "PUT", json: payload });
      else await api("/api/admin/courses", { method: "POST", json: payload });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save course");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-card border border-mist bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h3">{course ? "Edit course" : "New course"}</h2>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-muted hover:text-ink">
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="c-title">Title</label>
          <input
            id="c-title"
            className="input"
            required
            value={f.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-slug">Slug (URL)</label>
          <input
            id="c-slug"
            className="input"
            required
            value={f.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-cat">Category</label>
          <input id="c-cat" className="input" required value={f.category} onChange={(e) => set("category", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="c-short">Short description</label>
          <input id="c-short" className="input" required maxLength={220} value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="c-desc">Full description</label>
          <textarea id="c-desc" className="input min-h-32" required value={f.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="c-level">Level</label>
          <select id="c-level" className="input" value={f.level} onChange={(e) => set("level", e.target.value as FormState["level"])}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="c-weeks">Duration (weeks)</label>
          <input id="c-weeks" type="number" min={1} className="input" required value={f.durationWeeks} onChange={(e) => set("durationWeeks", Number(e.target.value))} />
        </div>
        <div>
          <label className="label" htmlFor="c-price">Price (INR, 0 = free)</label>
          <input id="c-price" type="number" min={0} className="input" required value={f.price} onChange={(e) => set("price", Number(e.target.value))} />
        </div>
        <div>
          <label className="label" htmlFor="c-orig">Original price (INR, optional)</label>
          <input id="c-orig" type="number" min={0} className="input" value={f.originalPrice} onChange={(e) => set("originalPrice", Number(e.target.value))} />
        </div>
        <div>
          <label className="label" htmlFor="c-inst">Instructor</label>
          <input id="c-inst" className="input" required value={f.instructor} onChange={(e) => set("instructor", e.target.value)} />
        </div>
        <div className="flex items-end">
          <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold">
            <input type="checkbox" className="h-5 w-5 accent-[#862fe7]" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
            Published (visible in catalog)
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="c-feat">Highlights (one per line)</label>
          <textarea id="c-feat" className="input min-h-28" value={f.featuresText} onChange={(e) => set("featuresText", e.target.value)} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Curriculum</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => set("modules", [...f.modules, { title: "", lessons: [{ title: "", durationMin: 10, videoUrl: "", notes: "" }] }])}
          >
            Add module
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {f.modules.map((m, mi) => (
            <div key={m._id ?? `new-${mi}`} className="rounded-img border border-mist bg-fog/60 p-4">
              <div className="flex gap-2">
                <input
                  aria-label={`Module ${mi + 1} title`}
                  className="input"
                  placeholder={`Module ${mi + 1} title`}
                  required
                  value={m.title}
                  onChange={(e) => updateModule(mi, { title: e.target.value })}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm shrink-0"
                  onClick={() => set("modules", f.modules.filter((_, i) => i !== mi))}
                  aria-label={`Remove module ${mi + 1}`}
                >
                  Remove
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {m.lessons.map((l, li) => (
                  <div key={l._id ?? `new-${mi}-${li}`} className="rounded-btn border border-mist bg-white p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_96px]">
                      <input
                        aria-label="Lesson title"
                        className="input"
                        placeholder="Lesson title"
                        required
                        value={l.title}
                        onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                      />
                      <input
                        aria-label="Minutes"
                        type="number"
                        min={0}
                        className="input"
                        placeholder="Min"
                        value={l.durationMin}
                        onChange={(e) => updateLesson(mi, li, { durationMin: Number(e.target.value) })}
                      />
                    </div>
                    <input
                      aria-label="Video URL"
                      className="input mt-2"
                      placeholder="YouTube or Vimeo URL (optional)"
                      value={l.videoUrl}
                      onChange={(e) => updateLesson(mi, li, { videoUrl: e.target.value })}
                    />
                    <textarea
                      aria-label="Lesson notes"
                      className="input mt-2 min-h-20"
                      placeholder="Lesson notes (optional)"
                      value={l.notes}
                      onChange={(e) => updateLesson(mi, li, { notes: e.target.value })}
                    />
                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-red-700 hover:underline"
                      onClick={() => updateModule(mi, { lessons: m.lessons.filter((_, j) => j !== li) })}
                    >
                      Remove lesson
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-3 text-sm font-semibold text-brand hover:underline"
                onClick={() => updateModule(mi, { lessons: [...m.lessons, { title: "", durationMin: 10, videoUrl: "", notes: "" }] })}
              >
                + Add lesson
              </button>
            </div>
          ))}
          {f.modules.length === 0 && <p className="text-sm text-muted">No modules yet. Add one to build the curriculum.</p>}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-btn bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : course ? "Save changes" : "Create course"}
        </button>
      </div>
    </form>
  );
}
