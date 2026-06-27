import { useEffect, useState } from 'react'
import { RefreshCw, Unlink, Tv, Music, Video, Radio } from 'lucide-react'
import { api } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import type { ProviderConfig } from '@/types'

const iconMap: Record<string, React.ElementType> = {
  tv: Tv,
  music: Music,
  video: Video,
  radio: Radio,
}

function AccountCard({ config }: { config: ProviderConfig }) {
  const Icon = iconMap[config.icon] || Tv
  const [refreshing, setRefreshing] = useState(false)
  const updateProvider = useAppStore((s) => s.updateProvider)
  const setProviders = useAppStore((s) => s.setProviders)

  const handleUnlink = async () => {
    await api.unlinkAccount(config.id)
    const list = await api.getProviders()
    setProviders(list)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await api.refreshToken(config.id)
      updateProvider({
        ...config,
        expiresAt: res.expiresAt,
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-hub-card p-4">
      <div className="flex items-center gap-4">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ color: config.color, backgroundColor: `${config.color}15` }}
        >
          <Icon size={22} />
        </span>
        <div>
          <h3 className="font-semibold text-white">{config.name}</h3>
          {config.isLoggedIn ? (
            <p className="text-xs text-hub-muted">
              {config.nickname || '已授权'} · 过期时间：
              {config.expiresAt
                ? new Date(config.expiresAt * 1000).toLocaleString()
                : '未知'}
            </p>
          ) : (
            <p className="text-xs text-hub-muted">未绑定账号</p>
          )}
        </div>
      </div>
      {config.isLoggedIn && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg border border-white/10 p-2 text-hub-muted transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
            title="刷新 token"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleUnlink}
            className="rounded-lg border border-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/10"
            title="解绑"
          >
            <Unlink size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  const providers = useAppStore((s) => s.providers)
  const mockMode = useAppStore((s) => s.mockMode)
  const setProviders = useAppStore((s) => s.setProviders)
  const setMockMode = useAppStore((s) => s.setMockMode)

  useEffect(() => {
    api.getProviders().then(setProviders).catch(() => {})
  }, [setProviders])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">设置</h1>
      <p className="mt-2 text-hub-muted">管理已绑定的平台账号与演示模式。</p>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">账号管理</h2>
        <div className="space-y-3">
          {providers.map((p) => (
            <AccountCard key={p.id} config={p} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-white/5 bg-hub-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">演示模式</h3>
            <p className="text-sm text-hub-muted">
              开启后即使未配置平台密钥或未登录，也会返回模拟视频数据。
            </p>
          </div>
          <button
            onClick={() => setMockMode(!mockMode)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              mockMode ? 'bg-douyin' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                mockMode ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  )
}
