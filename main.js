/* Corcoran Construction: menu, hero slideshow, scroll reveals, email links and photo viewer */
(function () {
  'use strict';
  window.ccReady = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Current year in the footer
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Nav turns solid once the page scrolls
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav && !nav.classList.contains('solid')) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    var setOpen = function (open) {
      links.classList.toggle('open', open);
      if (nav) nav.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      var use = burger.querySelector('use');
      if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
    };
    burger.addEventListener('click', function () { setOpen(!links.classList.contains('open')); });
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) { setOpen(false); burger.focus(); }
    });
  }

  // Hero slideshow: crossfade about every five and a half seconds, with pause and play
  var slides = document.querySelectorAll('.hero-slide');
  var dots = document.querySelectorAll('.slide-dots span');
  var ctrl = document.getElementById('slideCtrl');
  var pauseBtn = document.getElementById('slidePause');
  var cur = 0, timer = null, userPaused = false, DELAY = 5500;
  function show(i) {
    slides[cur].classList.remove('active');
    if (dots[cur]) dots[cur].classList.remove('on');
    cur = i;
    void slides[cur].offsetWidth;
    slides[cur].classList.add('active');
    if (dots[cur]) dots[cur].classList.add('on');
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function start() { stop(); timer = setInterval(function () { show((cur + 1) % slides.length); }, DELAY); }
  function setPaused(p) {
    userPaused = p;
    if (p) { stop(); } else { show((cur + 1) % slides.length); start(); }
    if (ctrl) ctrl.classList.toggle('paused', p);
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
      var u = pauseBtn.querySelector('use');
      if (u) u.setAttribute('href', p ? '#i-play' : '#i-pause');
    }
  }
  if (slides.length > 1 && !reduce) {
    start();
    if (pauseBtn) pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (!userPaused) start();
    });
  } else if (ctrl) {
    ctrl.hidden = true;
  }

  // Scroll reveals
  var targets = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('in'); });
  }

  // Email links: rebuilt from parts so an email-protection proxy can never break them.
  // The full Gmail link is already in each href, so they also work without this script.
  document.querySelectorAll('a[data-gmail]').forEach(function (a) {
    var to = a.getAttribute('data-user') + '@' + a.getAttribute('data-domain');
    var body = a.getAttribute('data-body');
    a.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to) +
      '&su=' + (a.getAttribute('data-su') || '') + (body ? '&body=' + body : '');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Photo viewer (projects page). Without it, each photo link opens the full-size image.
  var viewer = document.getElementById('viewer');
  var shots = Array.prototype.slice.call(document.querySelectorAll('a[data-view]'));
  if (viewer && shots.length && typeof viewer.showModal === 'function') {
    var pic = viewer.querySelector('.viewer-pic');
    var cap = viewer.querySelector('.viewer-cap');
    var idx = 0, opener = null;
    var render = function () {
      var s = shots[idx], thumb = s.querySelector('img');
      pic.src = s.getAttribute('href');
      pic.alt = thumb ? thumb.alt : '';
      cap.textContent = s.getAttribute('data-caption') || '';
    };
    var step = function (d) { idx = (idx + d + shots.length) % shots.length; render(); };
    shots.forEach(function (s, i) {
      s.addEventListener('click', function (e) {
        e.preventDefault();
        idx = i; opener = s; render(); viewer.showModal();
      });
    });
    viewer.querySelector('.viewer-close').addEventListener('click', function () { viewer.close(); });
    viewer.querySelector('.viewer-prev').addEventListener('click', function () { step(-1); });
    viewer.querySelector('.viewer-next').addEventListener('click', function () { step(1); });
    viewer.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    viewer.addEventListener('click', function (e) { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener('close', function () { if (opener) opener.focus(); });
  }
})();
