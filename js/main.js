/* ============================================
   AK247 HANDYMAN SERVICES — Main JS
   GSAP + ScrollTrigger animations
   ============================================ */

(function () {
  'use strict';

  // ---- GSAP REGISTRATION ----
  try {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  } catch (e) {
    console.warn('GSAP plugin registration failed:', e);
    killPreloader();
    return;
  }

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- PRELOADER (Safety net 2 & 3) ----
  function killPreloader() {
    var el = document.getElementById('preloader');
    if (el) {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
      setTimeout(function () { el.remove(); }, 500);
    }
  }

  // Safety net 2: kill on window load
  window.addEventListener('load', function () {
    setTimeout(killPreloader, 4000);
  });

  // Safety net 3: try/catch around all animation code
  try {
    initPreloader();
  } catch (e) {
    console.warn('Preloader animation failed:', e);
    killPreloader();
    initSite();
  }

  function initPreloader() {
    if (prefersReducedMotion) {
      killPreloader();
      initSite();
      return;
    }

    var tl = gsap.timeline({
      onComplete: function () {
        gsap.to('#preloader', {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: function () {
            killPreloader();
            initSite();
          }
        });
      }
    });

    tl.to('.preloader-logo', { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .to('.preloader-bar', { opacity: 1, duration: 0.3 }, '-=0.2')
      .to('.preloader-tagline', { opacity: 1, duration: 0.3 }, '-=0.1')
      .to('.preloader-bar-fill', { width: '100%', duration: 1.5, ease: 'power2.inOut' }, '-=0.3')
      .to({}, { duration: 0.3 });
  }

  function initSite() {
    try {
      initNavigation();
      initHeroCanvas();
      initHeroAnimations();
      initScrollAnimations();
      initCounters();
      initMagneticButtons();
      initSmoothScroll();
      initContactForm();
      initFloatingCTA();
    } catch (e) {
      console.warn('Site initialization error:', e);
    }
  }

  // ---- NAVIGATION ----
  function initNavigation() {
    var navbar = document.getElementById('navbar');
    var hamburger = document.querySelector('.nav-hamburger');
    var mobileMenu = document.querySelector('.mobile-menu');
    var mobileLinks = document.querySelectorAll('.mobile-link');

    // Scroll-based nav background
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: function (self) {
        if (self.scroll() > 80) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });

    // Hamburger toggle
    hamburger.addEventListener('click', function () {
      var isActive = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      mobileMenu.setAttribute('aria-hidden', !isActive);
      hamburger.setAttribute('aria-expanded', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';

      if (isActive && !prefersReducedMotion) {
        gsap.fromTo(mobileLinks, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out', delay: 0.1
        });
      }
    });

    // Close mobile menu on link click
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- HERO CANVAS (lightweight particle system) ----
  function initHeroCanvas() {
    if (prefersReducedMotion) return;

    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var isMobile = window.innerWidth < 768;
    var particleCount = isMobile ? 30 : 60;
    var animId;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.2,
          r: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.3 + 0.1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(138, 154, 160, ' + p.alpha + ')';
        ctx.fill();
      }

      // Draw connections (limited for performance)
      if (!isMobile) {
        ctx.strokeStyle = 'rgba(58, 124, 165, 0.04)';
        ctx.lineWidth = 0.5;
        for (var i = 0; i < particles.length; i++) {
          var conns = 0;
          for (var j = i + 1; j < particles.length && conns < 2; j++) {
            var dx = particles[i].x - particles[j].x;
            var dy = particles[i].y - particles[j].y;
            var dist = dx * dx + dy * dy;
            if (dist < 15000) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
              conns++;
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    // Pause when not in viewport
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top bottom',
      end: 'bottom top',
      onLeave: function () { cancelAnimationFrame(animId); },
      onEnterBack: function () { draw(); }
    });

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });
  }

  // ---- HERO ANIMATIONS ----
  function initHeroAnimations() {
    if (prefersReducedMotion) return;

    var tl = gsap.timeline({ delay: 0.2 });

    tl.to('.hero-badge', { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to('.hero-logo', { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }, '-=0.3')
      .to('.hero-word', {
        opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out'
      }, '-=0.5')
      .to('.hero-sub', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .to('.hero-ctas', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .to('.hero-scroll-indicator', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.1');

    // Light sweep effect
    gsap.to('.hero-headline::after', {
      left: '200%', duration: 3, ease: 'power2.inOut', delay: 2
    });

    // Parallax on hero content
    gsap.to('.hero-content', {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // Shark fins parallax
    gsap.to('.hero-fin-1', {
      y: -40, rotation: -10,
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });

    gsap.to('.hero-fin-2', {
      y: -30, rotation: 15,
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
  }

  // ---- SCROLL ANIMATIONS ----
  function initScrollAnimations() {
    if (prefersReducedMotion) return;

    // About section
    gsap.from('.about-text .section-label', {
      opacity: 0, x: -30, duration: 0.6,
      scrollTrigger: { trigger: '.about-text', start: 'top 80%' }
    });

    gsap.from('.about-text .section-title', {
      opacity: 0, x: -30, duration: 0.6,
      scrollTrigger: { trigger: '.about-text', start: 'top 75%' }
    });

    gsap.from('.about-body p', {
      opacity: 0, y: 20, stagger: 0.15, duration: 0.6,
      scrollTrigger: { trigger: '.about-body', start: 'top 80%' }
    });

    gsap.from('.value-item', {
      opacity: 0, y: 20, stagger: 0.1, duration: 0.5,
      scrollTrigger: { trigger: '.about-values', start: 'top 85%' }
    });

    gsap.from('.about-image-frame', {
      opacity: 0, x: 40, duration: 0.8,
      scrollTrigger: { trigger: '.about-visual', start: 'top 75%' }
    });

    gsap.from('.about-stat-card', {
      opacity: 0, y: 30, scale: 0.9, duration: 0.6,
      scrollTrigger: { trigger: '.about-stat-card', start: 'top 90%' }
    });

    // Services section
    gsap.from('.services .section-header', {
      opacity: 0, y: 30, duration: 0.6,
      scrollTrigger: { trigger: '.services .section-header', start: 'top 80%' }
    });

    gsap.from('.service-card', {
      opacity: 0, y: 40, stagger: 0.06, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: '.services-grid', start: 'top 85%' }
    });

    // Why Us section
    gsap.from('.why-us .section-header', {
      opacity: 0, y: 30, duration: 0.6,
      scrollTrigger: { trigger: '.why-us .section-header', start: 'top 80%' }
    });

    gsap.from('.stat-block', {
      opacity: 0, y: 30, stagger: 0.1, duration: 0.5,
      scrollTrigger: { trigger: '.stats-row', start: 'top 85%' }
    });

    gsap.from('.feature-card', {
      opacity: 0, x: -20, stagger: 0.08, duration: 0.5,
      scrollTrigger: { trigger: '.features-grid', start: 'top 85%' }
    });

    // Service areas
    gsap.from('.areas .section-header', {
      opacity: 0, y: 30, duration: 0.6,
      scrollTrigger: { trigger: '.areas .section-header', start: 'top 80%' }
    });

    gsap.from('.area-card', {
      opacity: 0, x: -20, stagger: 0.05, duration: 0.4,
      scrollTrigger: { trigger: '.areas-grid', start: 'top 85%' }
    });

    // Reviews
    gsap.from('.reviews .section-header', {
      opacity: 0, y: 30, duration: 0.6,
      scrollTrigger: { trigger: '.reviews .section-header', start: 'top 80%' }
    });

    gsap.from('.review-card', {
      opacity: 0, y: 40, stagger: 0.1, duration: 0.5,
      scrollTrigger: { trigger: '.reviews-track', start: 'top 85%' }
    });

    // Contact
    gsap.from('.contact-info', {
      opacity: 0, x: -30, duration: 0.6,
      scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }
    });

    gsap.from('.contact-form-wrap', {
      opacity: 0, x: 30, duration: 0.6,
      scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }
    });
  }

  // ---- ANIMATED COUNTERS ----
  function initCounters() {
    // About section stat
    var aboutStat = document.querySelector('.stat-number');
    if (aboutStat) {
      var target = parseInt(aboutStat.getAttribute('data-count'), 10);
      ScrollTrigger.create({
        trigger: aboutStat,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          if (prefersReducedMotion) {
            aboutStat.textContent = target;
            return;
          }
          gsap.to({ val: 0 }, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: function () { aboutStat.textContent = Math.round(this.targets()[0].val); }
          });
        }
      });
    }

    // Why Us stats
    document.querySelectorAll('.stat-num').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          if (prefersReducedMotion) {
            el.textContent = target;
            return;
          }
          gsap.to({ val: 0 }, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: function () { el.textContent = Math.round(this.targets()[0].val); }
          });
        }
      });
    });
  }

  // ---- MAGNETIC BUTTONS ----
  function initMagneticButtons() {
    if (prefersReducedMotion) return;

    document.querySelectorAll('.magnetic-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
      });

      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  // ---- SMOOTH SCROLL ----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          var offset = target.id === 'hero' ? 0 : 72;
          gsap.to(window, {
            scrollTo: { y: target, offsetY: offset },
            duration: prefersReducedMotion ? 0 : 1,
            ease: 'power3.inOut'
          });
        }
      });
    });
  }

  // ---- CONTACT FORM ----
  function initContactForm() {
    var form = document.getElementById('contact-form');
    var success = document.getElementById('form-success');
    if (!form || !success) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // If form has a real action (e.g. Formspree), let it submit
      // For now, show success message
      form.style.display = 'none';
      success.hidden = false;

      if (!prefersReducedMotion) {
        gsap.from(success, { opacity: 0, y: 20, duration: 0.5 });
      }
    });
  }

  // ---- FLOATING CTA ----
  function initFloatingCTA() {
    var cta = document.querySelector('.floating-cta');
    if (!cta) return;

    ScrollTrigger.create({
      start: 'top -400',
      onUpdate: function (self) {
        if (self.scroll() > 400) {
          gsap.to(cta, {
            opacity: 1, scale: 1,
            duration: prefersReducedMotion ? 0 : 0.4,
            ease: 'back.out(1.7)'
          });
        } else {
          gsap.to(cta, { opacity: 0, scale: 0, duration: 0.3 });
        }
      }
    });
  }

})();
