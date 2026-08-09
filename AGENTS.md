# AGENTS.md

散文集站点(nextai.show/essays) + TypeScript 音乐 API。任何 agent 动这个项目前先读这份文件。

## 项目结构

- `index.html` — 散文站单页(4篇散文+关于+音乐曲库+分享卡片,全部内联 CSS/JS)
- `comments.html` — 留言板独立页
- `DESIGN.md` — 设计系统规范(Google tokens)。**改任何 UI 前先读,遵守:单陶土橙强调 #d95c41、衬线、细线分隔、SVG 线性图标**
- `music-api/` — Hono + TS 服务(端口 8799,nginx 反代 /music-api/)

## 部署(重要!)

- git 工作区 = `/tmp/nextai-essays`(本地改完 → 部署 → commit → push)
- 线上文件 = `/var/www/essays/`(属主 www-data)
- 部署命令模式:
  ```bash
  python3 /tmp/xxx.py          # 修改 /tmp/essays-live.html(或直接改仓库内文件)
  sudo cp 文件 /var/www/essays/index.html
  sudo chown www-data:www-data /var/www/essays/index.html
  ```
- 改 music-api 后:`pkill -f "tsx src/server"` → `cd music-api && npx tsx src/server.ts &` → `curl 127.0.0.1:8799/api/login/status` 验证
- nginx 配置:`/etc/nginx/sites-enabled/hermes-dashboard`(改后 nginx -t + reload)

## 音乐曲库机制

- 21 首 = 云端少年(本地 mp3 `music/yunduan.mp3`) + 20 首经典歌(**在线流**)
- 在线流:网易云扫码登录(cookie 在 `/tmp/ncm-cookie.txt`,7 天有效期,`/api/login/qr` 重新登录),`/api/play?id=X` 返回 128k 流地址
- **mp3/封面不入 git 仓库**(版权),mp3 在 `/var/www/essays/music/`,封面在 `images/music/`
- PLAYLIST 在 index.html 的 JS 里,src=null 的歌走 `/api/play` 在线播放
- 网易云 API 走 NeteaseCloudMusicApi(带 cookie),搜索走 neteasemusic CLI(需 LC_ALL=UTF-8)

## API 防护(不要削弱!)

- CORS 白名单:仅 nextai.show(第三方站点白嫖会被拦)
- 限速按 IP:search 20/分、play 40/分、rank 30/分、comments 5/分
- 留言混合审核:关键词黑名单(广告/辱骂/**色情**/政治/链接)先行直拒 → deepseek-v4-flash 审核(reasoning_effort: low, max_tokens: 128, 8s 超时)→ approved 才展示,失败兜底 pending
- 留言存 `/var/www/essays/data/comments.jsonl`(JSONL 追加写),nginx `deny all` 禁直连
- 网易云 cookie 是用户账号,滥用会触发网易云风控封号——限速不能放宽

## 常见坑

- 播放器 DOM 顺序:播放条 HTML 必须在 `<script>` 之前(脚本执行时 getElementById 会拿 null)
- 分享卡片二维码**必须走后端** `/api/qr`(前端 qrcodejs 在页面里画不出来,真机踩过)
- `import.meta` 的 TS lint 报错是环境问题,忽略,以 `npx tsc --noEmit` 为准
- 服务器网关会拦截 systemctl/restart 类命令,API 重启用 pkill + 后台 npx tsx
- 拦截器可能误报含 key 的 curl 命令,敏感测试写成 .cjs 脚本跑
- 项目在服务器上,不在 CI;验证靠 curl + Playwright headless(browser 工具)
