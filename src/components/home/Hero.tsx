import { site } from '../../data/siteContent'
import { images } from '../../data/images'
import { CLUB_MEMBER_COUNT } from '../../data/members'

export function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      <img
        src={images.hero}
        alt="Grob Twin Astir glider on the grass field at FLF Gliderport, Briggs Texas"
        className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-sky-950/90 via-sky-950/55 to-sky-900/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-sky-950/30" />

      <div className="pointer-events-none absolute -left-20 top-32 h-40 w-96 rounded-full bg-white/10 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute right-0 top-48 h-52 w-[28rem] rounded-full bg-amber-300/10 blur-3xl animate-float-slower" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 pb-20 pt-36 sm:px-6 lg:px-8">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Briggs, Texas · SSA Chapter
        </p>

        <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Soar above the{' '}
          <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            Hill Country
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sky-100/90 sm:text-xl">
          Fault Line Flyers is a not-for-profit glider club flying every weekend from{' '}
          {site.airportName} — {site.runwayLength} feet of grass, instruction, aero tow, auto tow,
          and an excellent safety culture.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#intro-flights"
            className="rounded-2xl bg-amber-400 px-7 py-3.5 text-sm font-semibold text-amber-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-300"
          >
            Book an intro flight — $100
          </a>
          <a
            href="#about"
            className="rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Learn about the club
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'Grass runway', value: `${site.runwayLength} ft` },
            { label: 'Club gliders', value: '6' },
            { label: 'Tow planes', value: '2' },
            { label: 'Members', value: String(CLUB_MEMBER_COUNT) },
            { label: 'Flying', value: 'Weekends' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md"
            >
              <dt className="text-xs font-medium uppercase tracking-wider text-sky-200/80">
                {stat.label}
              </dt>
              <dd className="mt-1 text-2xl font-bold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/60">
        <a href="#about" aria-label="Scroll to content">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  )
}

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-28 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">About us</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-sky-950 sm:text-5xl">
              Built by pilots, for pilots
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
              <p>
                We are the Fault Line Flyers — a glider club with members from the Central Texas
                (Austin) area. Our goal is to promote, educate, and encourage participation in
                the sport of soaring.
              </p>
              <p>
                We are a not-for-profit corporation and a local chapter of the{' '}
                <a href={site.ssaUrl} className="font-medium text-sky-700 underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                  Soaring Society of America
                </a>
                . All members pitch in to run the club and keep operating costs low.
              </p>
              <p>
                The club operates every weekend from {site.airportName} with a {site.runwayLength}-foot
                grass runway in Briggs, Texas. We provide flight instruction and programs for
                beginners, solo pilots, and those adding a glider rating to an airplane certificate.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-sky-900/15 ring-1 ring-sky-100">
              <img
                src={images.hero}
                alt="Club glider on the Briggs field"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-amber-400 px-5 py-3 shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-950">Home field</p>
              <p className="font-semibold text-amber-950">{site.airportName}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: '🎓', title: 'Instruction', text: 'Private Pilot Glider training for all experience levels.' },
            { icon: '🛡️', title: 'Safety first', text: 'Excellent safety record backed by experienced instructors.' },
            { icon: '🔗', title: 'Aero & auto tow', text: 'Flexible launch options every flying weekend.' },
            { icon: '🤝', title: 'Member-run', text: 'Volunteer culture that keeps costs manageable.' },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm"
            >
              <span className="text-2xl" aria-hidden>{card.icon}</span>
              <h3 className="mt-3 font-bold text-sky-950">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
