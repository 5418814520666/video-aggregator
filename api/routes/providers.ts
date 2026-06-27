import { Router, type Request, type Response } from 'express'
import { getAccount } from '../db.js'
import { providers } from '../providers/index.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const configs = Object.values(providers).map((p) => {
    const account = getAccount(p.id)
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      icon: p.icon,
      oauthAvailable: p.isConfigured(),
      mockAvailable: true,
      isLoggedIn: !!account,
      nickname: account?.nickname,
      expiresAt: account?.expiresAt,
    }
  })
  res.json({ success: true, data: configs })
})

export default router
