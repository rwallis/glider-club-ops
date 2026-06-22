import { site } from '../../data/siteContent'

export function IntroFlightsSection() {
  return (
    <section id="intro-flights" className="scroll-mt-28 relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-white to-sky-50" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl border border-amber-200/60 bg-white p-8 shadow-xl shadow-amber-900/5">
              <p className="text-5xl font-bold text-sky-950">$100</p>
              <p className="mt-1 text-sky-700">Introductory flight · ~30 minutes</p>

              <ul className="mt-8 space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="text-amber-500">✓</span>
                  First Saturday of every month, weather permitting
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-500">✓</span>
                  Flown by an instructor or commercial pilot
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-500">✓</span>
                  Gates open by 11 AM · demos from ~noon
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-500">✓</span>
                  First come, first served · shaded deck with field views
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-500">✓</span>
                  Weight limits: 110–230 lbs
                </li>
              </ul>

              <p className="mt-6 text-sm text-slate-500">
                Pay on the day via Venmo, Zelle, cash, or check — no cards. Call{' '}
                <a href={`tel:${site.phone.replace(/\D/g, '')}`} className="font-medium text-sky-700">
                  {site.phone}
                </a>{' '}
                before driving if weather is questionable.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Come fly with us</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-sky-950 sm:text-5xl">
              Your first flight in a glider
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Experience soaring yourself with a demo flight in our Schweizer 2-33 or Grob Twin Astir.
              Bring water, lunch or snacks, and plan for a wait on busy days — it is worth it.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Questions? Email{' '}
              <a href={`mailto:${site.email}`} className="font-medium text-sky-700 hover:underline">
                {site.email}
              </a>
            </p>
            <a
              href={`mailto:${site.email}?subject=Intro%20flight%20question`}
              className="mt-8 inline-flex rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-semibold text-amber-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400"
            >
              Ask about intro flights
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
