import { Link, NavLink, Outlet } from 'react-router-dom'
import { images } from '../../data/images'
import { useAuth } from '../../context/AuthContext'
import { useClubStatus } from '../../context/ClubStatusContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/30'
      : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`

export function MembersLayout() {
  const { logout } = useAuth()
  const { snapshot } = useClubStatus()

  return (
    <div className="members-dark min-h-screen">
      <header className="border-b border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-center gap-3 text-sky-200 hover:text-white">
              <img src={images.logo} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-sky-700" />
              <div>
                <p className="text-sm font-semibold text-white">{snapshot.clubName}</p>
                <p className="text-xs text-sky-400/80">Members</p>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-1">
              <NavLink to="/members" end className={navClass}>
                Field briefing
              </NavLink>
              <NavLink to="/members/signup" className={navClass}>
                Glider signup
              </NavLink>
              <NavLink to="/members/tasks" className={navClass}>
                Work items
              </NavLink>
            </nav>

            <button
              type="button"
              onClick={logout}
              className="self-start rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white sm:self-center"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
