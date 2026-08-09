/**
 * nextai-essays 音乐 API
 * 网易云搜索/排行中转服务(Hono + TS)
 * - GET /api/search?q=关键词        → 网易云歌曲搜索(经 neteasemusic CLI)
 * - GET /api/rank?type=hot|new|soar → 网易云官方榜(热歌/新歌/飙升)
 * - GET /api/playlist?id=榜单id     → 榜单/歌单歌曲列表
 * 页面直连网易云会 CORS 失败,全部经此中转。
 */
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const NCM = require('NeteaseCloudMusicApi');

const exec = promisify(execFile);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const NETEASE = 'https://music.163.com';

// 官方榜 id(网易云固定):云音乐飙升榜=19723756,新歌榜=3779629,热歌榜=3778678
const RANKS: Record<string, { id: string; name: string }> = {
  soar: { id: '19723756', name: '飙升榜' },
  new: { id: '3779629', name: '新歌榜' },
  hot: { id: '3778678', name: '热歌榜' },
};

async function neteaseJson(path: string): Promise<any> {
  const res = await fetch(NETEASE + path, {
    headers: { 'User-Agent': UA, Referer: NETEASE },
  });
  if (!res.ok) throw new Error(`netease ${res.status}`);
  return res.json();
}

const app = new Hono();

// CORS:仅允许散文站域名(防第三方网站白嫖 API)
const ALLOW_ORIGIN = ['https://nextai.show', 'http://nextai.show', 'http://localhost', 'http://127.0.0.1'];
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin') || '';
  const referer = c.req.header('Referer') || '';
  const ok =
    !origin || // 同源/无 Origin(如 curl)放行,靠 Referer 兜底
    ALLOW_ORIGIN.some((o) => origin.startsWith(o)) ||
    ALLOW_ORIGIN.some((o) => referer.startsWith(o));
  await next();
  if (ok) {
    const allowOrigin = origin && ALLOW_ORIGIN.some((o) => origin.startsWith(o))
      ? origin
      : 'https://nextai.show';
    c.header('Access-Control-Allow-Origin', allowOrigin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
  } else {
    c.header('Access-Control-Allow-Origin', 'null');
  }
});

// 限速:按 IP + 接口分类(防滥用/防网易云风控)
const rateLimits: Record<string, { max: number; win: number }> = {
  search: { max: 20, win: 60_000 },
  play: { max: 40, win: 60_000 },
  rank: { max: 30, win: 60_000 },
  comments: { max: 5, win: 60_000 },
};
const hits = new Map<string, number[]>();
function rateLimit(key: string, cat: string): boolean {
  const cfg = rateLimits[cat];
  if (!cfg) return true;
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < cfg.win);
  if (arr.length >= cfg.max) return false;
  arr.push(now);
  hits.set(key, arr);
  return true;
}
function clientIp(c: any): string {
  return c.req.header('x-real-ip') || c.req.header('x-forwarded-for')?.split(',')[0] || 'unknown';
}

