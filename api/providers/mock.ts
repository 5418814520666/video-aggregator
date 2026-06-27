import type { ProviderId, Video } from '../../shared/types.js'

const sampleMp4 =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const sampleHls =
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
const sampleCover =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'

const mockData: Record<
  ProviderId,
  { titles: string[]; isHls?: boolean }
> = {
  bilibili: {
    titles: [
      '【哔哩哔哩】热门动画剪辑',
      '【游戏实况】通关流程解说',
      '【科技评测】最新数码开箱',
      '【音乐】ACG 钢琴翻弹',
      '【学习】前端工程化入门',
    ],
  },
  douyin: {
    titles: [
      '抖音热门：今日最佳创意',
      '生活小技巧，一分钟学会',
      '街头美食探店',
      '萌宠日常',
      '旅行Vlog：海边日落',
    ],
  },
  kuaishou: {
    titles: [
      '快手老铁：农村日常生活',
      '手工制作全过程',
      '搞笑段子合集',
      '广场舞教学',
      '美食制作：家乡味道',
    ],
  },
  cctv: {
    titles: [
      '央视新闻联播',
      '焦点访谈精选',
      '纪录片：美丽中国',
      '体育赛事直播',
      '财经频道早报',
    ],
    isHls: true,
  },
}

export function generateMockVideos(provider: ProviderId): Video[] {
  const { titles, isHls } = mockData[provider]
  return titles.map((title, idx) => ({
    id: `${provider}-mock-${idx}`,
    provider,
    externalId: `mock-${idx}`,
    title,
    cover: sampleCover,
    playUrl: isHls ? sampleHls : sampleMp4,
    duration: 120 + idx * 30,
    viewCount: 10000 + idx * 5000,
    likeCount: 800 + idx * 200,
    commentCount: 120 + idx * 40,
    publishedAt: new Date(Date.now() - idx * 86400000).toISOString(),
    author: {
      id: `${provider}-author`,
      name: `${provider} 演示账号`,
      avatar: '',
    },
  }))
}
