import { gliders, towPlanes } from '../../data/siteContent'

export function FleetSection() {
  return (
    <section id="fleet" className="scroll-mt-28 bg-sky-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Club aircraft</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Our fleet</h2>
          <p className="mt-4 text-lg text-sky-200">
            Six club gliders and two tow planes — plus member-owned ships on the field.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-amber-200">
              <span aria-hidden>✈️</span> Gliders
            </h3>
            <div className="space-y-3">
              {gliders.map((g) => (
                <article
                  key={g.name}
                  className="group flex items-center justify-between rounded-2xl border border-sky-800 bg-sky-900/50 px-5 py-4 transition hover:border-sky-600 hover:bg-sky-900"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {g.count > 1 ? `${g.count}× ` : ''}{g.name}
                    </p>
                    <p className="mt-0.5 text-sm text-sky-300">{g.detail}</p>
                  </div>
                  <span className="rounded-full bg-sky-800 px-3 py-1 text-xs font-medium text-sky-200">
                    {g.rate}
                  </span>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-amber-200">
              <span aria-hidden>🛫</span> Tow planes
            </h3>
            <div className="space-y-3">
              {towPlanes.map((t) => (
                <article
                  key={t.reg}
                  className="rounded-2xl border border-sky-800 bg-gradient-to-r from-sky-900/80 to-sky-800/40 px-5 py-5"
                >
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="mt-1 font-mono text-amber-300">{t.reg}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
              Member-owned gliders also fly at the field. Club ships are not rented to non-members.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
