/* Orbyt-inspired interactions */
(function () {
  'use strict';

  const CIRC = 408; // 2 * PI * 65
  let lenisInstance = null;

  /* ── Intro ── */
  function initIntro() {
    const screen = document.getElementById('introScreen');
    const circle = document.getElementById('introProgressCircle');
    const percent = document.getElementById('introPercent');
    const skip = document.getElementById('introSkip');
    const videoB = document.getElementById('introVideoB');
    const wrapB = document.querySelector('.intro-video-wrap-b');
    if (!screen) return;

    document.body.classList.add('intro-active');

    if (videoB) {
      videoB.src = 'assets/orbyt/video/intro-orbit.webm';
      videoB.load();
    }

    let progress = 0;
    let done = false;

    function finishIntro() {
      if (done) return;
      done = true;
      screen.classList.add('is-done');
      document.body.classList.remove('intro-active');
      document.body.classList.add('intro-complete');
      document.getElementById('header')?.classList.add('is-visible');

      const hint = document.getElementById('scrollHint');
      if (hint) {
        setTimeout(() => hint.classList.add('is-visible'), 400);
      }

      setTimeout(() => {
        initScrollAnimations();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }, 700);
    }

    function tick() {
      if (done) return;
      progress = Math.min(progress + 1.2, 100);
      if (circle) circle.style.strokeDashoffset = CIRC - (CIRC * progress) / 100;
      if (percent) percent.textContent = Math.floor(progress) + '%';

      if (progress >= 55 && wrapB) wrapB.classList.add('is-visible');
      if (progress >= 100) {
        if (videoB && !videoB.ended) {
          videoB.play().catch(() => finishIntro());
          videoB.addEventListener('ended', finishIntro, { once: true });
          setTimeout(finishIntro, 8000);
        } else {
          setTimeout(finishIntro, 600);
        }
        return;
      }
      requestAnimationFrame(tick);
    }

    skip?.addEventListener('click', finishIntro);
    requestAnimationFrame(tick);
  }

  /* ── Starfield ── */
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars = Array.from({ length: 280 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 2 + 0.2,
        r: Math.random() * 1.2 + 0.2,
      }));
    }

    function draw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      stars.forEach((s) => {
        s.y -= s.z * 0.15;
        if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
        const alpha = 0.2 + s.z * 0.35;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
  }

  /* ── Top video ── */
  function initTopVideo() {
    const v = document.getElementById('topVideo');
    if (!v) return;
    v.src = 'assets/orbyt/video/top-bg.webm';
    v.load();
    const play = () => v.play().catch(() => {});
    document.addEventListener('intro-done', play, { once: true });
  }

  /* ── Hero scroll sequence ── */
  function initHeroScroll() {
    const heroCenter = document.getElementById('heroCenter');
    const scrollHint = document.getElementById('scrollHint');
    if (!heroCenter) return;

    gsap.set('#heroCenter', { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.88, y: 24 });
    gsap.set('.hero-text', { xPercent: -50, yPercent: -50, autoAlpha: 0, y: 40 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section-hero',
        start: 'top top',
        end: '+=280%',
        scrub: 0.8,
        pin: '.hero-stage',
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (!scrollHint) return;
          if (self.progress > 0.08) scrollHint.classList.add('is-hidden');
          else if (document.body.classList.contains('intro-complete')) {
            scrollHint.classList.add('is-visible');
          }
        },
        onLeave: () => {
          gsap.set('#heroCenter', { autoAlpha: 0 });
          gsap.set('.hero-text', { autoAlpha: 0 });
        },
        onEnterBack: () => {
          /* scrub handles state on scroll back */
        },
      },
    });

    tl.to('#heroCenter', { autoAlpha: 1, scale: 1, y: 0, duration: 0.12, ease: 'power1.out' })
      .to('#heroCenter', { autoAlpha: 0, scale: 0.78, y: -80, duration: 0.28, ease: 'power2.in' })
      .to('.hero-text-1', { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out' }, '-=0.18')
      .to('.hero-text-1', { autoAlpha: 0, y: -24, duration: 0.18 })
      .to('.hero-text-2', { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, '-=0.1')
      .to('.hero-text-2', { autoAlpha: 0, y: -24, duration: 0.18 })
      .to('.hero-text-3', { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, '-=0.1')
      .to('.hero-text-3', { autoAlpha: 0, y: -24, duration: 0.18 })
      .to('.hero-text-4', { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, '-=0.1');
  }

  /* ── Lenis + GSAP ── */
  let scrollReady = false;

  function initScrollAnimations() {
    if (scrollReady) return;
    scrollReady = true;
    document.dispatchEvent(new Event('intro-done'));

    if (typeof Lenis !== 'undefined') {
      lenisInstance = new Lenis({ duration: 1.4, smoothWheel: true });
      lenisInstance.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenisInstance.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    initHeroScroll();

    /* Video circle scale */
    gsap.from('.video-circle', {
      scrollTrigger: {
        trigger: '.section-video',
        start: 'top 75%',
        end: 'center center',
        scrub: 1,
      },
      scale: 0.55,
      opacity: 0,
    });

    gsap.from('.video-copy', {
      scrollTrigger: {
        trigger: '.section-video',
        start: 'top 60%',
        end: 'center center',
        scrub: 1,
      },
      y: 40,
      opacity: 0,
    });

    /* Planet parallax */
    gsap.to('.planet-main', {
      scrollTrigger: {
        trigger: '.section-planets',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
      y: -80,
      rotate: 8,
    });

    gsap.from('.planet-intro', {
      scrollTrigger: { trigger: '.section-planets', start: 'top 85%' },
      y: 30,
      opacity: 0,
      duration: 0.8,
    });

    gsap.to('.planet-float-2', {
      scrollTrigger: { trigger: '.section-planets', start: 'top bottom', end: 'bottom top', scrub: 1 },
      x: 60,
      y: -100,
    });

    gsap.to('.planet-float-3', {
      scrollTrigger: { trigger: '.section-planets', start: 'top bottom', end: 'bottom top', scrub: 1 },
      x: -50,
      y: 80,
    });

    gsap.from('.planet-outro', {
      scrollTrigger: { trigger: '.planet-outro', start: 'top 90%' },
      y: 30,
      opacity: 0,
      duration: 0.8,
    });

    /* Section reveals */
    gsap.utils.toArray('.section-system, .section-multiverse, .section-experience, .section-edu, .section-testimonials, .section-contact').forEach((sec) => {
      const target = sec.querySelector('h2, .system-header, .multiverse-header, .exp-header, .contact-inner');
      if (!target) return;
      gsap.from(target, {
        scrollTrigger: { trigger: sec, start: 'top 82%' },
        y: 36,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out',
      });
    });

    gsap.utils.toArray('.exp-item, .mv-panel.active, .edu-card, .testimonial-grid blockquote').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        y: 28,
        opacity: 0,
        duration: 0.7,
        delay: (i % 4) * 0.05,
        ease: 'power2.out',
      });
    });

    ScrollTrigger.refresh();
  }

  /* ── System slider ── */
  function initSystemSlider() {
    const track = document.querySelector('.system-track');
    document.querySelector('.sys-prev')?.addEventListener('click', () => {
      const card = track?.querySelector('.system-slide');
      track?.scrollBy({ left: -(card?.offsetWidth || 400) - 24, behavior: 'smooth' });
    });
    document.querySelector('.sys-next')?.addEventListener('click', () => {
      const card = track?.querySelector('.system-slide');
      track?.scrollBy({ left: (card?.offsetWidth || 400) + 24, behavior: 'smooth' });
    });
  }

  /* ── Multiverse tabs ── */
  function initMultiverseTabs() {
    document.querySelectorAll('.mv-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const idx = tab.dataset.tab;
        document.querySelectorAll('.mv-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.mv-panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`.mv-panel[data-panel="${idx}"]`)?.classList.add('active');
      });
    });
  }

  /* ── Counters ── */
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const dur = 1400;
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach((e) => obs.observe(e));
  }

  /* ── Cursor ── */
  function initCursor() {
    const cur = document.querySelector('.custom-cursor');
    if (!cur || window.matchMedia('(pointer: coarse)').matches) return;
    window.addEventListener('pointermove', (e) => {
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .mv-tab').forEach((el) => {
      el.addEventListener('pointerenter', () => cur.classList.add('is-large'));
      el.addEventListener('pointerleave', () => cur.classList.remove('is-large'));
    });
  }

  /* ── Anchor scroll ── */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const hash = anchor.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(target, { offset: -80, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Menu ── */
  function initMenu() {
    const menu = document.getElementById('hamMenu');
    const open = () => menu?.classList.add('is-open');
    const close = () => menu?.classList.remove('is-open');
    document.getElementById('menuBtn')?.addEventListener('click', open);
    document.getElementById('hamClose')?.addEventListener('click', close);
    menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  window.addEventListener('resize', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });

  document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initStarfield();
    initTopVideo();
    initSystemSlider();
    initMultiverseTabs();
    initCounters();
    initCursor();
    initMenu();
    initAnchorScroll();
  });
})();
