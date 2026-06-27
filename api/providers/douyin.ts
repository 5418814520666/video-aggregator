/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Account, Video } from '../../shared/types.js'
import type { PlatformProvider } from './types.js'
import { generateMockVideos } from './mock.js'

const CLIENT_KEY = process.env.DOUYIN_CLIENT_KEY || ''
const CLIENT_SECRET = process.env.DOUYIN_CLIENT_SECRET || ''
const REDIRECT_URI =
  process.env.DOUYIN_REDIRECT_URI ||
  'http://localhost:3001/api/auth/douyin/callback'

class DouyinProvider implements PlatformProvider {
  id = 'douyin' as const
  name = '抖音'
  color = '#00F2FE'
  icon = 'music'

  isConfigured(): boolean {
    return Boolean(CLIENT_KEY && CLIENT_SECRET)
  }

  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_key: CLIENT_KEY,
      response_type: 'code',
      scope: 'user_info,video.list',
      redirect_uri: REDIRECT_URI,
      state,
    })
    return `https://open.douyin.com/platform/oauth/connect?${params.toString()}`
  }

  async exchangeCode(code: string): Promise<Account> {
    const body = new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    })
    const res = await fetch(
      'https://open.douyin.com/oauth/access_token/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    )
    const json = (await res.json()) as any
    const data = json.data
    if (!data?.access_token) {
      throw new Error(json.data?.description || '抖音授权失败')
    }

    const user = await this.fetchUserinfo(data.access_token)
    return {
      provider: 'douyin',
      openId: data.open_id,
      nickname: user.nickname || '抖音用户',
      avatar: user.avatar || '',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in || 7200),
    }
  }

  private async fetchUserinfo(token: string) {
    try {
      const res = await fetch(
        'https://open.douyin.com/oauth/userinfo/',
        {
          headers: { 'access-token': token },
        },
      )
      const json = (await res.json()) as any
      return {
        nickname: json.data?.nickname || '',
        avatar: json.data?.avatar || '',
      }
    } catch {
      return { nickname: '', avatar: '' }
    }
  }

  async refreshToken(account: Account): Promise<Account> {
    if (!account.refreshToken) return account
    const body = new URLSearchParams({
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
    })
    const res = await fetch(
      'https://open.douyin.com/oauth/refresh_token/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    )
    const json = (await res.json()) as any
    const data = json.data
    if (!data?.access_token) {
      throw new Error('抖音刷新令牌失败')
    }
    return {
      ...account,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || account.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in || 7200),
    }
  }

  async listVideos(account: Account) {
    try {
      const url = new URL('https://open.douyin.com/video/list/')
      url.searchParams.set('open_id', account.openId)
      url.searchParams.set('cursor', '0')
      url.searchParams.set('count', '20')
      const res = await fetch(url.toString(), {
        headers: { 'access-token': account.accessToken },
      })
      const json = (await res.json()) as any
      const list = json.data?.list || []
      if (!list.length) throw new Error('无视频')
      const videos: Video[] = list.map((item: any, idx: number) => ({
        id: `douyin-${item.item_id || idx}`,
        provider: 'douyin',
        externalId: item.item_id || `${idx}`,
        title: item.title || '抖音视频',
        cover: item.cover || '',
        playUrl: item.play_url || '',
        duration: item.duration,
        viewCount: item.statistics?.play_count,
        likeCount: item.statistics?.digg_count,
        commentCount: item.statistics?.comment_count,
        publishedAt: item.create_time
          ? new Date(item.create_time * 1000).toISOString()
          : undefined,
      }))
      return { videos }
    } catch {
      return { videos: generateMockVideos('douyin') }
    }
  }

  async getVideo(videoId: string, _account?: Account) {
    void _account
    const video = generateMockVideos('douyin').find((v) => v.id === videoId)
    if (!video) throw new Error('视频不存在')
    return video
  }

  getMockVideos() {
    return generateMockVideos('douyin')
  }
}

export default new DouyinProvider()
