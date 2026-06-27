import { useEffect } from 'react'
import ProviderCard from '@/components/ProviderCard'
import VideoCard from '@/components/VideoCard'
import { api } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { Play } from 'lucide-react'

export default function Home() {
  const providers = useAppStore((s) => s.providers)
  const recentPlays = useAppStore((s) => s.recentPlays)
  const setProviders = useAppStore((s) => s.setProviders)

  useEffect(() => {
    api.getProviders().then(setProviders).catch(() => {})
  }, [setProviders])

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">欢迎回到 VideoHub</h1>
        <p className="mt-2 text-hub-muted">
          在一个界面中管理哔哩哔哩、抖音、快手与央视网账号，统一浏览与播放。
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">平台入口</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {providers.map((p, idx) => (
            <div
              key={p.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
            >
              <ProviderCard config={p} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">最近播放</h2>
        {recentPlays.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-hub-card py-16 text-hub-muted">
            <Play size={40} className="mb-3 opacity-50" />
            <p>暂无播放记录，点击任意视频开始观看</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {recentPlays.slice(0, 5).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