// 搜索:调 neteasemusic CLI(稳定免登录)
app.get('/api/search', async (c) => {
  const q = c.req.query('q')?.trim();
  if (!q) return c.json({ error: 'missing q' }, 400);
  if (!rateLimit(clientIp(c) + ':search', 'search')) return c.json({ error: '太频繁了,慢一点' }, 429);
  try {
    const { stdout } = await exec('neteasemusic', ['song', q, '-o', 'json'], {
      timeout: 20000,
      env: { ...process.env, LC_ALL: 'en_US.UTF-8', LANG: 'en_US.UTF-8' },
      encoding: 'utf-8',
    });
    const songs = JSON.parse(stdout);
    return c.json({ query: q, songs });
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

// 排行:官方榜(飙升/新歌/热歌)
app.get('/api/rank', async (c) => {
  const type = c.req.query('type') || 'hot';
  const rank = RANKS[type];
  if (!rank) return c.json({ error: 'unknown rank type' }, 400);
  if (!rateLimit(clientIp(c) + ':rank', 'rank')) return c.json({ error: '太频繁了,慢一点' }, 429);
  try {
    const limit = Math.min(Number(c.req.query('limit')) || 10, 50);
    const data = await NCM.playlist_track_all({ id: rank.id, limit, offset: 0 });
    const tracks = (data.body?.songs || data.body?.playlist?.tracks || []).map((t: any, i: number) => ({
      rank: i + 1,
      id: t.id,
      title: t.name,
      artist: (t.ar || []).map((a: any) => a.name).join(', '),
      album: t.al?.name || '',
      cover: t.al?.picUrl || '',
      duration: t.dt ? Math.round(t.dt / 1000) : 0,
    }));
    return c.json({ type, name: rank.name, tracks });
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

// 歌单/榜单详情(id 直达)
app.get('/api/playlist', async (c) => {
  const id = c.req.query('id');
  if (!id) return c.json({ error: 'missing id' }, 400);
  try {
    const data = await neteaseJson(`/api/v6/playlist/detail?id=${id}`);
    const pl = data?.playlist || {};
    const tracks = (pl.tracks || []).map((t: any, i: number) => ({
      rank: i + 1,
      id: t.id,
      title: t.name,
      artist: (t.ar || []).map((a: any) => a.name).join(', '),
      album: t.al?.name || '',
      cover: t.al?.picUrl || '',
      duration: t.dt ? Math.round(t.dt / 1000) : 0,
    }));
    return c.json({ id, name: pl.name || '', cover: pl.coverImgUrl || '', tracks });
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

// 推荐歌单(网易云编辑精选)
app.get('/api/recommend', async (c) => {
  try {
    const data = await neteaseJson('/api/personalized/playlist?limit=8');
    const lists = (data?.result || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      cover: l.picUrl || l.coverImgUrl || '',
      count: l.playCount || 0,
    }));
    return c.json({ lists });
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

// ===== 扫码登录(拿 cookie 后可播任意歌) =====
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const COOKIE_FILE = '/tmp/ncm-cookie.txt';
let musicCookie: string | null = existsSync(COOKIE_FILE) ? readFileSync(COOKIE_FILE, 'utf8') : null;
let cookieExpire = musicCookie ? Date.now() + 7 * 24 * 3600 * 1000 : 0;

app.get('/api/login/qr', async (c) => {
  try {
    const keyRes = await NCM.login_qr_key({});
    const key = keyRes.body?.data?.unikey;
    const qrRes = await NCM.login_qr_create({ key, qrimg: true });
    return c.json({ key, qrimg: qrRes.body?.data?.qrimg || '' });
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

app.get('/api/login/check', async (c) => {
  const key = c.req.query('key');
  if (!key) return c.json({ error: 'missing key' }, 400);
  try {
    const r = await NCM.login_qr_check({ key });
    const code = r.body?.code ?? -1;
    if (code === 803) {
      const cookieStr = Array.isArray(r.body.cookie) ? r.body.cookie.join(';') : r.body.cookie;
      musicCookie = cookieStr;
      cookieExpire = Date.now() + 7 * 24 * 3600 * 1000; // 7 天
      try { writeFileSync(COOKIE_FILE, cookieStr); } catch (e) { console.error('cookie 保存失败', e); }
    }
    return c.json({ code, message: r.body?.message || '' });
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

app.get('/api/login/status', async (c) => {
  return c.json({ logged: !!musicCookie && Date.now() < cookieExpire });
});

// 播放地址(带登录 cookie)
app.get('/api/play', async (c) => {
  const id = c.req.query('id');
  if (!id) return c.json({ error: 'missing id' }, 400);
  if (!rateLimit(clientIp(c) + ':play', 'play')) return c.json({ error: '太频繁了,慢一点' }, 429);
  try {
    const r = await NCM.song_url_v1({ id: Number(id), level: 'standard', cookie: musicCookie || '' });
    const data = r.body?.data?.[0];
    return c.json({ url: data?.url || null, code: data?.code, br: data?.br });
  } catch (e: any) {
    return c.json({ error: String(e?.message || e) }, 500);
  }
});

// ===== 留言板(散文站) =====
import { mkdirSync } from 'node:fs';

const COMMENTS_FILE = '/var/www/essays/data/comments.json';
const postLimits = new Map<string, number>(); // ip -> lastTs

function loadComments(): any[] {
  try {
    if (!existsSync(COMMENTS_FILE)) return [];
    return JSON.parse(readFileSync(COMMENTS_FILE, 'utf8'));
  } catch { return []; }
}

function saveComments(list: any[]) {
  mkdirSync('/var/www/essays/data', { recursive: true });
  writeFileSync(COMMENTS_FILE, JSON.stringify(list, null, 1));
}

app.get('/api/comments', (c) => {
  const essay = c.req.query('essay') || '';
  const list = loadComments().filter((x) => !essay || x.essay === essay);
  return c.json({ comments: list.slice(-50).reverse() });
});

app.post('/api/comments', async (c) => {
  const ip = clientIp(c);
  const now = Date.now();
  if (!rateLimit(ip + ':comments', 'comments')) return c.json({ error: '太快了,慢一点' }, 429);
  if (postLimits.has(ip) && now - (postLimits.get(ip) || 0) < 30000) {
    return c.json({ error: '太快了，30 秒后再试' }, 429);
  }
  let body: any = {};
  try { body = await c.req.json(); } catch {}
  const essay = String(body.essay || '').slice(0, 16);
  const name = String(body.name || '匿名').slice(0, 20);
  const content = String(body.content || '').slice(0, 300);
  if (!essay || !content.trim()) return c.json({ error: '内容不能为空' }, 400);
  const list = loadComments();
  list.push({ essay, name: name.trim() || '匿名', content: content.trim(), time: now });
  saveComments(list);
  postLimits.set(ip, now);
  return c.json({ ok: true });
});

const PORT = Number(process.env.PORT || 8799);
serve({ fetch: app.fetch, port: PORT }, (info: { port: number }) => {
  console.log(`music-api on http://127.0.0.1:${info.port}`);
});
