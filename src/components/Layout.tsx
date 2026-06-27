import { NavLink, Outlet } from 'react-router-dom'
import { Home, Settings, Tv, Music, Video, Radio } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import type { ProviderConfig } from '@/types'

const iconMap: Record<string, React.ElementType> = {
  tv: Tv,
  music: Music,
  video: Video,
  radio: Radio,
}

function ProviderIcon({ config }: { config: ProviderConfig }) {
  const Icon = iconMap[config.icon] || Tv
  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-lg"
      style={{ color: config.color, backgroundColor: `${config.color}15` }}
    >
      <Icon size={18} />
    </span>
  )
}

export default function Layout() {
  const providers = useAppStore((s) => s.providers)

  return (
    <div className="flex h-full">
      <aside className="flex w-60 flex-col border-r border-white/5 bg-hub-card">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-douyin to-bilibili text-white">
            <Video size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            VideoHub
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-hub-muted hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Home size={18} />
            首页
          </NavLink>

          <div className="pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-hub-muted">
            平台
          </div>
          {providers.map((p) => (
            <NavLink
              key={p.id}
              to={`/platform/${p.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-hub-muted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <ProviderIcon config={p} />
              <span className="flex-1">{p.name}</span>
              {p.isLoggedIn && (
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              )}
            </NavLink>
          ))}

          <div className="pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-hub-muted">
            系统
          </div>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-hub-muted hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Settings size={18} />
            设置
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto bg-hub-bg">
        <Outlet />
      </main>
    </div>
  )
}
