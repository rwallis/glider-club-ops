import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClubLogo } from './ClubLogo'
import { navLinks } from '../../data/siteContent'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/80 px-4 py-3 shadow-lg shadow-sky-900/10 backdrop-blur-xl sm:px-6">
          <Link to="/" onClick={() => setOpen(false)}>
            <ClubLogo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-sky-900/80 transition hover:bg-sky-50 hover:text-sky-950"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/members"
              className="ml-2 rounded-xl bg-sky-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
            >
              Members
            </Link>
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 text-sky-900 lg:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="mt-2 rounded-2xl border border-white/20 bg-white/90 p-4 shadow-xl backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-sky-900"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/members"
                className="mt-2 rounded-xl bg-sky-900 px-4 py-2.5 text-center text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Members
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
