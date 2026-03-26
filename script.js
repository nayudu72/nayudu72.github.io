(function () {
  'use strict';

  /* ---- Element references ---- */
  var header       = document.getElementById('header');
  var navToggle    = document.getElementById('nav-toggle');
  var nav          = document.getElementById('site-nav');
  var backdrop     = document.getElementById('nav-backdrop');
  var themeToggle  = document.getElementById('theme-toggle');
  var backTop      = document.getElementById('back-top');
  var scrollBar    = document.querySelector('.scroll-progress');
  var footerYear   = document.getElementById('footer-year');

  /* ============================================================
     THEME — persist + respect system preference
     ============================================================ */
  var stored = localStorage.getItem('nr-theme');
  if (stored === 'dark' || stored === 'light') {
    document.documentElement.setAttribute('data-theme', stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle && themeToggle.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nr-theme', next);
  });

  /* ============================================================
     MOBILE NAV
     ============================================================ */
  function setMenuOpen(open) {
    if (!header) return;
    header.classList.toggle('nav-open', open);
    document.body.classList.toggle('menu-open', open);
    navToggle && navToggle.setAttribute('aria-expanded', String(open));
    if (backdrop) {
      backdrop.classList.toggle('is-visible', open);
      backdrop.setAttribute('aria-hidden', String(!open));
    }
  }

  navToggle  && navToggle.addEventListener('click', function () { setMenuOpen(!header.classList.contains('nav-open')); });
  backdrop   && backdrop.addEventListener('click', function () { setMenuOpen(false); });

  nav && nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.innerWidth <= 768) setMenuOpen(false);
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) setMenuOpen(false);
  }, { passive: true });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header && header.classList.contains('nav-open')) setMenuOpen(false);
  });

  /* ============================================================
     SCROLL: header shadow + progress bar + back-to-top
     ============================================================ */
  function onScroll() {
    var y   = window.scrollY;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? Math.round((y / max) * 100) : 0;

    header    && header.classList.toggle('scrolled', y > 50);
    if (scrollBar) { scrollBar.style.width = pct + '%'; scrollBar.setAttribute('aria-valuenow', String(pct)); }
    if (backTop) backTop.hidden = y < 400;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backTop && backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================================
     SMOOTH SCROLL for internal anchors
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id     = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     SCROLL-SPY — active nav link
     ============================================================ */
  var navLinks  = document.querySelectorAll('.nav-link[data-section]');
  var sectionIds = ['hero', 'profile', 'competencies', 'experience', 'education', 'certifications', 'contact'];
  var sectionEls = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function updateActiveNav() {
    var mid = window.scrollY + window.innerHeight * 0.3;
    var current = null;
    for (var i = sectionEls.length - 1; i >= 0; i--) {
      if (sectionEls[i].offsetTop <= mid) { current = sectionEls[i].id; break; }
    }
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', !!(current && link.getAttribute('data-section') === current));
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ============================================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================================ */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.02 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ============================================================
     FOOTER YEAR
     ============================================================ */
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* ============================================================
     RESUME DOWNLOAD — JS blob method for sandbox/iframe compat
     ============================================================ */
  document.querySelectorAll('a[download]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href     = link.getAttribute('href');
      var filename = link.getAttribute('download') || (href && href.split('/').pop()) || 'Resume.pdf';
      if (!href) return;
      fetch(href)
        .then(function (res) { if (!res.ok) throw new Error('fetch failed'); return res.blob(); })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var a   = document.createElement('a');
          a.href = url; a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(url); document.body.removeChild(a); }, 300);
        })
        .catch(function () { window.open(href, '_blank', 'noopener,noreferrer'); });
    });
  });

  /* ============================================================
     CONTACT FORM — Web3Forms API submission
     ============================================================ */
  var contactForm   = document.getElementById('contact-form');
  var submitBtn     = document.getElementById('submit-btn');
  var formSuccess   = document.getElementById('form-success');
  var formError     = document.getElementById('form-error');
  var formErrorMsg  = document.getElementById('form-error-msg');

  function setSubmitting(loading) {
    if (!submitBtn) return;
    var label   = submitBtn.querySelector('.btn-label');
    var arrow   = submitBtn.querySelector('.btn-arrow');
    var spinner = submitBtn.querySelector('.btn-spinner');
    submitBtn.disabled = loading;
    if (label)   label.textContent  = loading ? 'Sending…' : 'Send message';
    if (arrow)   arrow.hidden       = loading;
    if (spinner) spinner.hidden     = !loading;
  }

  function showField(el, visible) {
    if (el) el.hidden = !visible;
  }

  function validateForm(form) {
    var valid  = true;
    var fields = form.querySelectorAll('input[required], textarea[required]');
    fields.forEach(function (f) {
      f.classList.remove('is-invalid');
      if (!f.value.trim()) { f.classList.add('is-invalid'); valid = false; }
    });
    var emailEl = form.querySelector('input[type="email"]');
    if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('is-invalid'); valid = false;
    }
    return valid;
  }

  contactForm && contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    showField(formSuccess, false);
    showField(formError, false);

    if (!validateForm(contactForm)) return;

    /* Check if access key has been configured */
    var accessKeyInput = contactForm.querySelector('input[name="access_key"]');
    if (accessKeyInput && accessKeyInput.value === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      /* Fallback: open mailto if access key not yet set */
      var name    = (contactForm.querySelector('[name="name"]')    || {}).value || '';
      var subject = (contactForm.querySelector('[name="subject"]') || {}).value || ('Message from ' + name.trim());
      var message = (contactForm.querySelector('[name="message"]') || {}).value || '';
      var sub     = encodeURIComponent(subject.trim() || 'Message from ' + name.trim());
      var body    = encodeURIComponent(message.trim() + '\n\n— ' + name.trim());
      window.location.href = 'mailto:nayudu72y@gmail.com?subject=' + sub + '&body=' + body;
      return;
    }

    setSubmitting(true);

    /* Build subject line */
    var subjectEl    = contactForm.querySelector('[name="subject"]');
    var nameEl       = contactForm.querySelector('[name="name"]');
    var subjectValue = (subjectEl && subjectEl.value.trim()) || 'Message from ' + ((nameEl && nameEl.value.trim()) || 'visitor');
    if (subjectEl) subjectEl.value = subjectValue;

    var formData = new FormData(contactForm);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          showField(formSuccess, true);
          contactForm.reset();
          /* Auto-hide success after 6s */
          setTimeout(function () { showField(formSuccess, false); }, 6000);
        } else {
          if (formErrorMsg) formErrorMsg.textContent = data.message || 'Something went wrong. Please email directly.';
          showField(formError, true);
        }
      })
      .catch(function () {
        if (formErrorMsg) formErrorMsg.textContent = 'Network error. Please email nayudu72y@gmail.com directly.';
        showField(formError, true);
      })
      .finally(function () {
        setSubmitting(false);
      });
  });

  /* Clear validation errors on input */
  contactForm && contactForm.querySelectorAll('input, textarea').forEach(function (field) {
    field.addEventListener('input', function () { field.classList.remove('is-invalid'); });
  });

})();
