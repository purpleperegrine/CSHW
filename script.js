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
