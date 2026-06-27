import { Tv, Music, Video, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProviderConfig } from '@/types'

const iconMap: Record<string, React.ElementType> = {
  tv: Tv,
  music: Music,
  video: Video,
  radio: Radio,
}

export default function ProviderCard({ config }: { config: ProviderConfig }) {
  const Icon = iconMap[config.icon] || Tv
  const statusText = config.isLoggedIn
    ? '已登录'
    : config.oauthAvailable
      ? '未登录'
      : '演示模式'

  return (
    <Link
      to={`/platform/${config.id}`}
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-hub-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-opacity-50 hover:shadow-lg"
      style={{
        borderColor: config.color,
        boxShadow: `0 0 0 0 ${config.color}00`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 30px -8px ${config.color}40`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 0 ${config.color}00`
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ color: config.color, backgroundColor: `${config.color}15` }}
        >
          <Icon size={26} />
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            color: config.isLoggedIn ? config.color : '#8892B0',
            backgroundColor: config.isLoggedIn ? `${config.color}15` : '#1F2833',
          }}
        >
          {statusText}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-white">{config.name}</h3>
      <p className="mt-1 text-sm text-hub-muted">
        {config.isLoggedIn ? config.nickname || '已授权' : '点击浏览视频'}
      </p>
    </Link>
  )
}
