import { board, site } from '../../data/siteContent'

export function ContactSection() {
  return (
    <section id="visit" className="scroll-mt-28 bg-sky-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Directions</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">Find us in Briggs</h2>
            <div className="mt-8 space-y-4 text-sky-200">
              <p>
                <span className="font-semibold text-white">{site.airportName}</span><br />
                {site.airportAddress}<br />
                <span className="text-sky-400">{site.airportNote}</span>
              </p>
              <p>
                <span className="font-semibold text-white">Mailing:</span><br />
                {site.mailingAddress}
              </p>
              <p>
                <span className="font-semibold text-white">Weekend phone:</span><br />
                <a href={`tel:${site.phone.replace(/\D/g, '')}`} className="hover:text-white">
                  {site.phone}
                </a>
              </p>
            </div>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-300"
            >
              Open in Google Maps
            </a>
          </div>

          <div
            id="contact"
            className="scroll-mt-28 rounded-3xl border border-sky-800 bg-sky-900/50 p-8"
          >
            <h3 className="text-xl font-bold">Get in touch</h3>
            <p className="mt-3 text-sky-300">
              For membership, intro flights, guest pilot visits, or general questions:
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-6 block text-2xl font-semibold text-amber-300 hover:text-amber-200"
            >
              {site.email}
            </a>

            <div className="mt-10 border-t border-sky-800 pt-8">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-300">Board of directors</h4>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {board.map((person) => (
                  <li key={person.role} className="text-sm">
                    <span className="text-sky-400">{person.role}:</span>{' '}
                    <span className="text-white">{person.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
