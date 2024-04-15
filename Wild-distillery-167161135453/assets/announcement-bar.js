class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    const debounce = (f, delay) => {
      let timer = 0;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => f.apply(this, args), delay);
      };
    };

    this.id = this.getAttribute('id');
    this.isDismissible = this.hasAttribute('dismissible');
    this.isStatic = this.hasAttribute('static');
    this.interactions = true;
    this.autoplay = this.hasAttribute('autoplay');
    this.autoplayDelay = Number(this.getAttribute('autoplay-delay') || '5000');

    this.wrapper = this.querySelector('.announcement__bg');
    this.carouselContainer = this.querySelector('.announcement__container');
    this.carouselWrapper = this.querySelector('.announcement__wrapper');
    this.carouselSlides = this.querySelectorAll('.announcement__slides');

    this.currentSlide = 0;
    this.autoplayInterval = null;

    if (this.carouselSlides.length > 1) this.#createNavigation();

    this.intersectionObserver = new IntersectionObserver(
      this.handleIntersection.bind(this),
    );

    this.textSizeObserver = new ResizeObserver(
      debounce(() => {
        this.setMaxContainerWidth();
      }),
      50,
    );

    this.mutationObserver = new MutationObserver(() => {
      this.handleWindowResize();
    });

    if (this.isDismissible) this.#setUpDismissible();
  }

  connectedCallback() {
    this.handleWindowResize();
    window.addEventListener('resize', () => {
      this.handleWindowResize();
    });
    this.observeMutations();
    this.setAttribute('loaded', '');

    this.carouselSlides[this.currentSlide].dataset.active = true;
    if (this.autoplay) {
      this.startAutoplay();
      this.carouselContainer.addEventListener('mouseenter', () =>
        this.stopAutoplay(),
      );
      this.carouselContainer.addEventListener('mouseleave', () => {
        if (this.hasAttribute('popup-open')) return;
        this.startAutoplay();
      });
    }
    this.observeSlides();
    this.observeSlidesText();
  }

  observeMutations() {
    this.mutationObserver.observe(this.carouselWrapper, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  observeSlides() {
    this.carouselSlides.forEach((slide) => {
      this.intersectionObserver.observe(slide);
    });
  }

  observeSlidesText() {
    Array.from(this.querySelectorAll('.announcement__text')).forEach((text) => {
      this.textSizeObserver.observe(text);
    });
  }

  handleWindowResize() {
    const desktopView = window.innerWidth > 767;
    this.calculateSlidesWidth();

    if (this.isStatic) {
      if (desktopView && !this.slidesWrap) {
        this.staticDisplay = true;
      } else {
        this.staticDisplay = false;
      }
    } else {
      this.staticDisplay = false;
    }

    this.toggleClassBasedOnScreenSize();
    this.setMaxContainerWidth();
  }

  handleScroll() {
    const slideWidth = this.carouselSlides[0].getBoundingClientRect().width;
    this.currentSlide = Math.round(
      this.carouselWrapper.scrollLeft / slideWidth,
    );
    this.carouselSlides.forEach((slide, index) => {
      index === this.currentSlide
        ? (slide.dataset.active = true)
        : delete slide.dataset.active;
    });
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.carouselWrapper.addEventListener('scroll', () =>
          this.handleScroll(),
        );
      } else {
        this.carouselWrapper.removeEventListener('scroll', () =>
          this.handleScroll(),
        );
      }
    });
  }

  disconnectedCallback() {
    if (!this.staticDisplay) {
      this.stopAutoplay();

      this.carouselPrevBtn?.removeEventListener('click', this.showPrevSlide);
      this.carouselNextBtn?.removeEventListener('click', this.showNextSlide);
      this.carouselContainer.removeEventListener(
        'mouseenter',
        this.stopAutoplay,
      );
      this.carouselContainer.removeEventListener(
        'mouseleave',
        this.startAutoplay,
      );

      this.intersectionObserver.disconnect();
      this.textSizeObserver.disconnect();
    }

    this.mutationObserver.disconnect();
    window.removeEventListener('resize', this.handleWindowResize);
    this.removeAttribute('loaded');
  }

  calculateSlidesWidth() {
    this.slidesWidth = 0;
    this.containerWidth = window.innerWidth * 0.89;
    const carouselSlides = this.carouselSlides;

    carouselSlides.forEach((slide) => {
      const announcementMessage = slide.querySelector('.announcement__message');
      const announcementText = slide.querySelector('.announcement__text');
      const computedStyles = window.getComputedStyle(announcementMessage);
      const textWidth =
        announcementText.offsetWidth +
        parseFloat(computedStyles.paddingLeft) +
        parseFloat(computedStyles.paddingRight);

      this.slidesWidth += textWidth;
    });

    this.slidesWrap = this.slidesWidth > this.containerWidth;
  }

  toggleClassBasedOnScreenSize() {
    const containerClass = 'announcement__container--carousel';
    const wrapperClass = 'announcement__wrapper--carousel';
    const slideClass = 'announcement__slides--carousel';
    const showCarousel = !this.staticDisplay;

    this.carouselContainer.classList.toggle(containerClass, showCarousel);
    this.carouselWrapper.classList.toggle(wrapperClass, showCarousel);
    this.carouselSlides.forEach((slide) => {
      slide.classList.toggle(slideClass, showCarousel);
    });

    if (!this.carouselPrevBtn || !this.carouselNextBtn) return;
    this.carouselPrevBtn.toggleAttribute('hidden', !showCarousel);
    this.carouselNextBtn.toggleAttribute('hidden', !showCarousel);
  }

  setMaxContainerWidth() {
    if (this.staticDisplay) {
      this.carouselContainer.style.maxWidth = '100%';
      return;
    }

    const maxTextWidth = Math.max(
      ...Array.from(this.carouselSlides).map(
        (slide) => slide.querySelector('.announcement__text').offsetWidth,
      ),
    );
    const containerPadding = 180;
    this.carouselContainer.style.maxWidth = `${
      maxTextWidth + containerPadding
    }px`;
  }

  showPrevSlide() {
    this.currentSlide === 0
      ? this.moveToSlide(this.carouselSlides.length - 1)
      : this.moveToSlide(this.currentSlide - 1);
  }

  showNextSlide() {
    this.currentSlide === this.carouselSlides.length - 1
      ? this.moveToSlide(0)
      : this.moveToSlide(this.currentSlide + 1);
  }

  startAutoplay() {
    if (!this.interactions) return;

    if (this.autoplayInterval === null) {
      this.setAttribute('scrolling', '');
      this.autoplayInterval = setInterval(() => {
        this.showNextSlide();
      }, this.autoplayDelay);
    }
  }

  stopAutoplay() {
    if (!this.interactions) return;

    if (this.autoplayInterval !== null) {
      this.removeAttribute('scrolling');
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  moveToSlide(slideIndex, behavior = 'smooth') {
    this.carouselWrapper.scrollTo({
      left: this.carouselSlides[slideIndex].offsetLeft,
      behavior,
    });
    this.currentSlide = slideIndex;
    this.carouselSlides.forEach((slide, index) => {
      index === this.currentSlide
        ? (slide.dataset.active = true)
        : delete slide.dataset.active;
    });
  }

  moveToSlideById(slideId, behavior = 'smooth') {
    const slideToScrollTo = document.getElementById(slideId);
    if (!slideToScrollTo) return;

    const slideToScrollToIndex = [...this.carouselSlides].indexOf(
      slideToScrollTo,
    );

    if (slideToScrollToIndex > -1) {
      this.moveToSlide(slideToScrollToIndex, behavior);
    }
  }

  dismiss() {
    sessionStorage.setItem(this.id, 0);
    this.setAttribute('hidden', 'hidden');
  }

  stopInteractions() {
    this.interactions = false;
  }

  resumeInteractions() {
    this.interactions = true;
  }

  #setUpDismissible() {
    this.closeBtn = document.createElement('button');
    this.closeBtn.classList.add('announcement__close');
    this.closeBtn.setAttribute('aria-label', 'Close Announcement Bar');
    this.closeBtn.innerHTML = `<i class="icon icon--close" aria-hidden="true"></i>`;
    this.wrapper.append(this.closeBtn);
    this.closeBtn.addEventListener('click', this.dismiss.bind(this));
  }

  #createNavigation() {
    this.carouselPrevBtn = document.createElement('button');
    this.carouselPrevBtn.classList.add(
      'announcement__carousel-button',
      'carousel-prev',
    );
    this.carouselPrevBtn.setAttribute('aria-label', 'Previous Announcement');
    this.carouselPrevBtn.innerHTML = `<i class="icon icon--left" aria-hidden="true"></i>`;
    this.carouselContainer.prepend(this.carouselPrevBtn);

    this.carouselNextBtn = document.createElement('button');
    this.carouselNextBtn.classList.add(
      'announcement__carousel-button',
      'carousel-next',
    );
    this.carouselNextBtn.setAttribute('aria-label', 'Next Announcement');
    this.carouselNextBtn.innerHTML = `<i class="icon icon--right" aria-hidden="true"></i>`;
    this.carouselContainer.append(this.carouselNextBtn);

    this.carouselPrevBtn.addEventListener('click', () => this.showPrevSlide());
    this.carouselNextBtn.addEventListener('click', () => this.showNextSlide());
  }
}

customElements.define('announcement-bar', AnnouncementBar);
