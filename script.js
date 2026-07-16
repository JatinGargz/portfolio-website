/**
 * ============================================================================
 *  AI / NEURAL-NETWORK THEMED DARK PORTFOLIO — INTERACTIVITY
 * ============================================================================
 *  Accent : #00d4ff  (electric cyan-blue)
 *  Author : Jatin
 *  Built  : 2026
 *
 *  Features
 *  --------
 *  1.  Loading screen with fake progress + status messages
 *  2.  Neural-network canvas background (particles + connections)
 *  3.  Custom cursor with lerp
 *  4.  Scroll-reveal animations (IntersectionObserver + stagger)
 *  5.  Navigation (scroll class, mobile menu)
 *  6.  Glow-card spotlight effect
 *  7.  (Skill card hover line — CSS only)
 *  8.  Smooth scroll for anchor links
 *  9.  Contact form validation
 *  10. Footer year
 *  11. Nav scroll-spy active state
 *  12. Loader canvas particles
 * ============================================================================
 */

;(function () {
  'use strict';

  /* =========================================================================
   *  DOM REFERENCES
   * ========================================================================= */

  // Loader
  const loader        = document.getElementById('loader');
  const loaderBar     = document.getElementById('loaderBar');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderStatus  = document.getElementById('loaderStatus');
  const loaderCanvas  = document.getElementById('loaderCanvas');
  const mainContent   = document.getElementById('mainContent');

  // Neural canvas
  const neuralCanvas = document.getElementById('neuralCanvas');

  // Custom cursor
  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  // Navigation
  const nav         = document.getElementById('nav');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  // Contact
  const contactForm = document.getElementById('contactForm');

  // Footer
  const currentYear = document.getElementById('currentYear');

  // Collections
  const glowCards      = document.querySelectorAll('.glow-card');
  const anchorLinks    = document.querySelectorAll('a[href^="#"]');
  const navLinks       = document.querySelectorAll('.nav__link');
  const sections       = document.querySelectorAll('section[id]');
  const animRevealEls  = document.querySelectorAll('.anim-reveal, .anim-reveal-up');

  /* =========================================================================
   *  SHARED STATE
   * ========================================================================= */

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let isTouchDevice = false;
  let loaderCanvasRAF = null;   // so we can cancel later

  /* =========================================================================
   *  1. LOADING SCREEN
   * ========================================================================= */

  function initLoader() {
    if (!loader) { revealMainContent(); return; }

    const STATUS_MESSAGES = [
      'Loading neural network...',
      'Initializing AI models...',
      'Compiling knowledge base...',
      'Rendering interface...',
      'Ready.'
    ];

    const DURATION   = 2500;   // ms total
    const startTime  = performance.now();

    // Start the small loader-canvas particle effect
    if (loaderCanvas) { startLoaderCanvas(); }

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const pct      = Math.round(progress * 100);

      // Update bar + counter
      if (loaderBar)     loaderBar.style.width = pct + '%';
      if (loaderPercent) loaderPercent.textContent = pct + '%';

      // Status message — map progress to message index
      const msgIndex = Math.min(
        Math.floor(progress * STATUS_MESSAGES.length),
        STATUS_MESSAGES.length - 1
      );
      if (loaderStatus) loaderStatus.textContent = STATUS_MESSAGES[msgIndex];

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Finished — hide loader & reveal site
        setTimeout(function () {
          loader.classList.add('hidden');
          stopLoaderCanvas();
          revealMainContent();
        }, 300);
      }
    }

    requestAnimationFrame(tick);
  }

  function revealMainContent() {
    if (mainContent) {
      mainContent.style.opacity       = '1';
      mainContent.style.pointerEvents = 'auto';
    }
    // Trigger entrance animations after a short delay so CSS transitions play
    setTimeout(triggerEntranceAnimations, 150);
  }

  function triggerEntranceAnimations() {
    if (nav) nav.classList.add('nav--visible');

    // Force-observe all reveal elements immediately (some may already be visible)
    animRevealEls.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }

  /* =========================================================================
   *  12. LOADER CANVAS (small particle field on the loader)
   * ========================================================================= */

  function startLoaderCanvas() {
    if (!loaderCanvas) return;
    const ctx = loaderCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W, H;

    function resize() {
      W = loaderCanvas.parentElement
        ? loaderCanvas.parentElement.clientWidth
        : window.innerWidth;
      H = loaderCanvas.parentElement
        ? loaderCanvas.parentElement.clientHeight
        : window.innerHeight;
      loaderCanvas.width  = W * dpr;
      loaderCanvas.height = H * dpr;
      loaderCanvas.style.width  = W + 'px';
      loaderCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const PARTICLE_COUNT = 30;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r:  Math.random() * 1.5 + 0.5,
        a:  Math.random() * 0.5 + 0.2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.25;
            ctx.strokeStyle = 'rgba(0,212,255,' + alpha + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.fillStyle = 'rgba(0,212,255,' + p.a + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      loaderCanvasRAF = requestAnimationFrame(draw);
    }

    loaderCanvasRAF = requestAnimationFrame(draw);
  }

  function stopLoaderCanvas() {
    if (loaderCanvasRAF) {
      cancelAnimationFrame(loaderCanvasRAF);
      loaderCanvasRAF = null;
    }
  }

  /* =========================================================================
   *  2. NEURAL NETWORK CANVAS BACKGROUND
   * ========================================================================= */

  function initNeuralCanvas() {
    if (!neuralCanvas) return;
    const ctx = neuralCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W, H;
    let particles = [];

    const CONNECTION_DIST   = 150;
    const REPULSION_DIST    = 200;
    const REPULSION_FORCE   = 0.6;

    function getCount() {
      return window.innerWidth < 768 ? 40 : 80;
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      neuralCanvas.width  = W * dpr;
      neuralCanvas.height = H * dpr;
      neuralCanvas.style.width  = W + 'px';
      neuralCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      const count = getCount();
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x:  Math.random() * W,
          y:  Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r:  Math.random() * 1 + 1,
          a:  Math.random() * 0.5 + 0.3
        });
      }
    }

    function handleResize() {
      resize();
      // Re-create if the count changes (mobile ↔ desktop)
      const target = getCount();
      if (particles.length !== target) createParticles();
    }

    resize();
    createParticles();
    window.addEventListener('resize', handleResize);

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Update positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dmx = p.x - mouse.x;
        const dmy = p.y - mouse.y;
        const dMouse = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dMouse < REPULSION_DIST && dMouse > 0) {
          const force = (1 - dMouse / REPULSION_DIST) * REPULSION_FORCE;
          p.vx += (dmx / dMouse) * force;
          p.vy += (dmy / dMouse) * force;
        }

        // Dampen velocity so particles don't fly off
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x += W;
        if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H;
        if (p.y > H) p.y -= H;
      }

      // Connection lines (pre-compute distance once per pair)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
            ctx.strokeStyle = 'rgba(0,212,255,' + alpha + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = 'rgba(0,212,255,' + p.a + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  /* =========================================================================
   *  3. CUSTOM CURSOR
   * ========================================================================= */

  function initCursor() {
    if (!cursorDot || !cursorRing) return;

    const INTERACTIVE_SELECTOR =
      'a, button, .skill-card, .project-card, .timeline__card, ' +
      '.contact-card, .filter-btn, .skill-tag, .interest-tag, .other-project-card, input, textarea';

    const pos = {
      dotX:  mouse.x, dotY:  mouse.y,
      ringX: mouse.x, ringY: mouse.y
    };

    // Hide default cursor on desktop via CSS (assumed), show our custom one
    cursorDot.style.display  = 'block';
    cursorRing.style.display = 'block';

    // Track mouse
    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Hover class for interactive elements (event delegation on body)
    document.body.addEventListener('mouseover', function (e) {
      if (e.target.closest(INTERACTIVE_SELECTOR)) {
        cursorDot.classList.add('hover');
        cursorRing.classList.add('hover');
      }
    });
    document.body.addEventListener('mouseout', function (e) {
      if (e.target.closest(INTERACTIVE_SELECTOR)) {
        cursorDot.classList.remove('hover');
        cursorRing.classList.remove('hover');
      }
    });

    // Animation loop
    function animate() {
      // Lerp
      pos.dotX  += (mouse.x - pos.dotX)  * 0.25;
      pos.dotY  += (mouse.y - pos.dotY)  * 0.25;
      pos.ringX += (mouse.x - pos.ringX) * 0.12;
      pos.ringY += (mouse.y - pos.ringY) * 0.12;

      cursorDot.style.transform  =
        'translate(' + pos.dotX + 'px, ' + pos.dotY + 'px) translate(-50%, -50%)';
      cursorRing.style.transform =
        'translate(' + pos.ringX + 'px, ' + pos.ringY + 'px) translate(-50%, -50%)';

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    // Touch detection — hide custom cursor on touch devices
    window.addEventListener('touchstart', function onFirstTouch() {
      isTouchDevice = true;
      cursorDot.style.display  = 'none';
      cursorRing.style.display = 'none';
      window.removeEventListener('touchstart', onFirstTouch);
    }, { passive: true });
  }

  /* =========================================================================
   *  4. SCROLL REVEAL ANIMATIONS
   * ========================================================================= */

  function initScrollReveal() {
    if (!animRevealEls.length) return;

    // Pre-compute stagger delays for children of grid/timeline containers
    const staggerContainers = document.querySelectorAll(
      '.skills__grid, .work__grid, .timeline, .other-projects__grid'
    );
    staggerContainers.forEach(function (container) {
      const children = container.querySelectorAll('.anim-reveal, .anim-reveal-up');
      children.forEach(function (child, idx) {
        child.style.transitionDelay = (idx * 0.08) + 's';
      });
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // once only
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    animRevealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =========================================================================
   *  5. NAVIGATION
   * ========================================================================= */

  function initNav() {
    // Scroll class
    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial check

    // Mobile toggle
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', function () {
        const isActive = mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : '';
      });

      mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          mobileToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* =========================================================================
   *  6. GLOW CARD SPOTLIGHT
   * ========================================================================= */

  function initGlowCards() {
    if (!glowCards.length) return;

    glowCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }

  /* =========================================================================
   *  8. SMOOTH SCROLL
   * ========================================================================= */

  function initSmoothScroll() {
    if (!anchorLinks.length) return;

    const NAV_OFFSET = 80;

    anchorLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          NAV_OFFSET;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* =========================================================================
   *  9. CONTACT FORM
   * ========================================================================= */

  function initContactForm() {
    if (!contactForm) return;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fields = contactForm.querySelectorAll('[required]');
      let valid = true;

      // Reset previous error states
      fields.forEach(function (field) {
        field.style.borderColor = '';
      });

      fields.forEach(function (field) {
        const val = field.value.trim();

        if (!val) {
          field.style.borderColor = '#ef4444';
          valid = false;
          return;
        }

        if (field.type === 'email' && !EMAIL_RE.test(val)) {
          field.style.borderColor = '#ef4444';
          valid = false;
        }
      });

      if (!valid) return;

      // "Send" success
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" ' +
          'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px">' +
          '<polyline points="20 6 9 17 4 12"></polyline></svg>Message Sent!';
        btn.style.backgroundColor = '#22c55e';
        btn.disabled = true;

        setTimeout(function () {
          btn.innerHTML = originalHTML;
          btn.style.backgroundColor = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      }
    });
  }

  /* =========================================================================
   *  10. FOOTER YEAR
   * ========================================================================= */

  function initFooterYear() {
    if (currentYear) {
      currentYear.textContent = new Date().getFullYear();
    }
  }

  /* =========================================================================
   *  11. NAV SCROLL-SPY (active link highlight)
   * ========================================================================= */

  function initScrollSpy() {
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              const href = link.getAttribute('href');
              if (href === '#' + id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        // Top of section must be in upper half of viewport
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* =========================================================================
   *  GLOBAL MOUSE TRACKING (for neural canvas when cursor module is absent)
   * ========================================================================= */

  function initGlobalMouse() {
    // Only add if cursor module didn't already attach a listener
    // We use a flag on the document to avoid duplicate listeners
    if (!document.__portfolioMouseTracking) {
      document.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      document.__portfolioMouseTracking = true;
    }
  }

  /* =========================================================================
   *  INIT — single entry point
   * ========================================================================= */

  function init() {
    initGlobalMouse();
    initLoader();
    initNeuralCanvas();
    initCursor();
    initScrollReveal();
    initNav();
    initGlowCards();
    initSmoothScroll();
    initContactForm();
    initFooterYear();
    initScrollSpy();
  }

  /* =========================================================================
   *  BOOT
   * ========================================================================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready (script loaded with defer/async or at bottom)
    init();
  }
})();
