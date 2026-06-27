import { test } from 'node:test'
import assert from 'node:assert'
import { providers } from '../providers/index.js'

test('平台 Provider 注册表包含四个平台', () => {
  assert.strictEqual(Object.keys(providers).length, 4)
  assert.ok(providers.bilibili)
  assert.ok(providers.douyin)
  assert.ok(providers.kuaishou)
  assert.ok(providers.cctv)
})

test('每个平台都能生成演示视频数据', () => {
  for (const provider of Object.values(providers)) {
    const videos = provider.getMockVideos()
    assert.ok(videos.length > 0, `${provider.name} 应返回演示视频`)
    assert.ok(videos[0].playUrl, `${provider.name} 演示视频应包含播放地址`)
  }
})

test('未配置密钥时 Bilibili / 抖音 / 快手不应视为已配置', () => {
  assert.strictEqual(providers.bilibili.isConfigured(), false)
  assert.strictEqual(providers.douyin.isConfigured(), false)
  assert.strictEqual(providers.kuaishou.isConfigured(), false)
})
