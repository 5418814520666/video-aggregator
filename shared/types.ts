export type ProviderId = 'bilibili' | 'douyin' | 'kuaishou' | 'cctv'

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type Account = {
  provider: ProviderId
  openId: string
  nickname: string
  avatar: string
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

export type Video = {
  id: string
  provider: ProviderId
  title: string
  cover: string
  playUrl: string
  duration?: number
  viewCount?: number
  likeCount?: number
  commentCount?: number
  publishedAt?: string
  externalId?: string
  author?: {
    id: string
    name: string
    avatar: string
  }
}

export type ProviderConfig = {
  id: ProviderId
  name: string
  color: string
  icon: string
  oauthAvailable: boolean
  mockAvailable: boolean
  isLoggedIn: boolean
}
