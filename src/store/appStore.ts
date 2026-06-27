import { create } from 'zustand'
import type { ProviderConfig, Video } from '@/types'

type AppState = {
  providers: ProviderConfig[]
  recentPlays: Video[]
  mockMode: boolean
  setProviders: (providers: ProviderConfig[]) => void
  updateProvider: (provider: ProviderConfig) => void
  setRecentPlays: (videos: Video[]) => void
  addRecentPlay: (video: Video) => void
  setMockMode: (value: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  providers: [],
  recentPlays: [],
  mockMode: true,
  setProviders: (providers) => set({ providers }),
  updateProvider: (provider) =>
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === provider.id ? { ...p, ...provider } : p,
      ),
    })),
  setRecentPlays: (recentPlays) => set({ recentPlays }),
  addRecentPlay: (video) =>
    set((state) => ({
      recentPlays: [
        video,
        ...state.recentPlays.filter((v) => v.id !== video.id),
      ].slice(0, 20),
    })),
  setMockMode: (mockMode) => set({ mockMode }),
}))
