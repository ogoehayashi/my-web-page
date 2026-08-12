# 林小越 Coco · 个人主页

一个纯静态的个人主页，部署在 GitHub Pages 上。

**没有构建步骤，没有 npm，没有任何外部依赖。** 改完文件直接 push，网站就更新了。

---

## 文件结构

```
index.html              首页（关于 / 近况 / 作品 / 足迹 / 笔记 / 联系）
posts/first-post.html   博客文章（英文）
assets/style.css        全部样式
assets/main.js          全部交互
```

---

## 怎么改内容

**所有需要你替换的地方，都在 HTML 里用 `<!-- ✏️ 改这里：… -->` 标好了。** 用任意编辑器搜索 `✏️` 就能找到全部。

正文内容已经按简历填成真实信息了：关于、三段实习经历（康华事务所审计 / 乐清税务局 / 富通保险）、学习轨迹、艺术展演与 SRTP 等经历、ACCA 进度。

还需要你确认或替换的：

| 位置 | 内容 |
| --- | --- |
| `index.html` 联系区 | 社交链接的 `href` 目前都是 `#`，换成真实主页；不用的整行删掉 |
| `index.html` 联系区 | 邮箱 `cocolinlxy4869@163.com` —— **公开页面会被爬虫抓到**，不想公开就把整个 `<a class="mail">` 删掉 |
| `index.html` 近况区 | 四张卡片是当下状态，过一阵就该更新 |
| `index.html` 关于区 | 自我介绍——换成自己的话会更像本人 |
| 头像 | 见下方「换头像」 |

**手机号没有放上去**，是有意的：个人主页是公开的，电话号码放上去等于公开给爬虫。需要的话再自己加。

### 换头像

把照片放进 `assets/`，然后在 `index.html` 里把这一整块：

```html
<div class="portrait-ph"> … </div>
```

换成：

```html
<img class="portrait" src="assets/photo.jpg" alt="林小越的照片" />
```

### 换配色

`assets/style.css` 最上面的 `:root` 里有三个主色，整站的光晕、强调色、渐变都由它们决定：

```css
--violet: #7b5cff;
--cyan:   #35e8d4;
--pink:   #ff5c9d;
```

改这三个值，整站气质就变了。

### 新增一篇文章

1. 复制 `posts/first-post.html`，改成新文件名（例如 `posts/my-second-post.html`）
2. 替换标题、日期和正文
3. 回到 `index.html` 的「写点东西」区块，照着现有那条 `<a class="note-item">` 再加一条，指向新文件

---

## 本地预览

不需要装任何东西，在项目目录下跑：

```bash
python3 -m http.server 8000
```

然后打开 http://localhost:8000 。

> 直接双击 `index.html` 用 `file://` 打开也能看，但部分浏览器会拦截相对路径，建议还是用上面的方式。

---

## 部署

仓库已经接好 GitHub Pages。push 到 `main` 分支后等一两分钟，网站就会更新。

如果 Pages 还没开：仓库页面 → Settings → Pages → Source 选 `Deploy from a branch` → 分支选 `main`、目录选 `/ (root)` → Save。

---

## 一些实现上的说明

写在这里是为了以后改动时不踩同样的坑：

- **字体全部用系统字体**，没有引入 Google Fonts。国内访问 `fonts.googleapis.com` 会被墙，页面会卡在等字体上。
- **首屏大标题的渐变是逐字切分的**（`main.js` 里的 `paintGradientText`）。因为父元素的 `background-clip: text` 裁不住带 `transform` 的子元素，而逐字入场动画正好要用 `transform`——直接写会导致标题完全不可见。
- **入场动画有兜底**：万一 `IntersectionObserver` 没触发，2.5 秒后会直接显示全部内容，不会出现空白页。
- **尊重系统的「减弱动态效果」设置**，开启后所有动画会自动关闭。
