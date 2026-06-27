import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, Heart, MessageCircle, Calendar } from 'lucide-react'
import VideoPlayer from '@/components/VideoPlayer'
import { api } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import type { Video } from '@/types'

function formatNumber(n?: number) {
  if (n === undefined) return '-'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  return n.toString()
}

export default function WatchPage() {
  const { provider, videoId } = useParams<{ provider: string; videoId: string }>()
  const navigate = useNavigate()
  const addRecentPlay = useAppStore((s) => s.addRecentPlay)

  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!provider || !videoId) return
    setLoading(true)
    api
      .getVideo(provider, videoId)
      .then((v) => {
        setVideo(v)
        addRecentPlay(v)
      })
      .catch((err) => setError(err.message || '加载失败'))
      .finally(() => setLoading(false))
  }, [provider, videoId, addRecentPlay])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-hub-muted">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-hub-muted">
        <p>{error || '视频不存在'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-hub-card px-4 py-2 text-sm text-white hover:bg-white/5"
        >
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm text-hub-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          返回
        </button>
        <div className="animate-fade-in-up" style={{ opacity: 0 }}>
          <VideoPlayer video={video} />
        </div>
        <h1 className="mt-5 text-xl font-bold text-white">{video.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-hub-muted">
          {video.viewCount !== undefined && (
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {formatNumber(video.viewCount)} 播放
            </span>
          )}
          {video.likeCount !== undefined && (
            <span className="flex items-center gap-1">
              <Heart size={14} />
              {formatNumber(video.likeCount)} 赞
            </span>
          )}
          {video.commentCount !== undefined && (
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {formatNumber(video.commentCount)} 评论
            </span>
          )}
          {video.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(video.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <aside className="w-full border-t border-white/5 bg-hub-card p-6 lg:w-80 lg:border-t-0 lg:border-l">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-hub-muted">
          视频信息
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-hub-muted">平台</span>
            <span className="text-white">{video.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-hub-muted">ID</span>
            <span className="text-white">{video.externalId || video.id}</span>
          </div>
          {video.author && (
            <div className="flex justify-between">
              <span className="text-hub-muted">作者</span>
              <span className="text-white">{video.author.name}</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
