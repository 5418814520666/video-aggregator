/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto'
import { Router, type Request, type Response } from 'express'
import { deleteAccount, getAccount, saveAccount } from '../db.js'
import { getProvider } from '../providers/index.js'

const router = Router()
const stateStore = new Map<string, { provider: string; createdAt: number }>()

function cleanOldStates() {
  const now = Date.now()
  for (const [key, value] of stateStore.entries()) {
    if (now - value.createdAt > 10 * 60 * 1000) {
      stateStore.delete(key)
    }
  }
}

function sendResult(res: Response, status: 'success' | 'error', message: string) {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>授权结果</title></head>
      <body>
        <script>
          window.opener?.postMessage({ type: 'oauth-callback', status: '${status}', message: '${message}' }, '*');
          setTimeout(() => window.close(), 1500);
        </script>
        <p>${message}</p>
      </body>
    </html>
  `)
}

router.get('/:provider/url', (req: Request, res: Response) => {
  const { provider } = req.params
  const p = getProvider(provider)
  if (!p) {
    res.status(404).json({ success: false, error: '平台不存在' })
    return
  }
  if (!p.isConfigured()) {
    res.status(400).json({ success: false, error: '平台未配置密钥，无法发起授权' })
    return
  }
  cleanOldStates()
  const state = crypto.randomUUID()
  stateStore.set(state, { provider, createdAt: Date.now() })
  const url = p.getAuthUrl(state)
  res.json({ success: true, data: { url } })
})

router.get('/:provider/callback', async (req: Request, res: Response) => {
  const { provider } = req.params
  const { code, state } = req.query as { code?: string; state?: string }
  const p = getProvider(provider)
  if (!p || !code) {
    sendResult(res, 'error', '授权参数缺失')
    return
  }
  const stored = stateStore.get(state || '')
  if (!state || stored?.provider !== provider) {
    sendResult(res, 'error', '授权 state 校验失败')
    return
  }
  stateStore.delete(state)

  try {
    const account = await p.exchangeCode(code)
    saveAccount(account)
    sendResult(res, 'success', '授权成功，窗口即将关闭')
  } catch (err: any) {
    sendResult(res, 'error', err.message || '授权失败')
  }
})

router.post('/:provider/refresh', async (req: Request, res: Response) => {
  const { provider } = req.params
  const p = getProvider(provider)
  if (!p) {
    res.status(404).json({ success: false, error: '平台不存在' })
    return
  }
  const account = getAccount(p.id)
  if (!account) {
    res.status(400).json({ success: false, error: '未绑定账号' })
    return
  }
  try {
    const updated = await p.refreshToken(account)
    saveAccount(updated)
    res.json({ success: true, data: { expiresAt: updated.expiresAt } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || '刷新失败' })
  }
})

router.delete('/:provider', (req: Request, res: Response) => {
  const { provider } = req.params
  const p = getProvider(provider)
  if (!p) {
    res.status(404).json({ success: false, error: '平台不存在' })
    return
  }
  deleteAccount(p.id)
  res.json({ success: true })
})

export default router
