---
version: alpha
name: NextAI Essays
description: 东方极简散文集。米色纸感底、墨色衬线、单一陶土橙强调。像一本安静的书,不吵不闹。
colors:
  primary: "#d95c41"
  primary-soft: "#e07a5f"
  primary-deep: "#b8432f"
  bg: "#faf6ef"
  text: "#2b2620"
  muted: "#8a8178"
  line: "#e3dbcd"
  surface: "#fffdf8"
  white: "#ffffff"
typography:
  h1:
    fontFamily: Noto Serif SC, Songti SC, serif
    fontSize: 2.4rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.04em"
  title:
    fontFamily: Noto Serif SC, Songti SC, serif
    fontSize: 1.6rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.06em"
  body:
    fontFamily: Noto Serif SC, Songti SC, serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.01em"
  label:
    fontFamily: Noto Serif SC, Songti SC, serif
    fontSize: 0.85rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
  meta:
    fontFamily: Noto Serif SC, Songti SC, serif
    fontSize: 0.78rem
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: 8px
  md: 10px
  lg: 12px
  xl: 16px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  hero: 64px
components:
  nav-item:
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  nav-item-active:
    backgroundColor: "#f3e4dc"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  play-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    size: 32px
  play-button-hover:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    size: 32px
  share-button:
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 30px
  share-button-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    size: 30px
  tab-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: 4px 14px
  tab-button-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: 4px 14px
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  input-focus:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  comment-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  submit-button:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: 8px 24px
  submit-button-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: 8px 24px
---

## Overview

一个散文集网站:四篇散文、关于页、音乐曲库、留言板。设计目标是"像一本书"——米色纸感背景、墨色衬线正文、细线分隔,全站只有陶土橙一个强调色。音乐组件(网易云风播放器)和留言板(独立页)都收敛在同一套语言里:衬线、细线、低对比、单点橙。

## Colors

- **Primary (#d95c41):** 陶土橙,唯一的强调色。用于:导航高亮、播放按钮、链接、进度条。全站只此一色,绝不再加第二彩色。
- **Primary-soft (#e07a5f):** 深色背景上的陶土橙变体,以及封面光晕。
- **Primary-deep (#b8432f):** 深陶土橙。带白字文字的按钮(提交)用它,保证 WCAG AA 对比度(4.5:1)。纯图标按钮可继续用 primary(图形 3:1 达标)。
- **BG (#faf6ef):** 米色纸感底,整站的画布。不是纯白,是旧纸的颜色。
- **Text (#2b2620):** 墨色,正文与标题。不用纯黑,墨比黑温和。
- **Muted (#8a8178):** 次级信息:日期、歌手、专辑、提示语。
- **Line (#e3dbcd):** 细线色。分隔线、边框、进度条轨道。所有线都是这个颜色,不加深。
- **Surface (#fffdf8):** 卡片/留言条目底色,比画布略亮一档。
- **White (#ffffff):** 只用在彩色按钮上的文字。

## Typography

全站衬线(Noto Serif SC / Songti SC),没有无衬线。散文站的每个字都应该像印在纸上。

- **h1(2.4rem):** 文章大标题,墨色,600。标题里的强调词(如"来了")用陶土橙。
- **title(1.6rem):** 页面标题(写字的时光、想说的话)。
- **body(1rem/1.8):** 正文,行高 1.8 给足呼吸感。散文段落不缩进,段间距代缩进。
- **label(0.85rem):** kicker/标签("雨 · 停 · 看")。
- **meta(0.78rem):** 日期、时间、专辑名等小字。

## Layout & Spacing

- 内容列宽 640px,居中,像书的版面。
- 大留白:标题与正文之间 64px,文章之间 64px。
- 细线分隔:上边框 1px solid line,比卡片背景更能保持"书"的气质。
- 移动端:左上角目录按钮 + 抽屉,正文列宽不变。
- 播放组件限宽 430px,不抢正文。

## Elevation & Depth

几乎不用阴影。仅两处:
- 分享卡片:0 12px 40px rgba(0,0,0,0.3)(模态背景上的浮起)。
- 封面图 hover:陶土橙光晕(0 4px 16px color-mix(primary 40%))。用色光不用灰影。

## Shapes

- 圆角克制:输入 8px、卡片 10px、封面 12px、播放器 16px、按钮 999px(胶囊)。
- 封面 58px 小方块(播放组件)/96px 大方块(锁屏风组件)。
- 分隔不用卡片,用 1px 细线。

## Components

- **播放组件(.essay-player):** 细线上下框 + 小封面 + 歌名/歌手同行 + 2px 进度条 + 上/下一首(15px 线性图标) + 32px 橙色圆钮。播放中封面泛橙色光晕,歌名变橙。
- **曲库 tab(.mtab):** 胶囊按钮,active 为橙色实底白字,否则描边灰字。
- **排行/搜索列表(.rank-item):** 细线分隔行,排名(前三橙色)+ 封面 42px + 歌名/歌手 + 播放图标。hover 行底色微橙。
- **留言板:** 独立页(comments.html),与散文站同底色同字体。留言条目 = 浅色卡片 + 细线 + 文章标签(橙色胶囊)。
- **分享卡片:** 900x1350 竖版 canvas:米色底 + 陶土橙细线 + 站点名 + 篇名(56px) + 摘要(30px 灰) + 金句(31px 橙) + 分隔线 + URL/落款 + 二维码。

## Do's and Don'ts

- Do: 只有一个强调色。陶土橙出现的地方,其他一切颜色退让。
- Do: 用细线分隔内容,不用重卡片和大阴影。
- Do: 图标一律线性描边(lucide 风格,stroke-width 1.8-2),不用实心彩色图标。
- Do: 大留白。散文站不怕空,怕挤。
- Do: 中文排版用衬线;英文小标签(ESSAYS)用大写窄字距。
- Don't: 不要加第二个彩色(绿、蓝、紫都禁止)。
- Don't: 不要用无衬线做正文。
- Don't: 不要用 emoji 做 UI 图标(分享、播放、搜索都用 SVG)。
- Don't: 不要贴背景图/纹理,纸感靠纯色 + 留白。
- Don't: 正文不画重点、不加粗强调,让文字自己说话。
