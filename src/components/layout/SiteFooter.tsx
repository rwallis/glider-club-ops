import { Link } from 'react-router-dom'
import { images } from '../../data/images'
import { site } from '../../data/siteContent'

export function SiteFooter() {
  return (
    <footer className="bg-sky-950 text-sky-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={images.logo}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-2 ring-sky-700"
              />
              <div>
                <p className="font-bold text-white">{site.name}</p>
                <p className="text-sm text-sky-300">SSA Chapter · {site.location}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sky-300/90">
              Promoting, educating, and encouraging participation in the sport of soaring across Central Texas.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300">Visit us</h3>
            <ul className="mt-4 space-y-2 text-sm text-sky-200">
              <li>{site.airportName}</li>
              <li>{site.airportAddress}</li>
              <li className="text-sky-400">{site.airportNote}</li>
              <li>Weekends · gates open by 11 AM</li>
              <li>
                <a href={`tel:${site.phone.replace(/\D/g, '')}`} className="hover:text-white">
                  {site.phone}
                </a>
                <span className="text-sky-400"> (weekends)</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300">Connect</h3>
            <ul className="mt-4 space-y-2 text-sm text-sky-200">
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-white">
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                  Directions on Google Maps
                </a>
              </li>
              <li>
                <Link to="/members" className="hover:text-white">
                  Member login →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-sky-800 pt-8 text-center text-xs text-sky-500">
          © {new Date().getFullYear()} {site.name}. Not-for-profit SSA chapter.
        </div>
      </div>
    </footer>
  )
}
