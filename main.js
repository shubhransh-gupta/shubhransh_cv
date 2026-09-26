// ==========================================================================
// SHUBHRANSH GUPTA — PORTFOLIO RUNTIME
// Interactions, Glow Cursor, Theme, Marquee & Navigation
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. MOUSE GLOW & CURSOR DOT
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');

  if (cursorGlow && cursorDot && window.innerWidth > 992) {
    let mouseX = -500;
    let mouseY = -500;
    let glowX = -500;
    let glowY = -500;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Smooth RAF follower for the soft glow
    function animateCursor() {
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Interactive element hover scale
    const hoverTargets = document.querySelectorAll('a, button, .work-card, .method-card, .timeline-card, .bento-cell');
    hoverTargets.forEach((target) => {
      target.addEventListener('mouseenter', () => {
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(2.2)`;
        cursorDot.style.background = '#ffffff';
      });
      target.addEventListener('mouseleave', () => {
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(1)`;
        cursorDot.style.background = 'var(--accent)';
      });
    });
  }

  // 2. THEME SWITCHER
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('sg_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('sg_theme', next);
    });
  }

  // 3. SCROLL SPY & NAVBAR ELEVATION
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

  // 4. MOBILE DRAWER TOGGLE
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

  // 5. TESTIMONIALS DRAGGABLE & AUTO-SCROLL MARQUEE
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
        // Reset when halfway through the duplicated track
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

  // 6. COPY EMAIL BUTTON
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
