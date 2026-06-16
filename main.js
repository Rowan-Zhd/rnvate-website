document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel  = document.getElementById('themeLabel');
  if (themeToggle && themeLabel) {
    const applyTheme = (isLight) => {
      document.body.classList.toggle('light', isLight);
      themeLabel.textContent = isLight ? 'Dark' : 'Light';
    };
    applyTheme(localStorage.getItem('rnvate-theme') === 'light');
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light');
      localStorage.setItem('rnvate-theme', isLight ? 'light' : 'dark');
      themeLabel.textContent = isLight ? 'Dark' : 'Light';
    });
  }

  // Custom cursor removed (#12): native pointer everywhere

  // Sticky nav
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
      if (window.lucide) lucide.createIcons();
    });
    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.innerHTML = '<i data-lucide="menu"></i>';
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  // Scroll reveal
  document.querySelectorAll('[data-reveal]').forEach(el => {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { entries[0].target.classList.add('visible'); obs.disconnect(); }
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }).observe(el);
  });

  // Stat counters
  const counters = document.querySelectorAll('.counter');
  const statsEl = document.querySelector('.hero__stats');
  let fired = false;
  if (statsEl) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !fired) {
        fired = true;
        counters.forEach(el => {
          const target = parseFloat(el.dataset.target);
          const dur = 2000, t0 = performance.now();
          (function tick(now) {
            const p = Math.min((now - t0) / dur, 1);
            const e = 1 - Math.pow(1 - p, 4);
            el.textContent = Math.floor(target * e);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = String(target);
          })(performance.now());
        });
      }
    }, { threshold: 0.5 }).observe(statsEl);
  }

  // Service accordion
  document.querySelectorAll('[data-svc]').forEach(row => {
    row.querySelector('.svc-row__head').addEventListener('click', () => {
      row.classList.toggle('open');
      document.querySelectorAll('[data-svc]').forEach(other => { if (other !== row) other.classList.remove('open'); });
      if (window.lucide) lucide.createIcons();
    });
  });

  // Contact form
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn     = document.getElementById('formBtn');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value.trim() !== '') { form.reset(); return; }
      let valid = true;
      form.querySelectorAll('[required]').forEach(f => {
        const field = f.closest('.form-field');
        field.classList.remove('form-field--error');
        if (!f.value.trim()) { field.classList.add('form-field--error'); valid = false; }
      });
      if (!valid) return;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      const payload = {
        firstName: form.firstName.value.trim(),
        lastName:  form.lastName.value.trim(),
        email:     form.email.value.trim(),
        company:   form.company.value.trim(),
        message:   form.message.value.trim(),
        _subject:  'New Contact - RNVATE Website',
        _template: 'table',
        _captcha:  'true'
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
          if (window.lucide) lucide.createIcons();
          if (success) { success.classList.add('show'); setTimeout(() => success.classList.remove('show'), 5000); }
        })
        .catch(() => {
          btn.innerHTML = 'Send Message <i data-lucide="arrow-right" width="14" height="14"></i>';
          btn.disabled = false;
          if (window.lucide) lucide.createIcons();
          btn.textContent = 'Failed - try again';
          setTimeout(() => { btn.innerHTML = 'Send Message <i data-lucide="arrow-right" width="14" height="14"></i>'; if (window.lucide) lucide.createIcons(); }, 3000);
        });
    });
    form.querySelectorAll('.form-field__input').forEach(input => {
      input.addEventListener('input', () => input.closest('.form-field').classList.remove('form-field--error'));
    });
  }
});
