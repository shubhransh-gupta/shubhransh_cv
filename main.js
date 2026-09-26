// ==========================================================================
// SHUBHRANSH GUPTA — PORTFOLIO RUNTIME
// 3D WebGL Tube Cursor, Card Depth Absorption, 3D Card Tilt,
// Vicinity Physics, Theme Switcher, Navigation & Marquee
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. TUBE CURSOR PALETTES & 3D WEBGL INITIALIZATION ──────────────────
  const PALETTES = {
    dark: {
      tubes: ['#E03A00', '#FF5C1A', '#FF8A3D', '#FFA672', '#FFCC80'],
      lights: { intensity: 120, colors: ['#D94E0E', '#FF6A2C', '#FF8533', '#FFB87A', '#FFD89E', '#E8B86F'] }
    },
    light: {
      tubes: ['#E03A00', '#FF5C1A', '#FF7A3C', '#FFA060', '#FFC08A'],
      lights: { intensity: 120, colors: ['#D94E0E', '#FF6A2C', '#FF8A4A', '#FFB070', '#F59E4B', '#E8B86F'] }
    }
  };

  let tubeApp = null;

  async function initTubeCursor() {
    const canvas = document.getElementById('tubeCanvas');
    if (!canvas || window.innerWidth <= 992) return;

    const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let Ctor = null;
    try {
      const mod = await import('./vendor/tubes1.min.js');
      Ctor = mod.default || mod;
    } catch (err) {
      try {
        const mod = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        Ctor = mod.default || mod;
      } catch (e) {
        console.warn('Tube cursor module could not be loaded:', e);
        return;
      }
    }

    if (!Ctor) return;

    const theme = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const palette = PALETTES[theme] || PALETTES.dark;

    try {
      if (tubeApp && tubeApp.dispose) {
        tubeApp.dispose();
      }
      tubeApp = Ctor(canvas, {
        tubes: {
          colors: palette.tubes,
          lights: { intensity: 120, colors: palette.lights }
        }
      });

      // Force canvas buffer to match window viewport immediately
      const resizeHandler = () => {
        window.dispatchEvent(new Event('resize'));
      };
      requestAnimationFrame(resizeHandler);
      window.addEventListener('resize', resizeHandler);
    } catch (err) {
      console.warn('Tube cursor initialization error:', err);
    }
  }

  // Initialize WebGL Tube Cursor
  initTubeCursor();


  // ── 2. MOUSE GLOW & CURSOR DOT TRACKER ─────────────────────────────────
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');
  const isTouchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  if (cursorGlow && cursorDot && !isTouchDevice && window.innerWidth > 992) {
    let mouseX = -500;
    let mouseY = -500;
    let glowX = -500;
    let glowY = -500;
    let idleTimer = null;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      cursorDot.style.opacity = '1';

      if (!document.body.hasAttribute('data-on-card') && !document.body.hasAttribute('data-on-method-card')) {
        cursorGlow.style.opacity = '1';
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        cursorGlow.style.opacity = '0';
      }, 180);
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
      cursorDot.style.opacity = '0';
    });

    // Smooth lerp follower for ambient cursor glow
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      requestAnimationFrame(animateGlow);
    }
    requestAnimationFrame(animateGlow);
  }


  // ── 3. CARD 3D INTERACTIVE TILT & IDLE FLOATING SWAY ───────────────────
  const caseCards = document.querySelectorAll('[data-case-card]');
  const PUSH_DEG = 7;

  caseCards.forEach((card) => {
    card.__3d = {
      isHovered: false,
      mx: 0,
      my: 0
    };

    card.addEventListener('mouseenter', () => {
      card.__3d.isHovered = true;
      document.body.setAttribute('data-on-card', 'true');
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.__3d.mx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      card.__3d.my = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    });

    card.addEventListener('mouseleave', () => {
      card.__3d.isHovered = false;
      card.__3d.mx = 0;
      card.__3d.my = 0;
      document.body.removeAttribute('data-on-card');
    });
  });

  // Continuous rAF animation loop for 3D card tilt & gentle idle sway
  function tick3d() {
    const t = performance.now();

    if (!isTouchDevice && window.innerWidth > 992) {
      caseCards.forEach((card) => {
        const s = card.__3d;
        if (!s) return;

        if (s.isHovered) {
          // Dynamic tilt tracking cursor with inverse 3D push
          const rx = s.my * PUSH_DEG;
          const ry = -s.mx * PUSH_DEG;
          card.style.transform = `perspective(3000px) translateZ(-22px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        } else {
          // Subtle idle sinusoidal sway for organic floating sensation
          const rx = Math.sin(t / 2400) * 2.2;
          const ry = Math.sin(t / 2800) * 2.8;
          const rz = Math.sin(t / 3800) * 0.8;
          card.style.transform = `perspective(3000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
        }
      });
    }

    requestAnimationFrame(tick3d);
  }
  requestAnimationFrame(tick3d);


  // ── 4. VICINITY DETECTION (PRE-ABSORPTION NEAR CARDS) ──────────────────
  const VICINITY_PX = 35;
  const absorbTargets = document.querySelectorAll('[data-case-card], [data-method-card]');

  window.addEventListener('mousemove', (e) => {
    if (document.body.hasAttribute('data-on-card') || document.body.hasAttribute('data-on-method-card')) {
      document.body.removeAttribute('data-near-card');
      return;
    }

    let minDist = Infinity;
    absorbTargets.forEach((card) => {
      const r = card.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) minDist = dist;
    });

    if (minDist <= VICINITY_PX) {
      document.body.setAttribute('data-near-card', 'true');
    } else {
      document.body.removeAttribute('data-near-card');
    }
  }, { passive: true });


  // ── 5. METHOD CARDS & BENTO HOVER ABSORPTION ───────────────────────────
  const methodCards = document.querySelectorAll('[data-method-card]');
  methodCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      document.body.setAttribute('data-on-method-card', 'true');
    });
    card.addEventListener('mouseleave', () => {
      document.body.removeAttribute('data-on-method-card');
    });
  });


  // ── 6. NAVBAR HOVER TUBE ABSORPTION ────────────────────────────────────
  const navbarPill = document.querySelector('.navbar-wrapper');
  if (navbarPill) {
    navbarPill.addEventListener('mouseenter', () => {
      document.body.setAttribute('data-on-card', 'true');
    });
    navbarPill.addEventListener('mouseleave', () => {
      document.body.removeAttribute('data-on-card');
    });
  }


  // ── 7. THEME SWITCHER ──────────────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('sg_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('sg_theme', next);

      // Re-initialize WebGL tube cursor with corresponding light/dark palette
      initTubeCursor();
    });
  }


  // ── 8. SCROLL SPY & NAVBAR ELEVATION ───────────────────────────────────
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 160;

    if (navbar) {
      if (window.scrollY > 40) {
        navbar.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.55)';
        navbar.style.border = '1px solid rgba(255, 92, 26, 0.25)';
      } else {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
        navbar.style.border = '1px solid var(--border-subtle)';
      }
    }

    // Active Section Spy
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('data-nav') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { passive: true });


  // ── 9. MOBILE DRAWER TOGGLE ────────────────────────────────────────────
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileDrawer.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileDrawer.classList.remove('open');
      }
    });

    const mobileLinks = mobileDrawer.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }


  // ── 10. TESTIMONIALS DRAGGABLE & AUTO-SCROLL MARQUEE ───────────────────
  const marqueeWrapper = document.getElementById('marqueeWrapper');
  const marqueeTrack = document.getElementById('marqueeTrack');

  if (marqueeWrapper && marqueeTrack) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let autoScrollSpeed = 0.6;
    let isPaused = false;

    // Clone cards for seamless looping
    const originalCards = Array.from(marqueeTrack.children);
    originalCards.forEach((c) => {
      const clone = c.cloneNode(true);
      marqueeTrack.appendChild(clone);
    });

    // Auto-scroll loop
    function autoScroll() {
      if (!isPaused && !isDown) {
        marqueeWrapper.scrollLeft += autoScrollSpeed;
        if (marqueeWrapper.scrollLeft >= marqueeTrack.scrollWidth / 2) {
          marqueeWrapper.scrollLeft = 0;
        }
      }
      requestAnimationFrame(autoScroll);
    }
    requestAnimationFrame(autoScroll);

    // Pause on hover
    marqueeWrapper.addEventListener('mouseenter', () => { isPaused = true; });
    marqueeWrapper.addEventListener('mouseleave', () => { isPaused = false; });

    // Drag interactions (Mouse)
    marqueeWrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      isPaused = true;
      startX = e.pageX - marqueeWrapper.offsetLeft;
      scrollLeft = marqueeWrapper.scrollLeft;
    });

    marqueeWrapper.addEventListener('mouseleave', () => {
      isDown = false;
    });

    marqueeWrapper.addEventListener('mouseup', () => {
      isDown = false;
    });

    marqueeWrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - marqueeWrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      marqueeWrapper.scrollLeft = scrollLeft - walk;
    });

    // Touch support (Mobile)
    marqueeWrapper.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
    marqueeWrapper.addEventListener('touchend', () => { isPaused = false; }, { passive: true });
  }


  // ── 11. TRANSMISSION COPY EMAIL ────────────────────────────────────────
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyText = document.getElementById('copyEmailText');

  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.getAttribute('data-email');
      navigator.clipboard.writeText(email).then(() => {
        const original = copyText.textContent;
        copyText.textContent = 'Copied to clipboard!';
        copyText.style.color = '#22c55e';
        setTimeout(() => {
          copyText.textContent = original;
          copyText.style.color = 'var(--accent-gold)';
        }, 2200);
      });
    });
  }

});
