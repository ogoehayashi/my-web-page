# Coco Lin · Portfolio

林小越（Coco）的英文求职作品集，纯静态，部署在 GitHub Pages：<https://ogoehayashi.github.io/my-web-page/>

**没有构建步骤，没有 npm，没有任何外部依赖。** 改完文件直接 push，网站就更新了。

---

## 设计原则：作品先说话

这一版的读者是新加坡的招聘方和面试官。招聘方大约 10 秒决定要不要往下看，所以：

- **首屏**：一句话定位，右边直接播放 PlanPilot 的真实操作录屏
- **数字条**：4 个都能在代码仓库里核实的数字
- **项目**：每个项目用 bento 拼贴来展示（录屏、截图、架构图、代码），文字 ≤ 35 个英文单词
- **详细内容**放在单独的项目详情页（`projects/`），给想深入看的工程师
- 教育和实习经历压缩成一条时间线；完整版放在简历 PDF 里

## 文件结构

```
index.html                 首页
projects/planpilot.html    PlanPilot 项目详情页
projects/cats.html         CATS 项目详情页
posts/first-post.html      博客文章
assets/style.css           全部样式（浅色为主，自动适配深色模式）
assets/main.js             录屏播放控制、导航高亮、页脚年份
assets/work/planpilot/     PlanPilot 的录屏 demo.mp4、封面图和截图（webp）
assets/work/cats/          CATS 的录屏、封面图和截图
```

所有录屏和截图都是**在本地真实运行这两个项目后录下来的**，不是设计稿。整个 `assets/work/` 大约 1.1 MB。

## 怎么改内容

需要替换的地方都在 HTML 里用 `<!-- ✏️ … -->` 标好了，搜索 `✏️` 就能全部找到。

| 位置 | 内容 |
| --- | --- |
| 首页 hero | 求职状态那一行 |
| 简历 PDF | 放到 `assets/Coco-Lin-Resume.pdf`，再删掉首页两处简历链接上的 `hidden` |
| LinkedIn | 联系区 LinkedIn 按钮换成真实地址，再删掉 `hidden` |
| 时间线 | 经历节点，每条 ≤ 10 个词 |
| Also 那一行 | ACCA 通过科目数等 |

邮箱用的是 `ogoehayashi@gmail.com`。**公开页面上的邮箱会被爬虫抓到**，手机号是有意没放的。

## 数字的出处

页面上的数字都可以核实，以后改动时请保持这个标准：

| 数字 | 出处 |
| --- | --- |
| 935 automated tests | PlanPilot `tests/unit` 的测试数（`pytest tests/unit`） |
| 13 hard constraints | PlanPilot 合约文件里的 HC-001…HC-013 |
| 403 | CATS 里员工访问 `/manager/**` 的真实响应（录屏里能看到） |
| 41 tests / 0 failures、21 个是她写的 | CATS `mvnw test`；`SecurityIntegrationTests` 15 个 + `ManagerFlowViewTests` 6 个 |
| 52 discrepancies | 审计实习经历（简历） |

## 录屏怎么重新录

录屏是用 Playwright 驱动本机的 Edge 自动操作两个项目、加上光标和字幕后录下来的，再用 ffmpeg 压成 H.264 MP4（每个约 300 KB）。如果项目界面有大改动需要重录：

1. 本地把 CATS（JDK 21，可以用 H2 内存库代替 MySQL）和 PlanPilot（Python 3.11，`PLANPILOT_FORBID_LLM_NETWORK=1`）跑起来
2. 用同样的流程操作一遍并录屏，导出成 `demo.mp4`（1280×800）和封面 `demo-poster.webp`
3. 覆盖 `assets/work/<项目>/` 里的同名文件即可，HTML 不用改

## 新增一个项目

首页：复制一整块 `<article class="project">`，换标题、文字和 bento 里的图。详情页：复制 `projects/cats.html` 改内容。

## 新增一篇文章

1. 复制 `posts/first-post.html`，改成新文件名
2. 替换标题、日期和正文
3. 在首页页脚的 `Notes:` 旁边加一个链接

---

## 本地预览

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000 。

## 部署

push 到 `main` 分支后等一两分钟，网站就会更新。

如果 Pages 还没开：仓库页面 → Settings → Pages → Source 选 `Deploy from a branch` → 分支选 `main`、目录选 `/ (root)` → Save。

## 实现说明

- **字体全部用系统字体**，没有引入 Google Fonts：国内访问 `fonts.googleapis.com` 会被墙。
- **录屏自己托管**，没有用 YouTube/Vimeo（国内打不开）。
- **录屏只在滚到屏幕里时播放**，离开就暂停；每个录屏右下角都有暂停按钮。系统开了「减弱动态效果」时不自动播放，只显示封面。
- **没有 JS 也能看**：录屏会显示封面图，其它内容都不依赖 JS。
