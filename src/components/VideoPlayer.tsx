import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import type { Video } from '@/types'

export default function VideoPlayer({ video }: { video: Video }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let hls: Hls | null = null
    const url = video.playUrl

    if (url.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(el)
      } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = url
      }
    } else {
      el.src = url
    }

    return () => {
      hls?.destroy()
    }
  }, [video.playUrl])

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-2xl">
      <video
        ref={ref}
        controls
        autoPlay
        className="aspect-video w-full"
        poster={video.cover || undefined}
      >
        您的浏览器不支持 HTML5 视频播放。
      </video>
    </div>
  )
}
