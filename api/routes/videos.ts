import { Router, type Request, type Response } from 'express'
import { addRecentPlay, getAccount } from '../db.js'
import { getProvider } from '../providers/index.js'

const router = Router()

router.get('/:provider', async (req: Request, res: Response) => {
  const { provider } = req.params
  const forceMock = req.query.mock === '1'
  const p = getProvider(provider)
  if (!p) {
    res.status(404).json({ success: false, error: '平台不存在' })
    return
  }

  try {
    const account = !forceMock ? getAccount(p.id) : undefined
    const result = account
      ? await p.listVideos(account)
      : { videos: p.getMockVideos() }
    res.json({ success: true, data: result })
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '获取视频列表失败',
    })
  }
})

router.get('/:provider/:videoId', async (req: Request, res: Response) => {
  const { provider, videoId } = req.params
  const p = getProvider(provider)
  if (!p) {
    res.status(404).json({ success: false, error: '平台不存在' })
    return
  }
  try {
    const video = await p.getVideo(videoId)
    addRecentPlay(video.provider, video.externalId || video.id, video.title, video.cover)
    res.json({ success: true, data: video })
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '获取视频失败',
    })
  }
})

export default router
