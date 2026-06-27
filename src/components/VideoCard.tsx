import { Play, Eye, Heart, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Video } from '@/types'

function formatNumber(n?: number) {
  if (n === undefined) return '-'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  return n.toString()
}

function formatDuration(seconds?: number) {
  if (seconds === undefined) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      to={`/watch/${video.provider}/${video.id}`}
      className="group block overflow-hidden rounded-xl border border-white/5 bg-hub-card transition-all duration-200 hover:-translate-y-1 hover:border-white/10 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {video.cover ? (
          <img
            src={video.cover}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-hub-card text-hub-muted">
            <Play size={32} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Play size={22} className="ml-1 text-white" />
          </div>
        </div>
        {video.duration !== undefined && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <div className="p-3">
        <h4 className="line-clamp-2 text-sm font-medium text-white">
          {video.title}
        </h4>
        <div className="mt-2 flex items-center gap-3 text-xs text-hub-muted">
          {video.viewCount !== undefined && (
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {formatNumber(video.viewCount)}
            </span>
          )}
          {video.likeCount !== undefined && (
            <span className="flex items-center gap-1">
              <Heart size={12} />
              {formatNumber(video.likeCount)}
            </span>
          )}
          {video.commentCount !== undefined && (
            <span className="flex items-center gap-1">
              <MessageCircle size={12} />
              {formatNumber(video.commentCount)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
