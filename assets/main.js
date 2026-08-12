/* ══════════════════════════════════════════════════════════════
   林小越 Coco · 个人主页 — 交互脚本
   原生 JS，无依赖。全部效果在不支持时都会安全降级。
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─────────── 1. 文字逐字拆分 ───────────
     把 [data-split] 元素的文字拆成一个个 <span class="char">，
     配合 CSS 做逐字入场。用户直接改 HTML 里的纯文字即可，无需手工加标签。 */
  function splitText() {
    var targets = document.querySelectorAll("[data-split]");

    Array.prototype.forEach.call(targets, function (el) {
      var text = el.textContent.trim();
      var frag = document.createDocumentFragment();
      var chars = Array.from(text); // Array.from 能正确处理中文与 emoji
      var i;

      for (i = 0; i < chars.length; i++) {
        var span = document.createElement("span");
        span.className = chars[i] === " " ? "char space" : "char";
        span.textContent = chars[i] === " " ? " " : chars[i];
        span.style.setProperty("--d", (i * 0.045).toFixed(3) + "s");
        frag.appendChild(span);
      }

      el.textContent = "";
      el.appendChild(frag);
      el.setAttribute("aria-label", text); // 屏幕阅读器仍读到完整句子
    });

    // 首屏第二行（英文名）等第一行走完再开始，节奏更好看
    var heroLines = document.querySelectorAll(".hero-title [data-split]");
    if (heroLines.length > 1) {
      var offset = heroLines[0].querySelectorAll(".char").length * 0.045 + 0.18;
      Array.prototype.forEach.call(heroLines[1].querySelectorAll(".char"), function (c, i) {
        c.style.setProperty("--d", (offset + i * 0.04).toFixed(3) + "s");
      });
    }
  }

  /* ─────────── 1b. 渐变文字的逐字重算 ───────────
     坑：父元素的 background-clip:text 裁不住带 transform 的子元素（Chrome / Safari 都会失效），
     所以文字一旦被拆成单字，渐变就必须由每个字自己承接。
     这里逐字量出位置，把同一条渐变按偏移量切给每个字，视觉上依然是连续的一整条。 */
  function paintGradientText() {
    var lines = document.querySelectorAll(".gradient-text");

    Array.prototype.forEach.call(lines, function (line) {
      var chars = line.querySelectorAll(".char");
      if (!chars.length) return;

      // 先接管，再测量：即使测量失败，每个字也会退化成自带一份完整渐变（仍然可见）
      line.classList.add("is-split");

      // 用 offsetLeft / offsetTop 而不是 getBoundingClientRect：
      // 前者是布局位置，不受入场动画的 transform 干扰
      var minL = Infinity;
      var minT = Infinity;
      var maxR = -Infinity;
      var maxB = -Infinity;

      Array.prototype.forEach.call(chars, function (c) {
        minL = Math.min(minL, c.offsetLeft);
        minT = Math.min(minT, c.offsetTop);
        maxR = Math.max(maxR, c.offsetLeft + c.offsetWidth);
        maxB = Math.max(maxB, c.offsetTop + c.offsetHeight);
      });

      var w = maxR - minL;
      var h = maxB - minT;
      if (!(w > 0) || !(h > 0)) return;

      Array.prototype.forEach.call(chars, function (c) {
        c.style.setProperty("--gw", w + "px");
        c.style.setProperty("--gh", h + "px");
        c.style.setProperty("--gx", minL - c.offsetLeft + "px");
        c.style.setProperty("--gy", minT - c.offsetTop + "px");
      });
    });
  }

  /* ─────────── 2. 进入视口才播放 ───────────
     滚动淡入 + 标题逐字入场，都由这里统一触发。 */
  function observeReveals() {
    var items = document.querySelectorAll("[data-reveal], [data-split]");

    // 老浏览器不支持 IntersectionObserver：直接全部显示，不做动画
    if (!("IntersectionObserver" in window) || reduceMotion) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add("is-visible", "play");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible", "play");
          io.unobserve(entry.target); // 只播一次
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    Array.prototype.forEach.call(items, function (el, i) {
      // 同一区块内的兄弟元素依次错开，形成层叠感
      var siblings = el.parentElement ? el.parentElement.children : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      if (el.hasAttribute("data-reveal")) {
        el.style.transitionDelay = Math.min(idx, 6) * 0.07 + "s";
      }
      io.observe(el);
    });
  }

  /* ─────────── 2b. 兜底：绝不允许出现空白页 ───────────
     入场动画靠 IntersectionObserver 触发，而 IO 在页面被挂起、被遮挡或某些浏览器实现下
     可能一次都不回调——那样内容会永远停在 opacity:0，整页看起来是空的。
     所以：页面确实可见、但 2.5 秒后仍然一个元素都没显示出来，就放弃动画，直接全部显示。 */
  function revealFailsafe() {
    var armed = true;

    function check() {
      if (!armed || document.visibilityState !== "visible") return;
      armed = false;
      // 只要有任何一个元素显示出来了，就说明 IO 工作正常，不需要兜底
      if (document.querySelector("[data-reveal].is-visible, [data-split].play")) return;
      document.documentElement.classList.add("reveal-fallback");
    }

    setTimeout(check, 2500);

    // 在后台标签页打开时 IO 本来就不该触发，等真正切过来再开始计时
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") setTimeout(check, 2500);
    });
  }

  /* ─────────── 3. 鼠标跟随光斑 ───────────
     只在有精确指针的设备启用；用 lerp 缓动 + transform，不触发重排。 */
  function cursorGlow() {
    var glow = document.querySelector(".cursor-glow");
    if (!glow || reduceMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    var tx = window.innerWidth / 2;
    var ty = window.innerHeight / 2;
    var cx = tx;
    var cy = ty;
    var running = false;

    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      requestAnimationFrame(loop);
    }

    window.addEventListener(
      "pointermove",
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        if (!running) {
          running = true;
          glow.classList.add("on");
          loop();
        }
      },
      { passive: true }
    );
  }

  /* ─────────── 4. 卡片内的高光跟随 ───────────
     把鼠标在卡片内的相对位置写进 CSS 变量，由 CSS 画出高光。 */
  function spotlight() {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.addEventListener(
      "pointermove",
      function (e) {
        var card = e.target.closest ? e.target.closest("[data-spotlight]") : null;
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      },
      { passive: true }
    );
  }

  /* ─────────── 5. 导航：吸顶 / 高亮当前区块 / 移动端菜单 ─────────── */
  function navigation() {
    var nav = document.getElementById("nav");
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelectorAll(".nav-links a[data-nav]");
    if (!nav) return;

    // 移动端汉堡菜单
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      });

      // 点了链接就收起
      Array.prototype.forEach.call(nav.querySelectorAll(".nav-links a"), function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "打开菜单");
        });
      });
    }

    // 高亮当前所在区块
    if ("IntersectionObserver" in window && links.length) {
      var sections = [];
      Array.prototype.forEach.call(links, function (a) {
        var el = document.getElementById(a.getAttribute("data-nav"));
        if (el) sections.push(el);
      });

      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            Array.prototype.forEach.call(links, function (a) {
              a.classList.toggle("active", a.getAttribute("data-nav") === entry.target.id);
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );

      sections.forEach(function (s) {
        spy.observe(s);
      });
    }
  }

  /* ─────────── 6. 滚动进度条 + 导航吸顶 ───────────
     统一在一个 rAF 节流的 scroll 回调里做，避免多个监听器互相打架。 */
  function scrollEffects() {
    var bar = document.querySelector(".progress span");
    var nav = document.getElementById("nav");
    var ticking = false;

    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) {
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      }
      if (nav) {
        nav.classList.toggle("stuck", y > 40);
      }
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );

    update();
  }

  /* ─────────── 7. 实时时钟 ───────────
     ✏️ 想改时区，把下面的 "Asia/Shanghai" 换成你所在的时区即可。 */
  function clock() {
    var TZ = "Asia/Singapore";
    var full = document.getElementById("clock");
    var short = document.getElementById("clock-2");
    if (!full && !short) return;

    function fmt(opts) {
      try {
        return new Date().toLocaleTimeString("zh-CN", opts);
      } catch (err) {
        // 极老的浏览器不支持 timeZone 选项时的兜底
        return new Date().toLocaleTimeString();
      }
    }

    function tick() {
      if (full) {
        full.textContent = fmt({
          timeZone: TZ,
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }
      if (short) {
        short.textContent = fmt({
          timeZone: TZ,
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ─────────── 启动 ─────────── */
  function init() {
    splitText();
    paintGradientText();
    observeReveals();
    revealFailsafe();
    cursorGlow();
    spotlight();
    navigation();
    scrollEffects();
    clock();

    // 标题字号是按视口宽度伸缩的，窗口一变就得重新切一次渐变
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(paintGradientText, 160);
    });

    // 字体加载完成后布局可能微调，再补一次测量
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(paintGradientText).catch(function () {});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
