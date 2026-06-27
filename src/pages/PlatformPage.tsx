import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { RefreshCw, LogIn, MonitorPlay } from 'lucide-react'
import VideoCard from '@/components/VideoCard'
import { api } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import type { Video } from '@/types'

export default function PlatformPage() {
  const { provider } = useParams<{ provider: string }>()
  const providers = useAppStore((s) => s.providers)
  const mockMode = useAppStore((s) => s.mockMode)
  const config = providers.find((p) => p.id === provider)

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!provider) return
    setLoading(true)
    setError('')
    try {
      const res = await api.getVideos(provider, mockMode)
      setVideos(res.videos)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, mockMode])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'oauth-callback') {
        api.getProviders().then(useAppStore.getState().setProviders)
        load()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider])

  const handleLogin = async () => {
    if (!provider) return
    try {
      const { url } = await api.getAuthUrl(provider)
      const w = 600
      const h = 700
      const left = window.screenX + (window.outerWidth - w) / 2
      const top = window.screenY + (window.outerHeight - h) / 2
      window.open(
        url,
        'oauth',
        `width=${w},height=${h},left=${left},top=${top}`,
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '打开授权窗口失败')
    }
  }

  if (!config) {
    return (
      <div className="p-8 text-hub-muted">平台不存在或正在加载...</div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ color: config.color, backgroundColor: `${config.color}15` }}
          >
            <MonitorPlay size={28} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">{config.name}</h1>
            <p className="text-sm text-hub-muted">
              {config.isLoggedIn
                ? `已登录：${config.nickname || '用户'}`
                : config.oauthAvailable
                  ? '未登录，授权后可获取真实数据'
                  : '当前为演示模式，未配置平台密钥'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!config.isLoggedIn && config.oauthAvailable && (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: config.color }}
            >
              <LogIn size={16} />
              授权登录
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-hub-card px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-xl bg-hub-card"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
