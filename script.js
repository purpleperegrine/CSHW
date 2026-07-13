// ===== Dynamic copyright year =====
    document.getElementById('copyright').textContent =
      `© ${new Date().getFullYear()} Clean Slate Home Wash. All rights reserved.`;

    // ===== Navbar scroll =====
    const navbar = document.getElementById('navbar');
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });

    // ===== Floating bubbles =====
    const bubbleContainer = document.getElementById('bubbles');
    for (let i = 0; i < 22; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = Math.random() * 14 + 4;
      b.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        animation-duration:${Math.random() * 14 + 8}s;
        animation-delay:${Math.random() * 12}s;
        opacity:${Math.random() * 0.45 + 0.1};
      `;
      bubbleContainer.appendChild(b);
    }

    // ===== Scroll reveal =====
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // ===== Before/After Sliders =====
    const sliders = document.querySelectorAll('.slider-wrapper');
    sliders.forEach(wrapper => {
      const input = wrapper.querySelector('.slider-input');
      input.addEventListener('input', (e) => {
        wrapper.style.setProperty('--position', `${e.target.value}%`);
      });
    });

    // ===== Before/After Showcase Carousel =====
    const slidesContainer = document.getElementById('carouselSlides');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dots = document.querySelectorAll('.carousel-dot');
    let activeSlideIndex = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
      slidesContainer.style.transform = `translateX(-${activeSlideIndex * 100}%)`;
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeSlideIndex);
      });
    }

    function showNextSlide() {
      activeSlideIndex = (activeSlideIndex + 1) % totalSlides;
      updateCarousel();
    }

    function showPrevSlide() {
      activeSlideIndex = (activeSlideIndex - 1 + totalSlides) % totalSlides;
      updateCarousel();
    }

    nextBtn.addEventListener('click', () => {
      showNextSlide();
      resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
      showPrevSlide();
      resetAutoplay();
    });

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        activeSlideIndex = parseInt(e.target.getAttribute('data-index'), 10);
        updateCarousel();
        resetAutoplay();
      });
    });

    // Autoplay carousel every 8 seconds (allows users time to interact with slider)
    let autoplayInterval = setInterval(showNextSlide, 8000);

    function resetAutoplay() {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(showNextSlide, 8000);
    }

    // Touch Swipe Support for mobile carousel
    let startX = 0;
    let isSwiping = false;

    slidesContainer.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('slider-input')) return;
      startX = e.touches[0].clientX;
      isSwiping = true;
    }, { passive: true });

    slidesContainer.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      const diffX = e.touches[0].clientX - startX;
      
      // Threshold for swipe gesture
      if (Math.abs(diffX) > 60) {
        if (diffX > 0) {
          showPrevSlide();
        } else {
          showNextSlide();
        }
        isSwiping = false;
        resetAutoplay();
      }
    }, { passive: true });

    slidesContainer.addEventListener('touchend', () => {
      isSwiping = false;
    });

    // ===== Form submit =====
    const form = document.getElementById('quoteForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
        .then(async (response) => {
          let resJson = await response.json();
          if (response.status == 200) {
            btn.textContent = '✓ Request Received! Jake will be in touch soon.';
            btn.style.background = 'linear-gradient(135deg, #059669, #047857)';
            btn.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.4)';
            form.reset();
          } else {
            console.error(resJson);
            btn.textContent = resJson.message || 'Something went wrong. Please try again.';
            btn.disabled = false;
            setTimeout(() => { btn.textContent = originalText; }, 4000);
          }
        })
        .catch(error => {
          console.error(error);
          btn.textContent = 'Something went wrong. Please try again.';
          btn.disabled = false;
          setTimeout(() => { btn.textContent = originalText; }, 4000);
        });
    });

    // ===== Smooth anchor scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  </script>
<script>
(() => {
  'use strict';

  // Respect reduced motion: glow stays static at its neutral position.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll('.why-card');
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // current (lerped) vs target values
  let x = 0, y = 0;       // what's painted
  let tx = 0, ty = 0;     // where input wants it
  let base = null;        // baseline holding angle (phone)
  let running = false;

  const SENSITIVITY = 30;   // degrees of tilt for full sweep. Lower = twitchier.
  const SMOOTHING  = 0.08;  // lerp factor per frame. Lower = floatier.
  const RECENTER   = 0.005; // baseline drift per event. 0 = hold-a-tilt stays put.

  function loop() {
    x += (tx - x) * SMOOTHING;
    y += (ty - y) * SMOOTHING;

    // One shared light point, in viewport pixels.
    // 0.5 = light rests at viewport center; 0.35 would bias it left.
    const lightX = (0.5 + x * 0.5) * innerWidth;
    const lightY = (0.5 + y * 0.5) * innerHeight;

    // Read all layouts first, then write — avoids interleaved reflow.
    const rects = [...cards].map(c => c.getBoundingClientRect());
    cards.forEach((card, i) => {
      card.style.setProperty('--lx', (lightX - rects[i].left).toFixed(1));
      card.style.setProperty('--ly', (lightY - rects[i].top).toFixed(1));
    });

    requestAnimationFrame(loop);
  }
  function start() {
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  /* ---------- phone: gyroscope ---------- */
  function onOrient(e) {
    if (e.gamma === null || e.beta === null) return; // no sensor data
    if (base === null) base = { g: e.gamma, b: e.beta };

    // Slowly re-center on the current holding angle so the glow
    // drifts home after a sustained tilt (~2s half-life).
    base.g += (e.gamma - base.g) * RECENTER;
    base.b += (e.beta  - base.b) * RECENTER;

    tx = clamp((e.gamma - base.g) / SENSITIVITY, -1, 1);
    ty = clamp((e.beta  - base.b) / SENSITIVITY, -1, 1);
  }

  function startOrientation() {
    addEventListener('deviceorientation', onOrient);
    // Portrait/landscape flip swaps the axes — cheapest fix is a re-baseline.
    addEventListener('orientationchange', () => { base = null; });
    start();
  }

  function initMotion() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+: permission prompt must come from a user gesture.
      // Piggyback on the first tap anywhere on the page.
      const ask = () => {
        removeEventListener('click', ask);
        DeviceOrientationEvent.requestPermission()
          .then(s => { if (s === 'granted') startOrientation(); })
          .catch(() => {}); // denied → effect just stays off
      };
      addEventListener('click', ask);
    } else {
      startOrientation(); // Android / others: no permission needed (HTTPS required)
    }
  }

  /* ---------- desktop: mouse drives the same two variables ---------- */
  function onMouse(e) {
    tx = (e.clientX / innerWidth)  * 2 - 1;
    ty = (e.clientY / innerHeight) * 2 - 1;
  }

  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('mousemove', onMouse, { passive: true });
    start();
  } else {
    initMotion();
  }
})();