(function () {
  'use strict';

  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  const backdrop = document.getElementById('nav-backdrop');
  const themeToggle = document.getElementById('theme-toggle');
  const backTop = document.getElementById('back-top');
  const scrollProgress = document.querySelector('.scroll-progress');
  const footerYear = document.getElementById('footer-year');

  /* Theme: persist + respect system preference */
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', storedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle?.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  function setMenuOpen(open) {
    if (!header) return;
    header.classList.toggle('nav-open', open);
    document.body.classList.toggle('menu-open', open);
    navToggle?.setAttribute('aria-expanded', String(open));
    if (backdrop) {
      backdrop.classList.toggle('is-visible', open);
      backdrop.setAttribute('aria-hidden', String(!open));
    }
  }

  navToggle?.addEventListener('click', function () {
    setMenuOpen(!header.classList.contains('nav-open'));
  });

  backdrop?.addEventListener('click', function () {
    setMenuOpen(false);
  });

  nav?.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.innerWidth <= 900) setMenuOpen(false);
    });
  });

  window.addEventListener(
    'resize',
    function () {
      if (window.innerWidth > 900) setMenuOpen(false);
    },
    { passive: true }
  );

  /* Header shadow + scroll progress + back-to-top */
  function onScroll() {
    var y = window.scrollY;
    header?.classList.toggle('scrolled', y > 40);

    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? Math.round((y / max) * 100) : 0;
    if (scrollProgress) {
      scrollProgress.style.width = pct + '%';
      scrollProgress.setAttribute('aria-valuenow', String(pct));
    }
    if (backTop) backTop.hidden = y < 450;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backTop?.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Scroll-triggered reveals */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var revealIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            revealIo.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.02 }
    );
    reveals.forEach(function (el) {
      revealIo.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* Active nav link (section spy) */
  var navLinks = document.querySelectorAll('.nav-link[data-section]');
  var sectionIds = ['hero', 'profile', 'competencies', 'experience', 'education', 'certifications', 'contact'];
  var sectionEls = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  function updateActiveNav() {
    var mid = window.scrollY + window.innerHeight * 0.28;
    var current = null;
    for (var i = sectionEls.length - 1; i >= 0; i--) {
      if (sectionEls[i].offsetTop <= mid) {
        current = sectionEls[i].id;
        break;
      }
    }
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', current && link.getAttribute('data-section') === current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* Download CV — JS-based download for sandbox/iframe compatibility */
  document.querySelectorAll('a[download]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href = link.getAttribute('href');
      if (!href) return;
      var filename = link.getAttribute('download') || href.split('/').pop() || 'CV.pdf';
      fetch(href)
        .then(function (res) {
          if (!res.ok) throw new Error('fetch failed');
          return res.blob();
        })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 200);
        })
        .catch(function () {
          /* fallback: open PDF in new tab */
          window.open(href, '_blank', 'noopener,noreferrer');
        });
    });
  });

  /* Contact links — use location.href so mailto/tel aren't swallowed by popup blockers */
  document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = link.getAttribute('href');
    });
  });

  /* Smooth scroll for all internal anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
