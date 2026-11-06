import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import HeroPreview from "@/components/HeroPreview";
import Reveal from "@/components/Reveal";
import { SparkleIcon } from "@/components/Logo";
import { getCategories, getPublishedCourses } from "@/lib/data";
import { lessonCount } from "@/types";

export const dynamic = "force-dynamic";

const avatarColors = ["bg-lavender", "bg-orchid", "bg-brand", "bg-brand-deep"];

function Stars({ count = 5 }: { count?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 text-star" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L10 15l-5.3 3 1.1-6L1.4 7.8l6-.8L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

const features = [
  { title: "Live mentor sessions", body: "Weekly doubt-clearing and code reviews with working engineers, not just recorded videos.", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-3.13a4 4 0 100-8 4 4 0 000 8z" },
  { title: "Project-first curriculum", body: "Every module ends with something you can ship, so your portfolio grows as you learn.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Progress that sticks", body: "Lesson-level tracking and a dashboard that always shows exactly where to pick up.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
  { title: "Secure online payments", body: "Pay with UPI, cards or net banking through Razorpay. Access unlocks the moment payment clears.", icon: "M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" },
  { title: "Learn on any device", body: "Phone, tablet or laptop. The platform adapts so you can study on the commute or at your desk.", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { title: "Certificates & career help", body: "Finish a programme to earn a certificate, plus portfolio and interview guidance.", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
];

const steps = [
  { n: "01", title: "Pick your program", body: "Browse by category, level and duration. Every course shows its full curriculum before you pay." },
  { n: "02", title: "Enroll securely", body: "Create your account and check out with Razorpay. Your course unlocks instantly after payment." },
  { n: "03", title: "Learn and track", body: "Work through lessons at your pace, mark progress and pick up exactly where you left off." },
];

const testimonials = [
  { name: "Aditi R.", role: "Junior developer", quote: "The project-first approach meant I had a real portfolio by week eight. Mentor reviews were the best part." },
  { name: "Mohammed S.", role: "Career switcher", quote: "I studied after work on my phone and laptop. The dashboard always told me exactly what to do next." },
  { name: "Neha K.", role: "Freelance designer", quote: "Clear lessons, no filler. I shipped my first automation for a client within a month of finishing." },
  { name: "Arjun P.", role: "Final-year student", quote: "Payment and enrollment took under two minutes, and the course was unlocked right away." },
  { name: "Fatima Z.", role: "Data analyst", quote: "The pacing is realistic. Short lessons, honest projects, and mentors who actually reply." },
  { name: "Rahul M.", role: "Startup founder", quote: "My whole team went through the AI automation course. We saved hours every week afterwards." },
];

const faqs = [
  { q: "Do I need prior experience?", a: "Not for our beginner programs. Every course lists its level, and the free Web Development Foundations course is a good place to start." },
  { q: "How do payments work?", a: "Payments are processed by Razorpay. You can pay by UPI, debit or credit card, or net banking. Your course unlocks automatically as soon as the payment is confirmed." },
  { q: "Can I learn on my phone?", a: "Yes. The whole platform is built mobile-first and works on phones, tablets and desktops." },
  { q: "How long do I have access?", a: "Once enrolled, your course stays in your dashboard so you can revisit lessons whenever you like." },
  { q: "What if my payment succeeded but I do not see the course?", a: "Enrollment is confirmed both from your browser and from Razorpay directly, so it usually appears within seconds. If it does not, contact us with your payment ID and we will fix it." },
];

export default async function HomePage() {
  const { courses, demo } = await getPublishedCourses();
  const categories = getCategories(courses);
  const featured = courses.slice(0, 6);
  const learners = courses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const lessons = courses.reduce((sum, c) => sum + lessonCount(c), 0);

  const stats = [
    { value: String(courses.length), label: "Technical programs" },
    { value: String(categories.length), label: "Career tracks" },
    { value: String(lessons), label: "Guided lessons" },
    { value: learners > 0 ? learners.toLocaleString("en-IN") : "0", label: "Enrollments" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="container-page section-y pb-8 text-center md:pb-10">
          <p className="eyebrow animate-fade-up text-brand">Technical learning platform by Algovita Digital</p>
          <h1 className="text-display mx-auto mt-4 max-w-[720px] animate-fade-up text-ink [animation-delay:80ms]">
            Learn the skills that get you hired
          </h1>
          <p className="text-lead mx-auto mt-5 max-w-[620px] animate-fade-up [animation-delay:160ms]">
            Full-stack development, AI automation, data science and cloud engineering. Live mentors, real projects and a
            dashboard that keeps you moving.
          </p>

          <div className="mt-8 flex animate-fade-up flex-col items-stretch justify-center gap-3 [animation-delay:240ms] sm:flex-row sm:items-center">
            <Link href="/courses" className="btn btn-primary">
              <SparkleIcon className="h-4 w-4" />
              Explore courses
            </Link>
            <Link href="/register" className="btn btn-ghost">
              Create free account
            </Link>
          </div>

          <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:320ms] sm:flex-row">
            <div className="flex items-center" aria-hidden="true">
              {["A", "M", "N", "R"].map((l, i) => (
                <span
                  key={l}
                  className={`${avatarColors[i]} -ml-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-sm font-semibold text-white first:ml-0`}
                >
                  {l}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-ink">
              <Stars />
              <span>Learn with mentors who ship</span>
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-fog">
        <div className="container-page grid grid-cols-2 gap-6 py-10 text-center md:grid-cols-4 md:py-12">
          {stats.map((s) => (
            <Reveal key={s.label}>
              <p className="text-h1 text-ink">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATALOG PREVIEW */}
      <section className="container-page section-y" id="courses">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <p className="eyebrow text-brand">Course catalog</p>
          <h2 className="text-h1 mt-4">Programs built around real jobs</h2>
          <p className="text-lead mt-4">Pick a track, see the full curriculum, and start learning today.</p>
        </Reveal>

        <Reveal className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/courses?category=${encodeURIComponent(c)}`}
              className="pill pill-fog px-4 py-2 text-sm transition-colors hover:bg-field hover:text-brand-deep"
            >
              {c}
            </Link>
          ))}
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {featured.map((c, i) => (
            <Reveal key={c._id} delay={(i % 3) * 80}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>

        {demo && (
          <p className="mx-auto mt-8 max-w-xl rounded-btn bg-fog px-4 py-3 text-center text-sm text-muted">
            Showing demo content. Add <code className="font-semibold">MONGODB_URI</code> to <code className="font-semibold">.env.local</code> and run{" "}
            <code className="font-semibold">npm run seed</code> to load the real catalog.
          </p>
        )}

        <div className="mt-10 text-center">
          <Link href="/courses" className="btn btn-dark">
            Browse all courses
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* LAVENDER BAND */}
      <section className="bg-field">
        <div className="container-page section-y grid items-center gap-8 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="eyebrow text-ink">Student dashboard</p>
            <h2 className="text-h1 mt-4 max-w-[560px] text-ink">Your learning hub, your pace</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-base text-graphite">
              See every enrolled course, resume the exact lesson you left, and watch your progress climb. Whether you are on
              a phone in transit or a laptop at home, everything stays in sync.
            </p>
            <Link href="/dashboard" className="btn btn-dark mt-6">
              Open my dashboard
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page section-y" id="features">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <p className="eyebrow text-brand">Why Algovita Learn</p>
          <h2 className="text-h1 mt-4">Everything you need to actually finish</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <div className="motion-lift h-full rounded-card border border-mist bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-btn bg-field text-brand">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon} />
                  </svg>
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-mint">
        <div className="container-page section-y">
          <Reveal className="mx-auto max-w-[720px] text-center">
            <p className="eyebrow text-ink">How it works</p>
            <h2 className="text-h1 mt-4 text-ink">From sign-up to first lesson in minutes</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="h-full rounded-card bg-white p-6">
                  <span className="pill pill-ink">{s.n}</span>
                  <h3 className="text-h3 mt-5 text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm text-graphite">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page section-y" id="testimonials">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <p className="eyebrow text-brand">Testimonial</p>
          <h2 className="text-h1 mt-4">Learners who made the switch</h2>
        </Reveal>
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 80} className="mb-5 break-inside-avoid">
              <figure className="motion-lift rounded-card border border-mist bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className={`${avatarColors[i % 4]} flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white`} aria-hidden="true">
                    {t.name[0]}
                  </span>
                  <div className="min-w-0">
                    <figcaption className="truncate text-base font-semibold text-ink">{t.name}</figcaption>
                    <p className="truncate text-sm text-muted">{t.role}</p>
                  </div>
                </div>
                <blockquote className="mt-4 text-[15px] leading-relaxed text-ink">{t.quote}</blockquote>
                <div className="mt-4">
                  <Stars />
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-fog" id="faq">
        <div className="container-page section-y">
          <Reveal className="mx-auto max-w-[720px] text-center">
            <p className="eyebrow text-brand">FAQ</p>
            <h2 className="text-h1 mt-4">Questions, answered</h2>
          </Reveal>
          <div className="mx-auto mt-10 max-w-[760px] space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-card border border-mist bg-white px-5 py-4 open:shadow-sm sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-page section-y">
        <Reveal>
          <div className="rounded-feature bg-ink px-6 py-12 text-center sm:px-12 md:py-16">
            <h2 className="text-h1 mx-auto max-w-[620px] text-white">Start learning something worth building</h2>
            <p className="mx-auto mt-4 max-w-[520px] text-base text-white/70">
              Create your free account, try the foundations course, and upgrade whenever you are ready.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn btn-primary">
                Sign up for free
              </Link>
              <Link href="/courses" className="btn border border-white/30 text-white hover:bg-white/10">
                Browse courses
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
