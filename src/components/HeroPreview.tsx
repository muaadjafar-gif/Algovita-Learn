function TrafficLights() {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc20]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-fog">
      <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
    </div>
  );
}

/** Floating product mockups over soft gradient orbs. Purely decorative (aria-hidden). */
export default function HeroPreview() {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-[1000px] md:mt-20" aria-hidden="true">
      {/* orbs sit behind the cards, never behind text */}
      <span className="orb orb-violet -left-10 top-0 h-72 w-72 sm:h-96 sm:w-96" />
      <span className="orb orb-pink -right-6 top-10 h-64 w-64 sm:h-80 sm:w-80" />
      <span className="orb orb-amber bottom-0 left-1/3 hidden h-64 w-64 sm:block" />

      <div className="relative grid grid-cols-1 items-start gap-5 px-1 md:grid-cols-12 md:gap-6">
        {/* Student dashboard */}
        <div className="animate-float rounded-img border border-mist bg-white p-4 shadow-float md:col-span-5 md:mt-10">
          <div className="flex items-center justify-between">
            <TrafficLights />
            <span className="eyebrow text-[10px] text-brand">My learning</span>
          </div>
          <div className="mt-4 space-y-4">
            {[
              ["Full-Stack MERN", 72],
              ["Next.js & TypeScript", 45],
              ["AI Automation", 18],
            ].map(([title, pct]) => (
              <div key={title as string}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">{title}</span>
                  <span className="text-muted">{pct}%</span>
                </div>
                <Bar value={pct as number} />
              </div>
            ))}
          </div>
        </div>

        {/* Live cohort */}
        <div className="animate-float-slow rounded-img border border-mist bg-white p-4 shadow-float md:col-span-4">
          <div className="flex items-center justify-between">
            <TrafficLights />
            <span className="eyebrow text-[10px] text-brand">Live cohort</span>
          </div>
          <div className="mt-4 rounded-btn bg-field p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-deep">Today, 7:00 PM</p>
            <p className="mt-1 text-sm font-semibold text-ink">REST APIs with Express</p>
            <p className="text-xs text-graphite">Doubt-clearing session</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span>Week 4 of 16</span>
            <span className="pill pill-mint">On track</span>
          </div>
        </div>

        {/* Payment */}
        <div className="animate-float-late rounded-img border border-mist bg-white p-4 shadow-float md:col-span-3 md:mt-16">
          <div className="flex items-center justify-between">
            <TrafficLights />
            <span className="eyebrow text-[10px] text-brand">Checkout</span>
          </div>
          <div className="mt-4 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-mint">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5 9-10" />
              </svg>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">Payment received</p>
            <p className="text-xs text-muted">You are enrolled</p>
          </div>
        </div>
      </div>
    </div>
  );
}
