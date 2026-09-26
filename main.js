/**
 * CYBERNETIC HUD INTERFACE ENGINE
 * Figma Implementation: Web Portfolio Design (Community)
 * Architected for Shubhransh Gupta — Senior iOS Engineer
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const state = {
    currentView: 0,
    viewNames: [
      'THE WHALE · SYS.01 // HERO',
      'SYS.02 // AGENT DOSSIER',
      'SYS.03 // CAPABILITY MATRIX',
      'SYS.04 // OPERATIONAL TIMELINE',
      'SYS.05 // INNOVATION ARTIFACTS',
      'SYS.06 // TRANSMISSION TERMINAL'
    ],
    audioEnabled: true,
    currentProjectIndex: 0,
    totalProjects: 9,
    activeCompany: 'pocketfm'
  };

  // --------------------------------------------------------------------------
  // PROCEDURAL WEB AUDIO SFX (No external assets required!)
  // --------------------------------------------------------------------------
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playCyberTone(type) {
    if (!state.audioEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.04);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'tab') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'modal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      // Audio autoplay restriction fallback
    }
  }

  function setupSoundToggle() {
    const toggle = document.getElementById('soundToggle');
    const label = document.getElementById('soundLabel');
    if (!toggle) return;

    // Check saved state
    const savedAudio = localStorage.getItem('sg_cyber_sfx');
    if (savedAudio !== null) {
      state.audioEnabled = savedAudio === 'true';
    }
    updateAudioUI();

    toggle.addEventListener('click', () => {
      state.audioEnabled = !state.audioEnabled;
      localStorage.setItem('sg_cyber_sfx', state.audioEnabled);
      updateAudioUI();
      if (state.audioEnabled) playCyberTone('click');
    });

    window.addEventListener('keydown', (e) => {
      if ((e.key === 'm' || e.key === 'M') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        state.audioEnabled = !state.audioEnabled;
        localStorage.setItem('sg_cyber_sfx', state.audioEnabled);
        updateAudioUI();
        if (state.audioEnabled) playCyberTone('click');
      }
    });

    function updateAudioUI() {
      if (state.audioEnabled) {
        toggle.classList.remove('is-muted');
        if (label) label.textContent = 'SFX: ON';
      } else {
        toggle.classList.add('is-muted');
        if (label) label.textContent = 'SFX: MUTED';
      }
    }
  }

  // --------------------------------------------------------------------------
  // CUSTOM CYBER CROSSHAIR CURSOR
  // --------------------------------------------------------------------------
  function setupCursor() {
    const cursor = document.getElementById('cyberCursor');
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currX = mouseX;
    let currY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderCursor() {
      currX += (mouseX - currX) * 0.35;
      currY += (mouseY - currY) * 0.35;
      cursor.style.transform = `translate(${currX}px, ${currY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover state on interactive elements
    const interactiveSelector = 'a, button, input, textarea, .dock-tab, .tech-card, .exp-tab-btn, .project-hud-card, .comm-card, .sound-ctrl';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.add('is-hover');
        playCyberTone('hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.remove('is-hover');
      }
    });
  }

  // --------------------------------------------------------------------------
  // BACKGROUND PARTICLES & NEBULA CANVAS
  // --------------------------------------------------------------------------
  function setupCanvas() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(80, Math.floor(window.innerWidth / 20));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.5,
        radius: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.3 ? '255, 30, 66' : '0, 229, 255'
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.fill();
      }

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  // --------------------------------------------------------------------------
  // NAVIGATION & VIEW SWITCHER
  // --------------------------------------------------------------------------
  function setupNavigation() {
    const dockTabs = document.querySelectorAll('.dock-tab');
    const views = document.querySelectorAll('.hud-view');
    const viewLabel = document.getElementById('currentViewLabel');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const drawerClose = document.getElementById('drawerClose');

    function switchView(index) {
      if (index < 0 || index >= views.length) return;
      state.currentView = index;
      playCyberTone('tab');

      // Update views - prevent inactive views from bleeding through
      views.forEach((v, i) => {
        if (i === index) {
          v.classList.add('active');
          v.style.display = 'block';
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(v, { opacity: 0, y: 15, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
          }
        } else {
          v.classList.remove('active');
          v.style.display = 'none';
          if (typeof gsap !== 'undefined') {
            gsap.set(v, { clearProps: 'all' });
          }
        }
      });

      // Update dock tabs
      dockTabs.forEach((tab, i) => {
        if (i === index) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      // Update header label
      if (viewLabel && state.viewNames[index]) {
        viewLabel.textContent = state.viewNames[index];
      }

      // Close mobile drawer if open
      if (mobileDrawer) mobileDrawer.classList.remove('open');
    }

    // Dock Tabs click
    dockTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = parseInt(tab.getAttribute('data-nav'), 10);
        switchView(target);
      });
    });

    // Links with data-nav attribute
    document.addEventListener('click', (e) => {
      const navTrigger = e.target.closest('[data-nav]');
      if (navTrigger) {
        const target = parseInt(navTrigger.getAttribute('data-nav'), 10);
        if (!isNaN(target)) {
          e.preventDefault();
          switchView(target);
        }
      }
    });

    // Keyboard navigation (1-6 for views, arrow keys)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key, 10) - 1;
        switchView(idx);
      } else if (e.key === 'ArrowRight') {
        switchView((state.currentView + 1) % views.length);
      } else if (e.key === 'ArrowLeft') {
        switchView((state.currentView - 1 + views.length) % views.length);
      }
    });

    // Mobile menu toggle
    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.add('open');
        playCyberTone('click');
      });
    }
    if (drawerClose && mobileDrawer) {
      drawerClose.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        playCyberTone('click');
      });
    }
  }

  // --------------------------------------------------------------------------
  // REALTIME HUD CLOCK
  // --------------------------------------------------------------------------
  function setupClock() {
    const clockEl = document.getElementById('hudClock');
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${hours}:${minutes}:${seconds} IST`;
    }
    update();
    setInterval(update, 1000);
  }

  // --------------------------------------------------------------------------
  // EXPERIENCE DUAL-PANE TERMINAL
  // --------------------------------------------------------------------------
  const companyData = {
    pocketfm: {
      title: 'Pocket FM',
      role: 'SDE 2 · Aug 2026 – Present · Bengaluru, India',
      badge: 'CURRENT ENGAGEMENT',
      metricVal: '100% HANG-FREE',
      metricSub: 'STORE REVAMP V2 & 99.9% CRASH-FREE',
      bullets: [
        'Spearheaded end-to-end architecture and implementation of <strong>Store Revamp V2</strong>, enabling coin purchases via Apple In-App Purchase (StoreKit 2), Juspay gateway integration, and rewarded ad unlock flows with rich fluid animations.',
        'Eliminated UI thread bottlenecks through rigorous <strong>hang detection, thread sanitization, and GCD queue profiling</strong>, achieving 100% hang-free performance and maintaining <strong>99.9% crash-free sessions</strong> at massive audio streaming scale.',
        'Overhauled <strong>Notification &amp; Tracking Permissions</strong>, implementing privacy-compliant telemetry to diagnose real-time hangs and crashes while driving higher user opt-in for episodic content releases.',
        'Re-engineered <strong>Profile Revamp V2</strong> featuring dual-channel OTP verification across email and phone, streamlining listener onboarding and reinforcing account security.'
      ],
      tags: ['Swift 6.0', 'StoreKit 2', 'Juspay SDK', 'Rewarded Ads', 'Hang Diagnostics', 'GCD Thread Sanitization', 'Instruments', 'Firebase Crashlytics']
    },
    navi: {
      title: 'Navi',
      role: 'SDE 2 · May 2025 – Mar 2026 · Bengaluru, India',
      badge: 'HIGH-SCALE FINTECH',
      metricVal: '100% MODULAR',
      metricSub: 'SWINJECT DI ENGINE',
      bullets: [
        'Dramatically improved application scalability and modular lifecycle separation by migrating legacy AppDelegate lifecycle to <strong>SceneDelegate architecture</strong>.',
        'Enabled deep-linking, contextual shortcuts, and faster content discovery by implementing <strong>CoreSpotlight-based search indexing</strong> directly into iOS system search.',
        'Enhanced architectural testability and clean domain boundaries by implementing runtime and compile-time dependency injection using <strong>Swinject</strong>.'
      ],
      tags: ['Swift', 'SceneDelegate', 'CoreSpotlight', 'Swinject (DI)', 'Fintech UPI', 'Unit Testing']
    },
    mmt: {
      title: 'MakeMyTrip',
      role: 'Senior Software Engineer · Jan 2024 – May 2025 · Bengaluru, India',
      badge: 'CONSUMER TRAVEL PLATFORM',
      metricVal: '50M+ USERS',
      metricSub: 'UNIFIED FLIGHTS SDK',
      bullets: [
        'Improved user conversion and revenue metrics by developing high-impact customer features like <strong>Zero Cancellation, Free Date Change Insurance</strong>, and advanced Sort & Filter using SwiftUI.',
        'Accelerated cross-team feature integration by architecting and implementing the <strong>Unified Flights SDK</strong> using SPM and CocoaPods across multiple architectural patterns.',
        'Increased pod velocity and code quality by leading an iOS pod and conducting technical knowledge-sharing workshops on modern Swift patterns and memory management.'
      ],
      tags: ['SwiftUI & UIKit', 'SPM & CocoaPods', 'Unified Flights SDK', 'Combine', 'Pod Leadership']
    },
    nuclei: {
      title: 'Nuclei',
      role: 'iOS Developer · SDE-1 · May 2021 – Dec 2023 · Bengaluru, India',
      badge: 'ENTERPRISE BANKING SDK',
      metricVal: 'NPCI CERTIFIED',
      metricSub: 'UPI INTEGRATION',
      bullets: [
        'Delivered mission-critical mobile banking capabilities including <strong>Fund Transfer, Scan & Pay, and seamless customer onboarding</strong> across top tier tier-1 banks.',
        'Achieved full national regulatory compliance by integrating <strong>UPI using the NPCI Common Library (CL)</strong> and successfully navigating stringent security certifications.',
        'Optimized local offline caching and data integrity by refactoring CoreData migrations, background context concurrency, and database synchronization routines.'
      ],
      tags: ['Swift', 'NPCI UPI Library', 'CoreData Concurrency', 'Banking Security', 'Scan & Pay']
    }
  };

  function setupExperienceTerminal() {
    const buttons = document.querySelectorAll('.exp-tab-btn');
    const pane = document.getElementById('expDetailPane');
    if (!buttons.length || !pane) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const coKey = btn.getAttribute('data-company');
        if (!companyData[coKey]) return;

        playCyberTone('click');
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const data = companyData[coKey];
        renderCompany(data);
      });
    });

    function renderCompany(data) {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(pane, { opacity: 0.4, x: 8 }, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' });
      }

      pane.innerHTML = `
        <div class="exp-pane-head">
          <div>
            <span class="exp-badge">${data.badge}</span>
            <h3 class="exp-co-title">${data.title}</h3>
            <p class="exp-role-line">${data.role}</p>
          </div>
          <div class="exp-stats-box">
            <span class="stat-highlight">${data.metricVal}</span>
            <span class="stat-sub">${data.metricSub}</span>
          </div>
        </div>

        <div class="exp-pane-body">
          <h4 class="exp-section-label">MISSION OBJECTIVES &amp; IMPACT</h4>
          <ul class="exp-bullets">
            ${data.bullets.map((b) => `
              <li>
                <span class="bullet-glow"></span>
                <span>${b}</span>
              </li>
            `).join('')}
          </ul>

          <h4 class="exp-section-label">TECHNOLOGY STACK</h4>
          <div class="exp-tags-row">
            ${data.tags.map((t) => `<span class="e-tag">${t}</span>`).join('')}
          </div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // SKILLS FILTERING MATRIX
  // --------------------------------------------------------------------------
  function setupSkillsFilter() {
    const filterPills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.tech-card');
    if (!filterPills.length) return;

    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        playCyberTone('click');
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.getAttribute('data-filter');
        cards.forEach((card) => {
          const cat = card.getAttribute('data-cat');
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // PROJECTS CAROUSEL CONTROLS
  // --------------------------------------------------------------------------
  function setupProjectsCarousel() {
    const prevBtn = document.getElementById('projPrev');
    const nextBtn = document.getElementById('projNext');
    const counter = document.getElementById('projCounter');
    const cards = document.querySelectorAll('.project-hud-card');
    if (!cards.length) return;
    state.totalProjects = cards.length;

    function updateCarousel() {
      if (counter) {
        counter.textContent = `${String(state.currentProjectIndex + 1).padStart(2, '0')} / ${String(state.totalProjects).padStart(2, '0')}`;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        state.currentProjectIndex = (state.currentProjectIndex - 1 + state.totalProjects) % state.totalProjects;
        playCyberTone('click');
        updateCarousel();
        highlightCard(state.currentProjectIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.currentProjectIndex = (state.currentProjectIndex + 1) % state.totalProjects;
        playCyberTone('click');
        updateCarousel();
        highlightCard(state.currentProjectIndex);
      });
    }

    function highlightCard(idx) {
      cards.forEach((card, i) => {
        if (i === idx) {
          card.classList.add('active');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          card.classList.remove('active');
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // SPEC MODAL ARCHITECTURE INSPECTOR
  // --------------------------------------------------------------------------
  const modalSpecs = {
    cobalion: {
      title: 'COBALION — AI REGULATORY COMPLIANCE PLATFORM',
      subtitle: 'Navi Hackathon · Best Innovative Project Winner',
      content: `
        <div style="font-family: var(--font-body); font-size: 13px; line-height: 1.6; color: var(--text-mid); display: flex; flex-direction: column; gap: 14px;">
          <p>
            <strong style="color: #fff;">Cobalion</strong> was conceived and developed during the Navi Internal Hackathon to solve a massive operational bottleneck in regulatory compliance across Indian fintech and lending entities.
          </p>
          <div style="padding: 12px; background: rgba(255, 30, 66, 0.08); border: 1px solid var(--border-hud);">
            <strong style="color: var(--crimson); font-family: var(--font-mono);">KEY ARCHITECTURAL HIGHLIGHTS:</strong>
            <ul style="margin-top: 8px; padding-left: 18px; display: flex; flex-direction: column; gap: 6px;">
              <li>Automated scraping pipeline continuously monitors NPCI, SEBI, and RBI regulatory portals for newly issued PDF and HTML circulars.</li>
              <li>Document text extraction pipeline with intelligent tabular data normalization and semantic chunking.</li>
              <li>Contextual LLM analysis pipeline mapping regulatory directives against internal operational policies and service contracts.</li>
              <li>Risk scoring engine delivering high-urgency alerts to engineering and legal stakeholders on identified compliance discrepancies.</li>
            </ul>
          </div>
          <p>
            The project was evaluated on engineering complexity, accuracy of legal analysis, and real-time alert dispatching, earning the <strong>Best Innovative Project Award</strong>.
          </p>
        </div>
      `
    },
    pogo: {
      title: 'POGO — GIFT VOUCHER & RECHARGE ECOSYSTEM',
      subtitle: 'Nuclei Hackathon Winner',
      content: `
        <div style="font-family: var(--font-body); font-size: 13px; line-height: 1.6; color: var(--text-mid); display: flex; flex-direction: column; gap: 14px;">
          <p>
            Developed during the Nuclei Hackathon, <strong style="color: #fff;">POGO</strong> is a unified gift voucher issuing and redemption engine integrated with telecommunication recharge APIs.
          </p>
          <div style="padding: 12px; background: rgba(0, 229, 255, 0.08); border: 1px solid rgba(0, 229, 255, 0.3);">
            <strong style="color: var(--cyan); font-family: var(--font-mono);">SYSTEM ARCHITECTURE:</strong>
            <ul style="margin-top: 8px; padding-left: 18px; display: flex; flex-direction: column; gap: 6px;">
              <li><strong>iOS Client:</strong> Native Swift application built with reactive UI patterns, animated scratch-card vouchers, and biometric transaction approval.</li>
              <li><strong>Backend Service:</strong> Asynchronous Python service handling voucher code generation, validation state machines, and webhook dispatching.</li>
              <li><strong>Data Layer:</strong> MySQL database schema featuring atomic balance operations and idempotency locks for payment transactions.</li>
            </ul>
          </div>
          <p>
            Demonstrated end-to-end user voucher redemption, merchant settlement reconciliation, and high-concurrency fraud prevention.
          </p>
        </div>
      `
    }
  };

  window.openSpecModal = function (specKey) {
    const modal = document.getElementById('specModal');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    if (!modal || !modalSpecs[specKey]) return;

    playCyberTone('modal');
    const spec = modalSpecs[specKey];
    if (titleEl) titleEl.textContent = spec.title;
    if (bodyEl) bodyEl.innerHTML = spec.content;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  function setupModalControls() {
    const modal = document.getElementById('specModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const backdrop = document.getElementById('modalBackdrop');
    if (!modal) return;

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      playCyberTone('click');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  // --------------------------------------------------------------------------
  // INTERACTIVE 3D PARALLAX TILT
  // --------------------------------------------------------------------------
  function setupParallax() {
    const whaleViewport = document.getElementById('whaleViewport');
    const figureFrame = document.querySelector('.figure-frame');

    window.addEventListener('mousemove', (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (e.clientX - centerX) / centerX;
      const deltaY = (e.clientY - centerY) / centerY;

      if (whaleViewport && state.currentView === 0) {
        whaleViewport.style.transform = `translate(-50%, -50%) perspective(1000px) rotateY(${deltaX * 5}deg) rotateX(${-deltaY * 5}deg)`;
      }

      if (figureFrame && state.currentView === 5) {
        figureFrame.style.transform = `perspective(1000px) rotateY(${deltaX * 6}deg) rotateX(${-deltaY * 6}deg)`;
      }
    });
  }

  // --------------------------------------------------------------------------
  // TRANSMISSION FORM & COPY EMAIL HANDLERS
  // --------------------------------------------------------------------------
  window.handleFormSubmit = function (e) {
    e.preventDefault();
    playCyberTone('click');

    const name = document.getElementById('senderName')?.value || '';
    const email = document.getElementById('senderEmail')?.value || '';
    const msg = document.getElementById('senderMsg')?.value || '';
    const status = document.getElementById('transStatus');

    if (status) {
      status.textContent = 'SIGNAL DISPATCHED // OPENING ENCRYPTED EMAIL CLIENT...';
    }

    const mailto = `mailto:gupta.subhransh@gmail.com?subject=${encodeURIComponent('iOS Engineering Inquiry from ' + name)}&body=${encodeURIComponent(msg + '\n\nSender Email: ' + email)}`;
    setTimeout(() => {
      window.location.href = mailto;
      if (status) {
        status.textContent = 'TRANSMISSION COMPLETE. EXPECT CONTACT SHORTLY.';
      }
    }, 600);
  };

  function setupCopyEmail() {
    const copyBtn = document.getElementById('copyEmailBtn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
      playCyberTone('click');
      const email = copyBtn.getAttribute('data-email') || 'gupta.subhransh@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        const span = copyBtn.querySelector('span');
        if (span) {
          const original = span.textContent;
          span.textContent = 'COPIED!';
          setTimeout(() => {
            span.textContent = original;
          }, 2000);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION RUNNER
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    setupSoundToggle();
    setupCursor();
    setupCanvas();
    setupNavigation();
    setupClock();
    setupExperienceTerminal();
    setupSkillsFilter();
    setupProjectsCarousel();
    setupModalControls();
    setupParallax();
    setupCopyEmail();

    // Check initial hash (e.g. #about, #skills, #experience, #projects, #contact)
    const hash = window.location.hash.toLowerCase();
    const hashMap = {
      '#home': 0,
      '#top': 0,
      '#about': 1,
      '#skills': 2,
      '#system': 2,
      '#experience': 3,
      '#projects': 4,
      '#multiverse': 4,
      '#contact': 5,
      '#network': 5
    };
    if (hash && hashMap[hash] !== undefined) {
      const trigger = document.querySelector(`.dock-tab[data-nav="${hashMap[hash]}"]`);
      if (trigger) trigger.click();
    }
  });

})();
