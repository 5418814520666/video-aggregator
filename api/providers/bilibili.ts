/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Account } from '../../shared/types.js'
import type { PlatformProvider } from './types.js'
import { generateMockVideos } from './mock.js'

const CLIENT_ID = process.env.BILIBILI_CLIENT_ID || ''
const CLIENT_SECRET = process.env.BILIBILI_CLIENT_SECRET || ''
const REDIRECT_URI =
  process.env.BILIBILI_REDIRECT_URI ||
  'http://localhost:3001/api/auth/bilibili/callback'

class BilibiliProvider implements PlatformProvider {
  id = 'bilibili' as const
  name = '哔哩哔哩'
  color = '#FB7299'
  icon = 'tv'

  isConfigured(): boolean {
    return Boolean(CLIENT_ID && CLIENT_SECRET)
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      gourl: REDIRECT_URI,
      state,
    })
    return `https://account.bilibili.com/pc/account-pc/auth/oauth?${params.toString()}`
  }

  async exchangeCode(code: string): Promise<Account> {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
    })

    const res = await fetch(
      'https://api.bilibili.com/x/account-oauth2/v1/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    )
    const json = (await res.json()) as any
    if (json.code !== 0 || !json.data?.access_token) {
      throw new Error(json.message || '哔哩哔哩授权失败')
    }

    const data = json.data
    return {
      provider: 'bilibili',
      openId: `bili_${data.access_token.slice(0, 16)}`,
      nickname: 'Bilibili 用户',
      avatar: '',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in || 7200),
    }
  }

  async refreshToken(account: Account): Promise<Account> {
    if (!account.refreshToken) return account
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: account.refreshToken,
    })
    const res = await fetch(
      'https://api.bilibili.com/x/account-oauth2/v1/refresh_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    )
    const json = (await res.json()) as any
    if (json.code !== 0 || !json.data?.access_token) {
      throw new Error(json.message || '刷新令牌失败')
    }
    const data = json.data
    return {
      ...account,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || account.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in || 7200),
    }
  }

  async listVideos(account: Account) {
    // 真实视频列表需要额外的 mid/space API 权限，这里先返回模拟数据。
    // 当接入真实接口后，可在此替换为官方 API 调用。
    void account
    return { videos: generateMockVideos('bilibili') }
  }

  async getVideo(videoId: string, _account?: Account) {
    void _account
    const video = generateMockVideos('bilibili').find((v) => v.id === videoId)
    if (!video) throw new Error('视频不存在')
    return video
  }

  getMockVideos() {
    return generateMockVideos('bilibili')
  }
}

export default new BilibiliProvider()
