/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Account, Video } from '../../shared/types.js'
import type { PlatformProvider } from './types.js'
import { generateMockVideos } from './mock.js'

const APP_ID = process.env.KUAISHOU_APP_ID || ''
const APP_SECRET = process.env.KUAISHOU_APP_SECRET || ''
const REDIRECT_URI =
  process.env.KUAISHOU_REDIRECT_URI ||
  'http://localhost:3001/api/auth/kuaishou/callback'

class KuaishouProvider implements PlatformProvider {
  id = 'kuaishou' as const
  name = '快手'
  color = '#FF6600'
  icon = 'video'

  isConfigured(): boolean {
    return Boolean(APP_ID && APP_SECRET)
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      app_id: APP_ID,
      response_type: 'code',
      scope: 'user_info,user_video_info',
      redirect_uri: REDIRECT_URI,
      state,
    })
    return `https://open.kuaishou.com/oauth2/authorize?${params.toString()}`
  }

  async exchangeCode(code: string): Promise<Account> {
    const body = new URLSearchParams({
      app_id: APP_ID,
      app_secret: APP_SECRET,
      code,
      grant_type: 'authorization_code',
    })
    const res = await fetch('https://open.kuaishou.com/oauth2/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const json = (await res.json()) as any
    if (json.result !== 1 || !json.access_token) {
      throw new Error(json.error_msg || '快手授权失败')
    }

    const user = await this.fetchUserinfo(json.access_token)
    return {
      provider: 'kuaishou',
      openId: json.open_id || `ks_${json.access_token.slice(0, 16)}`,
      nickname: user.nickname || '快手用户',
      avatar: user.avatar || '',
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + (json.expires_in || 7200),
    }
  }

  private async fetchUserinfo(token: string) {
    try {
      const url = new URL('https://open.kuaishou.com/openapi/user_info')
      url.searchParams.set('access_token', token)
      url.searchParams.set('app_id', APP_ID)
      const res = await fetch(url.toString())
      const json = (await res.json()) as any
      return {
        nickname: json.user_name || '',
        avatar: json.user_headurl || '',
      }
    } catch {
      return { nickname: '', avatar: '' }
    }
  }

  async refreshToken(account: Account): Promise<Account> {
    if (!account.refreshToken) return account
    const body = new URLSearchParams({
      app_id: APP_ID,
      app_secret: APP_SECRET,
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
    })
    const res = await fetch('https://open.kuaishou.com/oauth2/refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const json = (await res.json()) as any
    if (json.result !== 1 || !json.access_token) {
      throw new Error('快手刷新令牌失败')
    }
    return {
      ...account,
      accessToken: json.access_token,
      refreshToken: json.refresh_token || account.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (json.expires_in || 7200),
    }
  }

  async listVideos(account: Account) {
    try {
      const url = new URL('https://open.kuaishou.com/openapi/photo/list')
      url.searchParams.set('access_token', account.accessToken)
      url.searchParams.set('app_id', APP_ID)
      url.searchParams.set('count', '20')
      const res = await fetch(url.toString())
      const json = (await res.json()) as any
      const list = json.video_list || []
      if (!list.length) throw new Error('无视频')
      const videos: Video[] = list.map((item: any, idx: number) => ({
        id: `kuaishou-${item.photo_id || idx}`,
        provider: 'kuaishou',
        externalId: item.photo_id || `${idx}`,
        title: item.caption || '快手视频',
        cover: item.cover || '',
        playUrl: item.play_url || '',
        duration: undefined,
        viewCount: item.view_count,
        likeCount: item.like_count,
        commentCount: item.comment_count,
        publishedAt: item.create_time
          ? new Date(item.create_time).toISOString()
          : undefined,
      }))
      return { videos }
    } catch {
      return { videos: generateMockVideos('kuaishou') }
    }
  }

  async getVideo(videoId: string, _account?: Account) {
    void _account
    const video = generateMockVideos('kuaishou').find((v) => v.id === videoId)
    if (!video) throw new Error('视频不存在')
    return video
  }

  getMockVideos() {
    return generateMockVideos('kuaishou')
  }
}

export default new KuaishouProvider()
