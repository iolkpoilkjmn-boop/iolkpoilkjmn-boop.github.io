(() => {
  const loadSlide = (slide) => {
    if (slide.dataset.src && !slide.getAttribute('src')) slide.src = slide.dataset.src;
    if (slide.dataset.srcset && !slide.getAttribute('srcset')) slide.srcset = slide.dataset.srcset;
  };
  const initCarousels = () => document.querySelectorAll('.productCarousel').forEach((carousel) => {
    if (carousel.dataset.carouselReady === 'true') return;
    const slides = Array.from(carousel.querySelectorAll('.productSlide'));
    const controls = carousel.querySelector('.productCarouselControls');
    if (slides.length < 2 || !controls) return;
    carousel.dataset.carouselReady = 'true';
    const buttons = controls.querySelectorAll('button');
    const counter = controls.querySelector('span');
    const alt = carousel.dataset.alt || carousel.getAttribute('aria-label') || '';
    let current = 0;
    let pointerStart = null;
    let pointerLast = null;
    let wheelLocked = false;
    const show = (next, shouldLoad = true) => {
      current = (next + slides.length) % slides.length;
      if (shouldLoad) loadSlide(slides[current]);
      slides.forEach((slide, index) => {
        const active = index === current;
        slide.classList.toggle('productSlideActive', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.alt = active ? alt + '. Фото ' + (index + 1) + ' из ' + slides.length : '';
      });
      counter.textContent = (current + 1) + ' / ' + slides.length;
    };
    controls.addEventListener('pointerdown', (event) => event.stopPropagation());
    buttons[0]?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); show(current - 1); });
    buttons[1]?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); show(current + 1); });
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault();
      if (event.key === 'ArrowLeft') show(current - 1);
      if (event.key === 'ArrowRight') show(current + 1);
    });
    carousel.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('button')) return;
      pointerStart = { x: event.clientX, y: event.clientY };
      pointerLast = { x: event.clientX, y: event.clientY };
      carousel.classList.add('productCarouselDragging');
      try { carousel.setPointerCapture?.(event.pointerId); } catch {}
    });
    carousel.addEventListener('pointermove', (event) => {
      if (pointerStart) pointerLast = { x: event.clientX, y: event.clientY };
    });
    carousel.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      const distanceX = event.clientX - pointerStart.x;
      const distanceY = event.clientY - pointerStart.y;
      pointerStart = null; pointerLast = null;
      carousel.classList.remove('productCarouselDragging');
      if (Math.abs(distanceX) >= 34 && Math.abs(distanceX) > Math.abs(distanceY)) show(current + (distanceX < 0 ? 1 : -1));
    });
    carousel.addEventListener('pointercancel', () => { pointerStart = null; pointerLast = null; carousel.classList.remove('productCarouselDragging'); });
    carousel.addEventListener('lostpointercapture', () => {
      if (!pointerStart || !pointerLast) return;
      const distanceX = pointerLast.x - pointerStart.x;
      const distanceY = pointerLast.y - pointerStart.y;
      pointerStart = null; pointerLast = null;
      carousel.classList.remove('productCarouselDragging');
      if (Math.abs(distanceX) >= 34 && Math.abs(distanceX) > Math.abs(distanceY)) show(current + (distanceX < 0 ? 1 : -1));
    });
    carousel.addEventListener('wheel', (event) => {
      if (wheelLocked || Math.abs(event.deltaX) < 24 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault(); wheelLocked = true;
      show(current + (event.deltaX > 0 ? 1 : -1));
      window.setTimeout(() => { wheelLocked = false; }, 420);
    }, { passive: false });
    carousel.addEventListener('dragstart', (event) => event.preventDefault());
    show(0, false);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loadSlide(slides[current]);
        observer.disconnect();
      }, { rootMargin: '400px 0px' });
      observer.observe(carousel);
    } else {
      loadSlide(slides[current]);
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCarousels, { once: true });
  else initCarousels();
})();