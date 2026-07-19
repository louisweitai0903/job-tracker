import type { View } from '../types'

interface Props {
  activeView: View
  onNavigate: (view: View) => void
  onNewJob: () => void
}

export default function Sidebar({ activeView, onNavigate, onNewJob }: Props) {
  const navItems: { view: View; icon: string; label: string }[] = [
    { view: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { view: 'profile', icon: 'person', label: 'My Profile' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-surface-container-lowest flex flex-col py-lg px-md shadow-sidebar z-50">
      {/* Logo */}
      <div className="mb-xl px-sm">
        <div className="flex items-center gap-sm mb-xs">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">trending_up</span>
          </div>
          <h1 className="text-headline-md font-bold text-primary">CareerFlow</h1>
        </div>
        <p className="text-label-sm text-on-surface-variant opacity-70 pl-[40px]">Career Management</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-xs">
        {navItems.map(({ view, icon, label }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`w-full flex items-center gap-md p-md rounded-lg text-body-md transition-all active:scale-95 ${
              activeView === view
                ? 'text-secondary font-bold bg-surface-container-low'
                : 'text-on-surface-variant opacity-70 hover:bg-surface-container-low hover:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto pt-lg space-y-xl">
        <button
          onClick={onNewJob}
          className="w-full bg-secondary text-on-secondary py-md px-lg rounded-lg text-label-md flex items-center justify-center gap-sm shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Application
        </button>

        {/* User row */}
        <div className="flex items-center gap-md px-sm">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-label-md font-bold shrink-0">
            U
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-label-md text-primary truncate">User</span>
            <span className="text-xs text-on-surface-variant">Free Plan</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
