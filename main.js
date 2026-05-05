document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  // ── Theme toggle ───────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel  = document.getElementById('themeLabel');

  function applyTheme(isLight) {
    document.body.classList.toggle('light', isLight);
    themeLabel.textContent = isLight ? 'Dark' : 'Light';
  }

  // Restore saved preference
  applyTheme(localStorage.getItem('rnvate-theme') === 'light');

  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('rnvate-theme', isLight ? 'light' : 'dark');
    themeLabel.textContent = isLight ? 'Dark' : 'Light';
  });

  // ── Custom cursor ──────────────────────────────────────────
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function animateCursor() {
    // dot follows instantly
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    // ring lags behind
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateCursor);
  })();

  // Scale ring on interactive elements
  document.querySelectorAll('a, button, [data-svc]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '56px';
      ring.style.height = '56px';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '36px';
      ring.style.height = '36px';
    });
  });

  // ── Sticky nav ─────────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── Mobile hamburger ───────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    lucide.createIcons();
  });

  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.innerHTML = '<i data-lucide="menu"></i>';
      lucide.createIcons();
    });
  });

  // ── Scroll reveal ──────────────────────────────────────────
  const revealEls = document.querySelectorAll('[data-reveal]');
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' })
  .observe && revealEls.forEach(el => {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) entries[0].target.classList.add('visible');
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }).observe(el);
  });

  // ── Stat counters ──────────────────────────────────────────
  const counters = document.querySelectorAll('.counter');
  let fired = false;

  const statsEl = document.querySelector('.hero__stats');
  if (statsEl) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !fired) {
        fired = true;
        counters.forEach(el => {
          const target  = parseFloat(el.dataset.target);
          const decimal = 'decimal' in el.dataset;
          const dur = 2000;
          const t0  = performance.now();
          (function tick(now) {
            const p = Math.min((now - t0) / dur, 1);
            const e = 1 - Math.pow(1 - p, 4); // ease-out quart
            el.textContent = decimal ? (target * e).toFixed(1) : Math.floor(target * e);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = decimal ? target.toFixed(1) : String(target);
          })(performance.now());
        });
      }
    }, { threshold: 0.5 }).observe(statsEl);
  }

  // ── Service accordion ──────────────────────────────────────
  document.querySelectorAll('[data-svc]').forEach(row => {
    row.querySelector('.svc-row__head').addEventListener('click', () => {
      const isOpen = row.classList.toggle('open');
      // Close siblings
      document.querySelectorAll('[data-svc]').forEach(other => {
        if (other !== row) other.classList.remove('open');
      });
      lucide.createIcons();
    });
  });

  // ── Contact form ───────────────────────────────────────────
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('formBtn');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach(f => {
        const field = f.closest('.form-field');
        field.classList.remove('form-field--error');
        if (!f.value.trim()) {
          field.classList.add('form-field--error');
          valid = false;
        }
      });

      if (!valid) return;

      btn.textContent = 'Sending…';
      btn.disabled = true;

      // Collect form fields into JSON
      const payload = {
        firstName: form.firstName.value.trim(),
        lastName:  form.lastName.value.trim(),
        email:     form.email.value.trim(),
        company:   form.company.value.trim(),
        message:   form.message.value.trim(),
        _subject:  'New Contact — RNVATE Website',
        _template: 'table',
        _captcha:  'false'
      };

      fetch('https://formsubmit.co/ajax/rawan.z@rnvate.com', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(() => {
          form.reset();
          form.querySelectorAll('.form-field').forEach(f => f.classList.remove('form-field--error'));
          btn.innerHTML = 'Send Message <i data-lucide="arrow-right" width="14" height="14"></i>';
          btn.disabled = false;
          lucide.createIcons();
          success.classList.add('show');
          setTimeout(() => success.classList.remove('show'), 5000);
        })
        .catch(() => {
          btn.innerHTML = 'Send Message <i data-lucide="arrow-right" width="14" height="14"></i>';
          btn.disabled = false;
          lucide.createIcons();
          // Surface a brief error state on the button
          btn.textContent = 'Failed — try again';
          setTimeout(() => {
            btn.innerHTML = 'Send Message <i data-lucide="arrow-right" width="14" height="14"></i>';
            lucide.createIcons();
          }, 3000);
        });
    });

    form.querySelectorAll('.form-field__input').forEach(input => {
      input.addEventListener('input', () => {
        input.closest('.form-field').classList.remove('form-field--error');
      });
    });
  }
});
