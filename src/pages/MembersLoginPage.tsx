import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, DEFAULT_MEMBER_ACCESS_CODE } from '../context/AuthContext'
import { USE_DEFAULT_MEMBER_ACCESS } from '../config/auth'
import { images } from '../data/images'
import { site } from '../data/siteContent'

export function MembersLoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [code, setCode] = useState(DEFAULT_MEMBER_ACCESS_CODE)
  const [error, setError] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/members'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (login(code)) {
      navigate(from, { replace: true })
    } else {
      setError(true)
    }
  }

  return (
    <div className="members-dark flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 text-sky-300 hover:text-white">
          <img src={images.logo} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-sky-700" />
          <span className="text-sm font-medium">← Back to {site.name}</span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-400">Members only</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Club equipment status</h1>
          <p className="mt-2 text-sm text-slate-400">
            {USE_DEFAULT_MEMBER_ACCESS
              ? 'Temporary club access code — Google sign-in coming soon.'
              : 'Enter the member access code to view hangar, fleet, and field status.'}
          </p>

          {USE_DEFAULT_MEMBER_ACCESS && (
            <p className="mt-3 rounded-lg bg-sky-500/10 px-3 py-2 text-sm text-sky-200 ring-1 ring-sky-400/20">
              Default code: <span className="font-mono font-semibold text-white">{DEFAULT_MEMBER_ACCESS_CODE}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="access-code" className="sr-only">
                Access code
              </label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError(false)
                }}
                placeholder="Member access code"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-rose-400">Invalid access code. Contact a board member if you need help.</p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
