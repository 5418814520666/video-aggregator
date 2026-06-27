import type { Account } from '../../shared/types.js'
import type { PlatformProvider } from './types.js'
import { generateMockVideos } from './mock.js'

const STREAM_URL = process.env.CCTV_STREAM_URL || ''

class CctvProvider implements PlatformProvider {
  id = 'cctv' as const
  name = '央视网'
  color = '#D32F2F'
  icon = 'radio'

  isConfigured(): boolean {
    // 央视网无 OAuth 个人授权入口，若用户自行配置了合规直播源即视为可用。
    return true
  }

  getAuthUrl(): string {
    throw new Error('央视网暂不支持应用内账号授权')
  }

  async exchangeCode(): Promise<Account> {
    throw new Error('央视网暂不支持应用内账号授权')
  }

  async refreshToken(account: Account): Promise<Account> {
    return account
  }

  async listVideos() {
    const videos = this.getMockVideos()
    if (STREAM_URL) {
      videos.unshift({
        id: 'cctv-live',
        provider: 'cctv',
        externalId: 'live',
        title: '配置的直播源',
        cover: '',
        playUrl: STREAM_URL,
        publishedAt: new Date().toISOString(),
      })
    }
    return { videos }
  }

  async getVideo(videoId: string, _account?: Account) {
    void _account
    if (videoId === 'cctv-live') {
      return {
        id: 'cctv-live',
        provider: 'cctv' as const,
        externalId: 'live',
        title: '配置的直播源',
        cover: '',
        playUrl: STREAM_URL,
        publishedAt: new Date().toISOString(),
      }
    }
    const video = this.getMockVideos().find((v) => v.id === videoId)
    if (!video) throw new Error('视频不存在')
    return video
  }

  getMockVideos() {
    return generateMockVideos('cctv')
  }
}

export default new CctvProvider()
