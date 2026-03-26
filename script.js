(function () {
  'use strict';

  /* ─── References ─── */
  var header    = document.getElementById('header');
  var burger    = document.getElementById('nav-burger');
  var nav       = document.getElementById('primary-nav');
  var veil      = document.getElementById('nav-veil');
  var themeBtn  = document.getElementById('theme-btn');
  var backTop   = document.getElementById('back-top');
  var scrollBar = document.getElementById('scroll-bar');
  var yearEl    = document.getElementById('yr');
  var form      = document.getElementById('contact-form');
  var submitBtn = document.getElementById('submit-btn');
  var cfOk      = document.getElementById('cf-ok');
  var cfErr     = document.getElementById('cf-err');
  var cfErrTxt  = document.getElementById('cf-err-txt');
  var canvas    = document.getElementById('hero-canvas');

  /* ═══════════════════════════════════
     THEME
     ═══════════════════════════════════ */
  var savedTheme = localStorage.getItem('nr-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    document.documentElement.setAttribute('data-theme',
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  themeBtn && themeBtn.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nr-theme', next);
  });

  /* ═══════════════════════════════════
     MOBILE NAV
     ═══════════════════════════════════ */
  function openMenu(open) {
    if (!header) return;
    header.classList.toggle('nav-open', open);
    document.body.classList.toggle('menu-open', open);
    burger && burger.setAttribute('aria-expanded', String(open));
    if (veil) { veil.classList.toggle('is-vis', open); veil.setAttribute('aria-hidden', String(!open)); }
  }
  burger && burger.addEventListener('click', function () {
    openMenu(!header.classList.contains('nav-open'));
  });
  veil && veil.addEventListener('click', function () { openMenu(false); });
  nav && nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { if (window.innerWidth <= 768) openMenu(false); });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) openMenu(false);
  }, { passive: true });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header && header.classList.contains('nav-open')) openMenu(false);
  });

  /* ═══════════════════════════════════
     SCROLL — header / progress / back-top
     ═══════════════════════════════════ */
  function onScroll() {
    var y   = window.scrollY;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? Math.round((y / max) * 100) : 0;
    header && header.classList.toggle('scrolled', y > 60);
    if (scrollBar) { scrollBar.style.width = pct + '%'; scrollBar.setAttribute('aria-valuenow', String(pct)); }
    if (backTop) backTop.hidden = y < 400;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop && backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ═══════════════════════════════════
     SMOOTH SCROLL — internal anchors
     ═══════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id     = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var hh  = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hh')) || 64;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - hh - 8, behavior: 'smooth' });
    });
  });

  /* ═══════════════════════════════════
     SCROLL SPY — active nav link
     ═══════════════════════════════════ */
  var navLinks = document.querySelectorAll('.nl[data-s]');
  var sids     = ['hero','about','competencies','experience','education','certifications','contact'];
  var sEls     = sids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function spyUpdate() {
    var mid = window.scrollY + window.innerHeight * 0.3;
    var cur = null;
    for (var i = sEls.length - 1; i >= 0; i--) {
      if (sEls[i].offsetTop <= mid) { cur = sEls[i].id; break; }
    }
    navLinks.forEach(function (l) {
      l.classList.toggle('active', !!(cur && l.getAttribute('data-s') === cur));
    });
  }
  window.addEventListener('scroll', spyUpdate, { passive: true });
  spyUpdate();

  /* ═══════════════════════════════════
     SCROLL REVEAL
     ═══════════════════════════════════ */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.02 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('vis'); });
  }

  /* ═══════════════════════════════════
     FOOTER YEAR
     ═══════════════════════════════════ */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ═══════════════════════════════════
     RESUME DOWNLOAD — blob + fallback
     ═══════════════════════════════════ */
  document.querySelectorAll('a[download]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href = link.getAttribute('href');
      var name = link.getAttribute('download') || (href && href.split('/').pop()) || 'Resume.pdf';
      if (!href) return;
      fetch(href)
        .then(function (r) { if (!r.ok) throw new Error('fail'); return r.blob(); })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a   = document.createElement('a');
          a.href = url; a.download = name;
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 300);
        })
        .catch(function () { window.open(href, '_blank', 'noopener,noreferrer'); });
    });
  });

  /* ═══════════════════════════════════
     CONTACT FORM — Web3Forms
     ═══════════════════════════════════ */
  function msgShow(el, show) { if (el) el.hidden = !show; }

  function setLoading(on) {
    if (!submitBtn) return;
    var txt  = submitBtn.querySelector('.btn-txt');
    var arr  = submitBtn.querySelector('.btn-arr');
    var spin = submitBtn.querySelector('.btn-spin');
    submitBtn.disabled = on;
    if (txt)  txt.textContent = on ? 'Sending…' : 'Send Message';
    if (arr)  arr.hidden = on;
    if (spin) spin.hidden = !on;
  }

  function validate() {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      f.classList.remove('invalid');
      if (!f.value.trim()) { f.classList.add('invalid'); ok = false; }
    });
    var em = form.querySelector('input[type="email"]');
    if (em && em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) {
      em.classList.add('invalid'); ok = false;
    }
    return ok;
  }

  form && form.addEventListener('submit', function (e) {
    e.preventDefault();
    msgShow(cfOk, false); msgShow(cfErr, false);
    if (!validate()) return;
    var subEl  = form.querySelector('[name="subject"]');
    var nameEl = form.querySelector('[name="name"]');
    if (subEl && !subEl.value.trim()) {
      subEl.value = 'Message from ' + ((nameEl && nameEl.value.trim()) || 'visitor');
    }
    setLoading(true);
    fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          msgShow(cfOk, true); form.reset();
          setTimeout(function () { msgShow(cfOk, false); }, 7000);
        } else {
          if (cfErrTxt) cfErrTxt.textContent = data.message || 'Submission failed. Please email nayudu72y@gmail.com directly.';
          msgShow(cfErr, true);
        }
      })
      .catch(function () { form.submit(); })
      .finally(function () { setLoading(false); });
  });

  form && form.querySelectorAll('input, textarea').forEach(function (f) {
    f.addEventListener('input', function () { f.classList.remove('invalid'); });
  });

  /* ═══════════════════════════════════
     COUNTER ANIMATION (count-up on scroll)
     ═══════════════════════════════════ */
  var counters = document.querySelectorAll('.stat-counter');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el     = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var start  = null;
        var dur    = 1600;
        var step   = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
          el.textContent = String(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = String(target);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ═══════════════════════════════════
     CANVAS PARTICLE NETWORK
     ═══════════════════════════════════ */
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var pts = [];
  var mouse = { x: -9999, y: -9999 };

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function Pt() {
    this.reset();
  }
  Pt.prototype.reset = function () {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r  = Math.random() * 1.5 + 0.5;
    this.a  = Math.random() * 0.45 + 0.1;
  };
  Pt.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    var dx = this.x - mouse.x;
    var dy = this.y - mouse.y;
    var d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 100) {
      var f = (100 - d) / 100;
      this.x += (dx / d) * f * 2;
      this.y += (dy / d) * f * 2;
    }
  };

  function initPts() {
    var n = Math.min(Math.max(Math.floor((canvas.width * canvas.height) / 12000), 30), 80);
    pts = [];
    for (var i = 0; i < n; i++) pts.push(new Pt());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var dark = isDark();
    var dc = dark ? [139, 92, 246] : [109, 40, 217];
    var lc1 = dark ? [139, 92, 246] : [109, 40, 217];
    var lc2 = dark ? [6, 182, 212]  : [8, 145, 178];

    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + dc[0] + ',' + dc[1] + ',' + dc[2] + ',' + p.a + ')';
      ctx.fill();

      for (var j = i + 1; j < pts.length; j++) {
        var q  = pts[j];
        var dx = p.x - q.x;
        var dy = p.y - q.y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) {
          var op = (1 - d / 150) * (dark ? 0.15 : 0.1);
          var t  = ((p.x + q.x) / 2) / canvas.width;
          var r  = Math.round(lc1[0] * (1 - t) + lc2[0] * t);
          var g  = Math.round(lc1[1] * (1 - t) + lc2[1] * t);
          var b  = Math.round(lc1[2] * (1 - t) + lc2[2] * t);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + op + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('resize', function () {
    resizeCanvas();
    initPts();
  }, { passive: true });

  resizeCanvas();
  initPts();
  draw();

})();
