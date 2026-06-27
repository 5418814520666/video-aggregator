import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Account, ProviderId, Video } from '../shared/types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(path.join(dataDir, 'app.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    provider TEXT PRIMARY KEY,
    open_id TEXT,
    nickname TEXT,
    avatar TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recent_plays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    video_id TEXT NOT NULL,
    title TEXT,
    cover TEXT,
    played_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`)

export function saveAccount(account: Account): void {
  const stmt = db.prepare(`
    INSERT INTO accounts (provider, open_id, nickname, avatar, access_token, refresh_token, expires_at, updated_at)
    VALUES (@provider, @openId, @nickname, @avatar, @accessToken, @refreshToken, @expiresAt, datetime('now'))
    ON CONFLICT(provider) DO UPDATE SET
      open_id = @openId,
      nickname = @nickname,
      avatar = @avatar,
      access_token = @accessToken,
      refresh_token = @refreshToken,
      expires_at = @expiresAt,
      updated_at = datetime('now')
  `)
  stmt.run(account)
}

export function getAccount(provider: ProviderId): Account | undefined {
  const row = db
    .prepare('SELECT * FROM accounts WHERE provider = ?')
    .get(provider) as Record<string, unknown> | undefined
  if (!row) return undefined
  return {
    provider: row.provider as ProviderId,
    openId: String(row.open_id),
    nickname: String(row.nickname),
    avatar: String(row.avatar),
    accessToken: String(row.access_token),
    refreshToken: row.refresh_token ? String(row.refresh_token) : undefined,
    expiresAt: Number(row.expires_at),
  }
}

export function deleteAccount(provider: ProviderId): void {
  db.prepare('DELETE FROM accounts WHERE provider = ?').run(provider)
}

export function addRecentPlay(
  provider: ProviderId,
  videoId: string,
  title: string,
  cover: string,
): void {
  db.prepare(
    'INSERT INTO recent_plays (provider, video_id, title, cover) VALUES (?, ?, ?, ?)',
  ).run(provider, videoId, title, cover)
}

export function getRecentPlays(limit = 20): Video[] {
  const rows = db
    .prepare(
      'SELECT provider, video_id, title, cover, played_at FROM recent_plays ORDER BY played_at DESC LIMIT ?',
    )
    .all(limit) as Array<Record<string, unknown>>
  return rows.map((row) => ({
    id: `${row.provider}:${row.video_id}`,
    provider: row.provider as ProviderId,
    externalId: String(row.video_id),
    title: String(row.title || '未知视频'),
    cover: String(row.cover || ''),
    playUrl: '',
    publishedAt: String(row.played_at),
  }))
}

export default db
