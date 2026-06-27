import type { ProviderId } from '../../shared/types.js'
import bilibili from './bilibili.js'
import cctv from './cctv.js'
import douyin from './douyin.js'
import kuaishou from './kuaishou.js'
import type { PlatformProvider } from './types.js'

export const providers: Record<ProviderId, PlatformProvider> = {
  bilibili,
  douyin,
  kuaishou,
  cctv,
}

export function getProvider(id: string): PlatformProvider | undefined {
  return providers[id as ProviderId]
}

export function listProviderIds(): ProviderId[] {
  return Object.keys(providers) as ProviderId[]
}
