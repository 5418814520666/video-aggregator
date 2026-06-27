import { Router, type Request, type Response } from 'express'
import { getAccount } from '../db.js'
import { getProvider } from '../providers/index.js'

const router = Router()

router.get('/:provider', (req: Request, res: Response) => {
  const { provider } = req.params
  const p = getProvider(provider)
  if (!p) {
    res.status(404).json({ success: false, error: '平台不存在' })
    return
  }
  const account = getAccount(p.id)
  if (!account) {
    res.json({ success: true, data: null })
    return
  }
  res.json({
    success: true,
    data: {
      provider: account.provider,
      openId: account.openId,
      nickname: account.nickname,
      avatar: account.avatar,
      expiresAt: account.expiresAt,
    },
  })
})

export default router
