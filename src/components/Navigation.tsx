import { NavLink } from 'react-router-dom';
import { Dumbbell, Calendar, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/workout', label: 'Workout', Icon: Dumbbell },
  { to: '/calendar', label: 'Calendar', Icon: Calendar },
  { to: '/data', label: 'My Data', Icon: BarChart3 },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
];

export default function Navigation() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="glass border-b-0 border-t border-white/10 rounded-t-2xl shadow-glass">
        <ul className="grid grid-cols-4 max-w-md mx-auto">
          {links.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center py-2.5 text-[11px] tracking-wide transition-all relative',
                    isActive
                      ? 'text-crimson-100'
                      : 'text-white/50 hover:text-white/80',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'h-1 w-10 rounded-full mb-1 transition-all',
                        isActive ? 'bg-crimson shadow-crimson' : 'bg-transparent',
                      )}
                    />
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.25 : 1.75}
                      className={cn(isActive && 'text-crimson-100')}
                    />
                    <span className="mt-1 font-medium">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 p-5 gap-3 sticky top-0 h-screen">
      <div className="flex items-center gap-3 mb-4 pl-2">
        <div className="h-10 w-10 rounded-xl3 bg-gradient-to-br from-crimson to-crimson-800 shadow-crimson grid place-items-center">
          <Dumbbell size={20} className="text-white" />
        </div>
        <div>
          <p className="font-display text-xl font-bold text-white/95 leading-none">
            GYMAKER
          </p>
          <p className="text-[11px] text-white/45 tracking-widest uppercase mt-0.5">
            Liquid Glass
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {links.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                  isActive
                    ? 'bg-crimson/15 text-crimson-50 border border-crimson/50 shadow-crimson'
                    : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent',
                )
              }
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <div className="glass-soft rounded-xl3 p-4 text-xs text-white/60 leading-relaxed">
          <p className="text-white/80 font-semibold text-sm mb-1">Tip</p>
          Log a workout on the Workout tab and check your PRs on My Data.
        </div>
      </div>
    </aside>
  );
}
