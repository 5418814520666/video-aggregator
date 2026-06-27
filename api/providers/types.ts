import type { Account, ProviderId, Video } from '../../shared/types.js'

export interface PlatformProvider {
  id: ProviderId
  name: string
  color: string
  icon: string
  isConfigured(): boolean
  getAuthUrl(state: string): string
  exchangeCode(code: string): Promise<Account>
  refreshToken(account: Account): Promise<Account>
  listVideos(
    account: Account,
    cursor?: string,
  ): Promise<{ videos: Video[]; nextCursor?: string }>
  getVideo(videoId: string, account?: Account): Promise<Video>
  getMockVideos(): Video[]
}
