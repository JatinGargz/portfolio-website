/**
 * ============================================================================
 *  AI ENGINEER PORTFOLIO — INTERACTIVITY
 * ============================================================================
 *  Accent : #0070f3 (Electric Blue)
 *  Author : Jatin Garg
 *
 *  Core Features:
 *  1. Loading screen with simulated sandbox progress & status logs
 *  2. Background Neural Network Canvas (interactive drifting particles)
 *  3. Spring-physics Custom Cursor (trailing ring & dot)
 *  4. Scroll Reveal Animations (staggered delay for grid elements)
 *  5. Theme Switching (light/dark data-theme toggle & localStorage)
 *  6. Floating Dock & Sticky Header scrolled actions
 *  7. Case Study Modal (injects dynamic Markdown-structured project stories)
 *  8. Glow-card spotlights cursor coordinates tracking
 *  ============================================================================
 */

;(function () {
  'use strict';

  /* =========================================================================
   *  DOM REFERENCES & GLOBALS
   * ========================================================================= */
  const loader        = document.getElementById('loader');
  const loaderBar     = document.getElementById('loaderBar');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderStatus  = document.getElementById('loaderStatus');
  const loaderCanvas  = document.getElementById('loaderCanvas');
  const mainContent   = document.getElementById('mainContent');

  const neuralCanvas = document.getElementById('neuralCanvas');
  const cursorDot    = document.getElementById('cursorDot');
  const cursorRing   = document.getElementById('cursorRing');
  const floatingDock = document.getElementById('floatingDock');
  const nav          = document.getElementById('nav');
  const themeToggle  = document.getElementById('themeToggle');
  const themeIcon    = document.getElementById('themeIcon');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  const contactForm  = document.getElementById('contactForm');

  const caseModal    = document.getElementById('caseModal');
  const modalClose   = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalBody    = document.getElementById('modalBody');

  const glowCards      = document.querySelectorAll('.glow-card');
  const animRevealEls  = document.querySelectorAll('.anim-reveal, .anim-reveal-up');
  const anchorLinks    = document.querySelectorAll('a[href^="#"]');

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let isTouchDevice = false;
  let loaderCanvasRAF = null;

  /* =========================================================================
   *  1. LOADING SCREEN
   * ========================================================================= */
  function initLoader() {
    if (!loader) { revealMainContent(); return; }

    const STATUS_MESSAGES = [
      'Mounting secure container sandbox...',
      'Spinning up workflow nodes...',
      'Mapping technical stack indexes...',
      'Synchronizing neural canvas...',
      'Ready.'
    ];

    const DURATION = 2000;
    const startTime = performance.now();

    if (loaderCanvas) { startLoaderCanvas(); }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const pct = Math.round(progress * 100);

      if (loaderBar) loaderBar.style.width = pct + '%';
      if (loaderPercent) loaderPercent.textContent = pct + '%';

      const msgIndex = Math.min(
        Math.floor(progress * STATUS_MESSAGES.length),
        STATUS_MESSAGES.length - 1
      );
      if (loaderStatus) loaderStatus.textContent = STATUS_MESSAGES[msgIndex];

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(function () {
          loader.classList.add('hidden');
          stopLoaderCanvas();
          revealMainContent();
        }, 200);
      }
    }

    requestAnimationFrame(tick);
  }

  function revealMainContent() {
    if (mainContent) {
      mainContent.style.opacity = '1';
      mainContent.style.pointerEvents = 'auto';
    }
    setTimeout(triggerEntranceAnimations, 100);
  }

  function triggerEntranceAnimations() {
    if (nav) nav.classList.add('nav--visible');
    animRevealEls.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }

  /* =========================================================================
   *  2. NEURAL NETWORK CANVAS BACKGROUND
   * ========================================================================= */
  let neuralRAF = null;
  const particles = [];

  function initNeuralCanvas() {
    if (!neuralCanvas) return;
    const ctx = neuralCanvas.getContext('2d');
    
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      neuralCanvas.width = window.innerWidth * dpr;
      neuralCanvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    const particleCount = window.innerWidth < 768 ? 35 : 75;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.8
      });
    }

    function animate() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw lines
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const lineColor = currentTheme === 'light' ? 'rgba(0, 112, 243, ' : 'rgba(0, 112, 243, ';
      const nodeColor = currentTheme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.15)';

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Repel mouse
        const dx = mouse.x - p1.x;
        const dy = mouse.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          p1.x -= (dx / dist) * force * 1.2;
          p1.y -= (dy / dist) * force * 1.2;
        }

        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap edges
        if (p1.x < 0) p1.x = window.innerWidth;
        if (p1.x > window.innerWidth) p1.x = 0;
        if (p1.y < 0) p1.y = window.innerHeight;
        if (p1.y > window.innerHeight) p1.y = 0;

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ldx = p1.x - p2.x;
          const ldy = p1.y - p2.y;
          const ldist = Math.sqrt(ldx * ldx + ldy * ldy);

          if (ldist < 140) {
            const alpha = (140 - ldist) / 140 * 0.12;
            ctx.strokeStyle = lineColor + alpha + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      neuralRAF = requestAnimationFrame(animate);
    }
    animate();
  }

  /* =========================================================================
   *  3. CUSTOM CURSOR
   * ========================================================================= */
  function initCursor() {
    if (!cursorDot || !cursorRing) return;

    const INTERACTIVE_SELECTOR =
      'a, button, .skill-card, .project-card, .timeline-v2__card, .case-modal__close, ' +
      '.contact-card, .tech-card, .tech-card-large, .writing-card, .work-item-row, .action-btn, .btn-case-study, .theme-toggle, input, textarea';

    const pos = { dotX: mouse.x, dotY: mouse.y, ringX: mouse.x, ringY: mouse.y };

    cursorDot.style.display = 'block';
    cursorRing.style.display = 'block';

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

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

    function animate() {
      pos.dotX  += (mouse.x - pos.dotX) * 0.28;
      pos.dotY  += (mouse.y - pos.dotY) * 0.28;
      pos.ringX += (mouse.x - pos.ringX) * 0.14;
      pos.ringY += (mouse.y - pos.ringY) * 0.14;

      cursorDot.style.transform  = `translate(${pos.dotX}px, ${pos.dotY}px) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate(${pos.ringX}px, ${pos.ringY}px) translate(-50%, -50%)`;

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    window.addEventListener('touchstart', function onFirstTouch() {
      isTouchDevice = true;
      cursorDot.style.display = 'none';
      cursorRing.style.display = 'none';
      window.removeEventListener('touchstart', onFirstTouch);
    }, { passive: true });
  }

  /* =========================================================================
   *  4. SCROLL REVEAL ANIMATIONS
   * ========================================================================= */
  function initScrollReveal() {
    if (!animRevealEls.length) return;

    // Stagger containers
    const staggerContainers = document.querySelectorAll(
      '.skills__grid-revamp, .work__grid, .timeline-v2, .tech-cards__grid, .research__grid, .other-projects__grid'
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
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    animRevealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* =========================================================================
   *  5. THEME SWITCHER
   * ========================================================================= */
  function initTheme() {
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light') {
      themeIcon.className = 'ph ph-sun theme-toggle__icon';
    } else {
      themeIcon.className = 'ph ph-moon theme-toggle__icon';
    }
  }

  /* =========================================================================
   *  6. NAVIGATION & DOCK EVENTS
   * ========================================================================= */
  function initNavigation() {
    // Header scrolled state
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });

    // Mobile Hamburger Toggle
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', function () {
        const isActive = mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active', isActive);
        document.body.classList.toggle('no-scroll', isActive);
      });

      mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.body.classList.remove('no-scroll');
        });
      });
    }

    // Anchor smooth scroll with offsets
    const NAV_OFFSET = 80;
    anchorLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* =========================================================================
   *  8. SPOTLIGHT GLOW EFFECT (Mouse coordinates helper)
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
   *  9. CASE STUDY MODAL INJECTION & LOGIC
   * ========================================================================= */
  const CASE_STUDIES = {
    'fedora-os': {
      title: 'Fedora AI OS',
      tagline: 'AI-Native Secure Operating System for Autonomous AI Agents',
      techStack: 'Python, LangGraph, SELinux, Podman, Linux (Fedora)',
      problem: 'Autonomous AI agents need system-level integrations to execute commands and complete complex tasks. However, executing unverified model-generated code directly on the host machine presents severe security vulnerabilities, such as unauthorized system modifications, local data deletion, or privilege breaches.',
      solution: 'Developed a robust, security-first AI operating system interface on top of Fedora Linux. The system creates individual containerized sandbox environments utilizing rootless Podman execution layers. By orchestrating workflow checkpoints via LangGraph, agents execute tasks autonomously. Customized SELinux policies enforce strict permission validation to ensure host environment containment.',
      flowchart: ['User Request', 'AI Coordinator', 'LangGraph Checkpoint', 'Rootless Podman Container', 'SELinux Enforcer', 'Fedora Linux Host'],
      features: [
        'Secure AI orchestration layer fully integrated with Fedora core structures',
        'Checkpoint-based recovery in LangGraph to resume interrupted processes autonomously',
        'Rootless Podman containers enabling absolute isolation without root exploits',
        'Custom SELinux profiles restricting low-level syscalls and critical file modifications'
      ],
      challenges: 'Configuring precise SELinux policies for rootless container runtimes proved difficult due to non-standard user namespace mappings. Resolved this by analyzing syscall auditing logs (auditd) and mapping required system actions to custom security policies, ensuring containment without breaking the agent\'s operational pipelines.'
    },
    'vigilant': {
      title: 'Vigilant — AI Civic Intelligence',
      tagline: 'AI-Powered Hyperlocal Hazard Reporting System',
      techStack: 'React, Vite, Leaflet, Gemini API',
      problem: 'Reporting infrastructure issues (potholes, hazard spots, public dump sites) in urban areas is often slow, requiring manual categorization by city management. This leads to slow repair dispatch cycles and repetitive spam submissions.',
      solution: 'Built an intelligent civic hazard reporting platform. The application uses Google\'s Gemini multimodal model to evaluate uploaded images instantly, classify hazards, evaluate severity indexes, and flag duplicates. Valid alerts are immediately mapped onto a real-time, public city map utilizing geospatial coordinates.',
      flowchart: ['User Uploads Photo', 'Gemini Vision Analyzer', 'Anti-Spam Filter', 'Severity Engine', 'Leaflet Map Dashboard', 'Alert Rendered'],
      features: [
        'Multimodal image classification identifying pothole size, waste volume, and structural severity',
        'Geospatial dashboard displaying verified city reports in real-time',
        'Anti-spam and duplicate detection filtering overlapping geographic submissions',
        'Community dashboards gamifying hazard reports and civic contributions'
      ],
      challenges: 'Handling duplicate detection in highly concentrated geographical areas. Solved this by setting up a coordinate-proximity indexing query, checking incoming report coordinates against existing alerts within a 20-meter radius, and comparing Gemini image classification signatures to group duplicates.'
    },
    'ghost-employee': {
      title: 'Ghost Employee AI',
      tagline: 'AI-Powered Workforce Analytics & Productivity Platform',
      techStack: 'React, TypeScript, Tailwind CSS, Gemini API',
      problem: 'Auditing raw employee logs (timesheets, workspace records, activity updates) manually is time-consuming for manager evaluations and fails to provide structured patterns or highlight structural bottlenecks in scaling workflows.',
      solution: 'Created an intelligent workforce analytics portal. The system ingests raw time and log structures, parsing them through Gemini model pipelines to transform unstructured activity records into structured metrics, active blocks, and automated performance summaries.',
      flowchart: ['Raw Log Input', 'Gemini Text Parser', 'Summary Generator', 'Timeline Visualizer', 'Productivity Metrics Board'],
      features: [
        'Transforming unstructured workspace logs into clean dashboard data',
        'Automated AI summaries highlighting blockages and project achievements',
        'Responsive dashboards featuring interactive timelines and active state metrics',
        'Secure enterprise handling ensuring sensitive details are redacted before API calls'
      ],
      challenges: 'Ensuring LLM accuracy in parsing complex log matrices containing non-standard time expressions. Improved this by building a zero-shot parsing schema and strict JSON validation checks to format log variables consistently before visual charting.'
    },
    'content-platform': {
      title: 'AI Content Generation Platform',
      tagline: 'Multimodal Content Creation & Creative Automation Pipeline',
      techStack: 'Gemini, Google AI Studio, Stable Diffusion XL, ComfyUI, Prompt Engineering',
      problem: 'Developing high-volume visual and narrative marketing materials manually creates brand inconsistencies, slow production turnarounds, and lack of visual templating across multiple AI gen tools.',
      solution: 'Formulated a unified, end-to-end multimodal content generation pipeline. By connecting text generation (Gemini), custom design nodes (ComfyUI / SDXL), video engines, and audio templates, users can convert a single prompt brief into consistent social ads and visual templates.',
      flowchart: ['Campaign Brief', 'Gemini Coperc', 'Stable Diffusion (Visuals)', 'ComfyUI Workflow', 'Video Synthesis Pipeline', 'Branded Deliverable'],
      features: [
        'Reusable prompt templates maintaining strict character consistency across frames',
        'Automated video overlays adding consistent voice and background elements',
        'Unified prompt interface connecting text models to specialized graphic engines',
        'Optimized pipeline configs for batch rendering visual promotional assets'
      ],
      challenges: 'Maintaining character face consistency across varying image generation queries. Solved this by utilizing ComfyUI workflows integrated with IP-Adapter controls, embedding a base facial template to bind character weights during batch generations.'
    },
    'movie-rec': {
      title: 'Movie Recommendation System',
      tagline: 'Content-Based Recommendation Engine using Machine Learning',
      techStack: 'Python, Scikit-learn, Pandas, NumPy, Streamlit',
      problem: 'Collaborative filtering systems rely on deep user logs (suffering from the cold-start issue). Content recommendation models must parse unstructured film metadata (genres, synopses, directors) to provide immediate, contextually similar matches.',
      solution: 'Engineered a text-similarity matching index. Preprocesses textual movie records, vectorizes features using TF-IDF matrices, and computes Cosine Similarity coefficients to find metadata similarities. Deployed the index inside a clean, sidebar-controlled Streamlit application.',
      flowchart: ['Raw Movie Metadata', 'Text Preprocessor', 'TF-IDF Matrix Vectorizer', 'Cosine Similarity Engine', 'Streamlit Interface'],
      features: [
        'NLP text processing parsing complex descriptions, actors, and genres',
        'Fast Cosine Similarity matrix indices providing instant similar recommendations',
        'Streamlit interface with adjustable matching threshold weights',
        'Pandas pipelines optimizing memory usage during dataset lookups'
      ],
      challenges: 'Optimizing computing speeds of the similarity matrix as the database grew. Resolved this by building localized cache headers using Streamlit\'s `@st.cache_data` and trimming descriptive vectors down to high-weight keywords.'
    }
  };

  function initCaseStudyModal() {
    if (!caseModal || !modalClose || !modalBackdrop) return;

    // Delegate project study buttons
    document.body.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-case-study');
      if (btn) {
        const projectId = btn.getAttribute('data-project');
        if (projectId && CASE_STUDIES[projectId]) {
          openCaseStudy(projectId);
        }
      }
    });

    modalClose.addEventListener('click', closeCaseStudy);
    modalBackdrop.addEventListener('click', closeCaseStudy);

    // Escape key closes modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && caseModal.classList.contains('open')) {
        closeCaseStudy();
      }
    });
  }

  function openCaseStudy(id) {
    const data = CASE_STUDIES[id];
    if (!data) return;

    // Build flowchart HTML
    let flowchartHTML = '';
    if (data.flowchart && data.flowchart.length) {
      flowchartHTML = `<div class="cs-section">
        <h4>System Architecture</h4>
        <div class="flowchart">`;
      data.flowchart.forEach((node, index) => {
        flowchartHTML += `<div class="flowchart-node">${node}</div>`;
        if (index < data.flowchart.length - 1) {
          flowchartHTML += `<div class="flowchart-arrow"><i class="ph ph-caret-right"></i></div>`;
        }
      });
      flowchartHTML += `</div></div>`;
    }

    // Build features list
    let featuresHTML = '';
    if (data.features && data.features.length) {
      featuresHTML = `<div class="cs-section">
        <h4>Key Features</h4>
        <ul class="cs-list">`;
      data.features.forEach(feat => {
        featuresHTML += `<li>${feat}</li>`;
      });
      featuresHTML += `</ul></div>`;
    }

    // Construct full body content
    const htmlContent = `
      <div class="cs-header">
        <h3 class="cs-title">${data.title}</h3>
        <p class="cs-tagline">${data.tagline}</p>
      </div>
      <div class="cs-section">
        <h4>Technology Stack</h4>
        <div class="cs-tags">
          ${data.techStack.split(',').map(tag => `<span>${tag.trim()}</span>`).join('')}
        </div>
      </div>
      <div class="cs-section">
        <h4>The Problem</h4>
        <p class="cs-text">${data.problem}</p>
      </div>
      <div class="cs-section">
        <h4>The Solution</h4>
        <p class="cs-text">${data.solution}</p>
      </div>
      ${flowchartHTML}
      ${featuresHTML}
      <div class="cs-section">
        <h4>Challenges & Learnings</h4>
        <p class="cs-text">${data.challenges}</p>
      </div>
      <div class="cs-links">
        <a href="https://github.com/JatinGargz" target="_blank" rel="noopener noreferrer"><i class="ph ph-github-logo"></i> View Repository</a>
        <a href="#" class="btn-live-demo"><i class="ph ph-globe"></i> Live Demo</a>
      </div>
    `;

    if (modalBody) {
      modalBody.innerHTML = htmlContent;
    }

    caseModal.classList.add('open');
    document.body.classList.add('no-scroll');
    if (cursorDot) {
      cursorDot.classList.remove('hover');
      cursorRing.classList.remove('hover');
    }
  }

  function closeCaseStudy() {
    caseModal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  /* =========================================================================
   *  12. LOADER CANVAS (small particle field on loader)
   * ========================================================================= */
  const loaderParticles = [];
  function startLoaderCanvas() {
    if (!loaderCanvas) return;
    const ctx = loaderCanvas.getContext('2d');
    
    function resize() {
      loaderCanvas.width = window.innerWidth;
      loaderCanvas.height = window.innerHeight;
    }
    resize();

    for (let i = 0; i < 30; i++) {
      loaderParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: Math.random() * 1.2 + 0.6
      });
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = 'rgba(0, 112, 243, 0.2)';

      for (let i = 0; i < loaderParticles.length; i++) {
        const p = loaderParticles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < loaderParticles.length; j++) {
          const p2 = loaderParticles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.strokeStyle = 'rgba(0, 112, 243, ' + (150 - dist) / 150 * 0.05 + ')';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      loaderCanvasRAF = requestAnimationFrame(draw);
    }
    draw();
  }

  function stopLoaderCanvas() {
    if (loaderCanvasRAF) {
      cancelAnimationFrame(loaderCanvasRAF);
    }
  }

  /* =========================================================================
   *  9. CONTACT FORM INTEGRATION
   * ========================================================================= */
  function initContactForm() {
    if (!contactForm) return;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fields = contactForm.querySelectorAll('[required]');
      let valid = true;

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

      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" ' +
          'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2".5 ' +
          'stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px">' +
          '<polyline points="20 6 9 17 4 12"></polyline></svg>Message Sent!';
        btn.style.backgroundColor = '#22c55e';
        btn.style.color = '#fff';
        btn.disabled = true;

        setTimeout(function () {
          btn.innerHTML = originalHTML;
          btn.style.backgroundColor = '';
          btn.style.color = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      }
    });
  }

  /* =========================================================================
   *  INITIALIZATION
   * ========================================================================= */
  function init() {
    initTheme();
    initLoader();
    initNeuralCanvas();
    initCursor();
    initScrollReveal();
    initNavigation();
    initGlowCards();
    initCaseStudyModal();
    initContactForm();

    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
      currentYearEl.textContent = new Date().getFullYear();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
