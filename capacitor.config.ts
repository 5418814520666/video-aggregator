import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.videohub.aggregator',
  appName: '视频聚合',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
