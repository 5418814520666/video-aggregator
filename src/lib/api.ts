import type { ApiResponse, ProviderConfig, Video } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  const json = (await res.json()) as ApiResponse<T>
  if (!json.success && 'error' in json) {
    throw new Error(json.error || '请求失败')
  }
  return (json as { success: true; data: T }).data
}

export const api = {
  getProviders: () => request<ProviderConfig[]>('/api/providers'),

  getAuthUrl: (provider: string) =>
    request<{ url: string }>(`/api/auth/${provider}/url`),

  refreshToken: (provider: string) =>
    request<{ expiresAt: number }>(`/api/auth/${provider}/refresh`, {
      method: 'POST',
    }),

  unlinkAccount: (provider: string) =>
    request<unknown>(`/api/auth/${provider}`, { method: 'DELETE' }),

  getAccount: (provider: string) =>
    request<{ provider: string; nickname: string; avatar: string; expiresAt: number } | null>(
      `/api/account/${provider}`,
    ),

  getVideos: (provider: string, mock?: boolean) =>
    request<{ videos: Video[]; nextCursor?: string }>(
      `/api/videos/${provider}${mock ? '?mock=1' : ''}`,
    ),

  getVideo: (provider: string, videoId: string) =>
    request<Video>(`/api/videos/${provider}/${videoId}`),
}
