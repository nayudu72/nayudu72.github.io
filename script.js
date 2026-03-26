(function () {
  'use strict';

  /* ─── References ─── */
  var header      = document.getElementById('header');
  var burger      = document.getElementById('nav-burger');
  var nav         = document.getElementById('primary-nav');
  var veil        = document.getElementById('nav-veil');
  var themeBtn    = document.getElementById('theme-btn');
  var backTop     = document.getElementById('back-top');
  var scrollBar   = document.getElementById('scroll-bar');
  var yearEl      = document.getElementById('yr');
  var form        = document.getElementById('contact-form');
  var submitBtn   = document.getElementById('submit-btn');
  var cfOk        = document.getElementById('cf-ok');
  var cfErr       = document.getElementById('cf-err');
  var cfErrTxt    = document.getElementById('cf-err-txt');

  /* ═══════════════════════════════════
     THEME
     ═══════════════════════════════════ */
  var savedTheme = localStorage.getItem('nr-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  themeBtn && themeBtn.addEventListener('click', function () {
    var cur  = document.documentElement.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : 'dark';
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
  veil   && veil.addEventListener('click',   function () { openMenu(false); });

  nav && nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.innerWidth <= 768) openMenu(false);
    });
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

    header   && header.classList.toggle('scrolled', y > 60);
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
      var hh  = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hh')) || 62;
      var top = target.getBoundingClientRect().top + window.scrollY - hh - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ═══════════════════════════════════
     SCROLL SPY — active nav link
     ═══════════════════════════════════ */
  var navLinks  = document.querySelectorAll('.nl[data-s]');
  var sids      = ['hero','about','competencies','experience','education','certifications','contact'];
  var sEls      = sids.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function spyUpdate() {
    var mid     = window.scrollY + window.innerHeight * 0.3;
    var current = null;
    for (var i = sEls.length - 1; i >= 0; i--) {
      if (sEls[i].offsetTop <= mid) { current = sEls[i].id; break; }
    }
    navLinks.forEach(function (l) {
      l.classList.toggle('active', !!(current && l.getAttribute('data-s') === current));
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
    if (txt)  txt.textContent = on ? 'Sending…' : 'Send message';
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

    setLoading(true);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(form)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          msgShow(cfOk, true);
          form.reset();
          setTimeout(function () { msgShow(cfOk, false); }, 7000);
        } else {
          if (cfErrTxt) cfErrTxt.textContent = data.message || 'Something went wrong. Please try again.';
          msgShow(cfErr, true);
        }
      })
      .catch(function () {
        /* AJAX failed — fall back to native form POST */
        form.submit();
      })
      .finally(function () { setLoading(false); });
  });

  /* Clear invalid state on input */
  form && form.querySelectorAll('input, textarea').forEach(function (f) {
    f.addEventListener('input', function () { f.classList.remove('invalid'); });
  });

})();
