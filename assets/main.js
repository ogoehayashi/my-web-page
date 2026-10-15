/* ══════════════════════════════════════════════════════════════
   Coco Lin · Portfolio — 交互脚本
   没有 JS 时页面也完全可用（视频显示封面图）。
   1. 录屏：进入视口才播放、离开就暂停；系统开了「减弱动态效果」就不自动播放
   2. 导航高亮当前所在区块
   3. 页脚年份自动更新
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function videos() {
    var list = document.querySelectorAll("video[data-loop]");
    if (!list.length) return;

    Array.prototype.forEach.call(list, function (video) {
      var button = video.parentNode.querySelector(".vid-toggle");

      function setState(paused) {
        if (!button) return;
        button.setAttribute("data-state", paused ? "paused" : "playing");
        button.setAttribute("aria-label", paused ? "Play video" : "Pause video");
      }

      function play() {
        var p = video.play();
        // 浏览器拒绝自动播放时保持暂停状态，用户可以手动点播放
        if (p && p.catch) p.catch(function () { setState(true); });
        setState(false);
      }

      setState(true);
      if (button) {
        button.addEventListener("click", function () {
          if (video.paused) {
            video.removeAttribute("data-user-paused");
            play();
          } else {
            video.setAttribute("data-user-paused", "");
            video.pause();
            setState(true);
          }
        });
      }

      if (reduceMotion || !("IntersectionObserver" in window)) return;

      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (!video.hasAttribute("data-user-paused")) play();
            } else if (!video.paused) {
              video.pause();
              setState(true);
            }
          });
        },
        { threshold: 0.35 }
      ).observe(video);
    });
  }

  function highlightNav() {
    var links = document.querySelectorAll(".nav-links a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var byId = {};
    Array.prototype.forEach.call(links, function (a) {
      byId[a.getAttribute("href").slice(1)] = a;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          // 滚到导航里没有的区块时清空高亮，避免停在上一个
          Array.prototype.forEach.call(links, function (a) {
            a.removeAttribute("aria-current");
          });
          var link = byId[entry.target.id];
          if (link) link.setAttribute("aria-current", "true");
        });
      },
      // 区块进入视口中间那一条时才算「当前」
      { rootMargin: "-45% 0px -50% 0px" }
    );

    Array.prototype.forEach.call(document.querySelectorAll("main section[id]"), function (section) {
      observer.observe(section);
    });
  }

  function footerYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  videos();
  highlightNav();
  footerYear();
})();
