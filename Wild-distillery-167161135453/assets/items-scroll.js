class ItemsScroll extends HTMLElement {
  items;
  scrollBar;
  scrollBarTrack;
  navigationContainer;
  navigationPrevButton;
  navigationNextButton;
  pageNavigationContainer;

  #ticking;
  #isScrollBarDragged;
  #boundItemsScroll;
  #boundPageNavigationClick;
  #itemsPerPage;
  #navigationPagesAmount;
  #itemAtScrollIndex;
  #controlsListenersEnabled;
  #boundPrevNavigationAction;
  #boundNextNavigationAction;
  #isNavigating;
  #navigationStateControlObserver;
  #itemsMutationObserver;
  #resizeObserver;
  #imageContainerRatio;

  constructor() {
    super();

    this.items = this.querySelector('[data-items]');
    this.pageNavigationContainer = null;
    this.breakpoints = {
      mob: 480,
      phab: 560,
      tab: 768,
      desk: 980,
    };
    this.breakpointMin = Object.keys(this.breakpoints).includes(
      this.getAttribute('breakpoint-min'),
    )
      ? this.breakpoints[this.getAttribute('breakpoint-min')]
      : Number(this.getAttribute('breakpoint-min') || '0');
    this.breakpointMax = Object.keys(this.breakpoints).includes(
      this.getAttribute('breakpoint-max'),
    )
      ? this.breakpoints[this.getAttribute('breakpoint-max')]
      : Number(this.getAttribute('breakpoint-max') || 'Infinity');

    this.pageNavigationWrapper = null;
    this.navigationContainer = null;
    this.navigationPrevButton = null;
    this.navigationNextButton = null;

    this.navigationCounterOnly = this.hasAttribute('mobile-counter-only');
    this.navigationCounterSeparator = '/';
    this.navigationCounterShowForPagesAmount = 7;
    this.navigationCounterShowUpToContainerSize = 768;

    this.pageNavigationDisabled = this.hasAttribute('page-navigation-disabled');
    this.snap = this.getAttribute('snap');

    this.#ticking = false;

    this.#boundItemsScroll = null;
    this.#boundPageNavigationClick = null;
    this.#boundPrevNavigationAction = null;
    this.#boundNextNavigationAction = null;

    this.#isNavigating = false;

    this.#controlsListenersEnabled = false;

    this.#navigationStateControlObserver = null;
    this.#itemsMutationObserver = null;
    this.#resizeObserver = null;
  }

  connectedCallback() {
    if (!this.items) throw Error('Items container missing');

    const debounce = (f, delay) => {
      let timer = 0;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => f.apply(this, args), delay);
      };
    };

    this.#resizeObserver = new ResizeObserver(
      debounce(() => {
        this.#updateControls();
      }),
      50,
    );

    this.#resizeObserver.observe(this.items);

    if (!this.#navigationStateControlObserver) {
      this.#setUpNavigationStateControl();
    }

    if (!this.#itemsMutationObserver) {
      this.#setUpItemsMutationObserver();
    }

    this.#imageContainerRatio = this.getAttribute('image-container-ratio');

    this.#setPageNavigationState();
  }

  disconnectedCallback() {
    if (this.#navigationStateControlObserver) {
      this.#navigationStateControlObserver.disconnect();
      this.#navigationStateControlObserver = null;
    }
    if (this.#itemsMutationObserver) {
      this.#itemsMutationObserver.disconnect();
      this.#itemsMutationObserver = null;
    }
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
  }

  #getItemAtScroll() {
    // Get item at scroll, only works when all items have equal width
    const itemsComputedStyle = window.getComputedStyle(this.items);
    const itemsGap = Number(
      itemsComputedStyle.getPropertyValue('column-gap').replace('px', ''),
    );

    const itemComputedStyle = window.getComputedStyle(
      this.items.firstElementChild,
    );
    const itemMarginLeft = Number(
      itemComputedStyle.getPropertyValue('margin-left').replace('px', ''),
    );
    const itemMarginRight = Number(
      itemComputedStyle.getPropertyValue('margin-right').replace('px', ''),
    );

    // Intersection Observer might be better, test
    const itemAtScroll = Array.from(this.items.children)[
      Math.round(
        this.items.scrollLeft /
          (itemMarginLeft +
            this.items.firstElementChild.getBoundingClientRect().width +
            itemMarginRight +
            itemsGap),
      )
    ];

    return itemAtScroll;
  }

  #handleItemsScroll() {
    if (this.pageNavigationDisabled) return;

    if (!this.#ticking) {
      window.requestAnimationFrame(() => {
        this.#setPageNavigationState();
        this.#ticking = false;
      });

      this.#ticking = true;
    }
  }

  #updatePageNavigationList() {
    if (this.pageNavigationDisabled) return;

    if (!this.pageNavigationWrapper) {
      this.pageNavigationWrapper = document.createElement('div');
      this.pageNavigationWrapper.classList.add('page-navigation-wrapper');

      this.appendChild(this.pageNavigationWrapper);
    }

    const pagesAmount = Math.ceil(
      this.items.children.length / this.#itemsPerPage,
    );

    if (pagesAmount !== this.#navigationPagesAmount) {
      this.#navigationPagesAmount = pagesAmount;

      // TODO: Add translations
      if (
        this.navigationCounterShowUpToContainerSize &&
        this.navigationCounterShowUpToContainerSize >= this.offsetWidth &&
        this.navigationCounterShowForPagesAmount &&
        (this.navigationCounterOnly ||
          this.#navigationPagesAmount >=
            this.navigationCounterShowForPagesAmount)
      ) {
        if (this.pageNavigationContainer)
          this.pageNavigationContainer.setAttribute('hidden', true);
        // Show counter
        if (!this.pageNavigationCounter) {
          this.pageNavigationCounter = document.createElement('div');
          this.pageNavigationCounter.classList.add('page-navigation-counter');

          this.pageNavigationWrapper.appendChild(this.pageNavigationCounter);
        }

        this.pageNavigationCounter.removeAttribute('hidden');

        this.pageNavigationCounter.innerHTML = `
          <span class="page-navigation-counter__current">${
            this.#itemAtScrollIndex || 1
          }</span>
          <span class="page-navigation-counter__separator">${
            this.navigationCounterSeparator
          }</span>
          <span class="page-navigation-counter__total">${
            this.#navigationPagesAmount
          }</span>
        `;

        this.#setPageNavigationState();
      } else {
        if (this.pageNavigationCounter)
          this.pageNavigationCounter.setAttribute('hidden', true);
        // Show navigation
        if (!this.pageNavigationContainer) {
          this.pageNavigationContainer = document.createElement('ul');
          this.pageNavigationContainer.classList.add('page-navigation');

          this.pageNavigationWrapper.appendChild(this.pageNavigationContainer);
        }

        this.pageNavigationContainer.removeAttribute('hidden');

        if (this.#navigationPagesAmount > 1) {
          this.pageNavigationContainer.innerHTML = `
            ${Array.from(
              { length: pagesAmount },
              (_, i) => `
              <li class="page-navigation__item" role="presentation">
                <button type="button" role="tab" class="page-navigation__button" data-page="${
                  i + 1
                }" aria-label="Scroll to page ${i + 1} of ${
                this.#navigationPagesAmount
              }" tabindex="-1">
                  <span class="visually-hidden">${i + 1}</span>
                </button>
              </li>
            `,
            ).join('\n')}
          `;

          this.#setPageNavigationState();
        } else {
          this.pageNavigationContainer.innerHTML = '';
        }
      }
    }
  }

  #handlePageNavigationClick(e) {
    const { target } = e;

    if (!target.classList.contains('page-navigation__button')) return;

    const page = Number(target.dataset.page);

    this.#moveItems(
      this.items.children[this.#itemsPerPage * (page - 1)].offsetLeft,
      'smooth',
    );
  }

  #createNavigation() {
    const navigationContainer = document.createElement('div');

    navigationContainer.classList.add('navigation');

    navigationContainer.innerHTML = `
      <button type="button" class="navigation__button navigation__button--prev" data-navigation-prev><i class="icon icon--left" aria-hidden="true"></i></button>
      <button type="button" class="navigation__button navigation__button--next" data-navigation-next><i class="icon icon--right" aria-hidden="true"></i></button>
    `;

    this.appendChild(navigationContainer);

    this.navigationContainer = navigationContainer;
    this.navigationPrevButton = navigationContainer.querySelector(
      '[data-navigation-prev]',
    );
    this.navigationNextButton = navigationContainer.querySelector(
      '[data-navigation-next]',
    );
  }

  #handlePrevNavigationAction(e) {
    e.preventDefault();

    if (this.#isNavigating) return;

    const itemAtScroll = this.#getItemAtScroll();
    const previousItem = itemAtScroll.previousElementSibling;

    if (previousItem) {
      this.#isNavigating = true;
      this.classList.add('is-scrolling');

      this.smoothScrollItems(previousItem.offsetLeft).finally(() => {
        this.#isNavigating = false;
        this.classList.remove('is-scrolling');
      });
    }
  }

  #handleNextNavigationAction(e) {
    e.preventDefault();

    if (this.#isNavigating) return;

    const itemAtScroll = this.#getItemAtScroll();
    const nextItem = itemAtScroll.nextElementSibling;

    if (nextItem) {
      this.#isNavigating = true;
      this.classList.add('is-scrolling');

      this.smoothScrollItems(nextItem.offsetLeft).finally(() => {
        this.#isNavigating = false;
        this.classList.remove('is-scrolling');
      });
    }
  }

  #enableControlsListeners() {
    if (this.#controlsListenersEnabled) return;

    this.#boundItemsScroll = this.#handleItemsScroll.bind(this);
    this.#boundPageNavigationClick = this.#handlePageNavigationClick.bind(this);
    this.#boundPrevNavigationAction =
      this.#handlePrevNavigationAction.bind(this);
    this.#boundNextNavigationAction =
      this.#handleNextNavigationAction.bind(this);

    this.items.addEventListener('scroll', this.#boundItemsScroll);
    if (this.pageNavigationContainer)
      this.pageNavigationContainer.addEventListener(
        'click',
        this.#handlePageNavigationClick.bind(this),
      );
    this.navigationPrevButton.addEventListener(
      'click',
      this.#boundPrevNavigationAction,
    );
    this.navigationNextButton.addEventListener(
      'click',
      this.#boundNextNavigationAction,
    );

    this.#controlsListenersEnabled = true;
  }

  #disableControlsListeners() {
    if (!this.#controlsListenersEnabled) return;

    this.items.removeEventListener('scroll', this.#boundItemsScroll);
    if (this.pageNavigationContainer)
      this.pageNavigationContainer.removeEventListener(
        'click',
        this.#boundPageNavigationClick,
      );
    this.navigationPrevButton.removeEventListener(
      'click',
      this.#boundPrevNavigationAction,
    );
    this.navigationNextButton.removeEventListener(
      'click',
      this.#boundNextNavigationAction,
    );

    this.#controlsListenersEnabled = false;
  }

  #updateControls() {
    const getNavigationRatio = (imageContainerRatio, itemsPerPage) => {
      const [imageContainerWidth, imageContainerHeight] = imageContainerRatio
        .split(':')
        .map((string) => Number(string));
      const gap = Number(
        window
          .getComputedStyle(this.items)
          .getPropertyValue('column-gap')
          .replace('px', '') || 0,
      );

      // Find greatest common denominator
      const findGcd = (a, b) => (b ? findGcd(b, a % b) : a);

      const gcd = findGcd(
        imageContainerHeight,
        Math.round(this.items.offsetHeight),
      );

      return `${
        (imageContainerWidth *
          itemsPerPage *
          Math.round(this.items.offsetHeight)) /
          gcd +
        (gap * (itemsPerPage - 1) * imageContainerHeight) / gcd
      } / ${
        (imageContainerHeight * Math.round(this.items.offsetHeight)) / gcd
      }`;
    };

    if (this.items.children.length > 0) {
      const itemsPerPage = Math.floor(
        this.items.offsetWidth / this.items.children[0].offsetWidth,
      );
      this.#itemsPerPage = itemsPerPage;
    }

    if (
      document.body.offsetWidth > this.breakpointMin &&
      document.body.offsetWidth <= this.breakpointMax
    ) {
      this.setAttribute('scroll-enabled', '');
    } else {
      this.removeAttribute('scroll-enabled');
    }

    if (
      this.hasAttribute('scroll-enabled') &&
      this.items.scrollWidth > this.items.offsetWidth
    ) {
      this.setAttribute('scrollable', '');

      if (!this.navigationContainer) this.#createNavigation();

      this.#updatePageNavigationList();

      if (!this.snap) {
        if (
          this.items.children.length > 0 &&
          this.items.children[0].offsetWidth > this.items.offsetWidth / 2
        ) {
          this.setAttribute('snap', 'center');
        } else {
          this.setAttribute('snap', 'start');
        }
      }

      this.#enableControlsListeners();
    } else {
      if (this.navigationContainer && this.pageNavigationContainer) {
        this.#disableControlsListeners();
      }

      this.removeAttribute('scrollable', '');
    }

    if (
      this.#imageContainerRatio &&
      this.#imageContainerRatio.toLowerCase() !== 'natural'
    ) {
      this.style.setProperty(
        '--navigation-ratio',
        getNavigationRatio(this.#imageContainerRatio, this.#itemsPerPage),
      );
    }

    if (this.items.classList.contains('grid-layout')) {
      if (this.items.children.length < this.#itemsPerPage) {
        this.items.classList.add('grid-layout--align-center');
      } else {
        this.items.classList.remove('grid-layout--align-center');
      }
    }
  }

  #setPageNavigationState() {
    if (this.pageNavigationDisabled) return;

    if (!this.#navigationPagesAmount || !this.#navigationPagesAmount > 1)
      return;

    const itemAtScroll = this.#getItemAtScroll();
    const itemAtScrollIndex = [...this.items.children].indexOf(itemAtScroll);

    // if (this.#itemAtScrollIndex === itemAtScrollIndex) return;

    this.#itemAtScrollIndex = itemAtScrollIndex;

    const currentNavigationPageIndex =
      this.#itemAtScrollIndex + this.#itemsPerPage >
      this.items.children.length - 1
        ? this.#navigationPagesAmount - 1
        : Math.floor(itemAtScrollIndex / this.#itemsPerPage);

    if (this.pageNavigationContainer) {
      if (this.pageNavigationContainer.querySelector('.is-active')) {
        this.pageNavigationContainer
          .querySelector('.is-active')
          .classList.remove('is-active');
      }

      if (this.pageNavigationContainer.children[currentNavigationPageIndex])
        this.pageNavigationContainer.children[currentNavigationPageIndex]
          .querySelector('button')
          .classList.add('is-active');
    }

    if (this.pageNavigationCounter) {
      const pageNavigationCounterCurrentElement =
        this.pageNavigationCounter.querySelector(
          '.page-navigation-counter__current',
        );

      this.pageNavigationCounter.setAttribute(
        'aria-label',
        `Page ${currentNavigationPageIndex + 1} of ${
          this.#navigationPagesAmount
        }`,
      );
      if (pageNavigationCounterCurrentElement) {
        pageNavigationCounterCurrentElement.innerHTML =
          currentNavigationPageIndex + 1;
      }
    }
  }

  #setUpItemsMutationObserver() {
    const config = {
      attributes: false,
      childList: true,
      subtree: false,
    };

    this.#itemsMutationObserver = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.#updateControls();
          this.#setUpNavigationStateControl();
        }
      });
    });

    this.#itemsMutationObserver.observe(this.items, config);
  }

  #setUpNavigationStateControl() {
    if (!this.items.firstElementChild) return;

    const options = {
      root: this.items,
      rootMargin: '0px',
      threshold: 0.75,
    };

    if (this.#navigationStateControlObserver)
      this.#navigationStateControlObserver.disconnect();

    this.#navigationStateControlObserver = new IntersectionObserver(
      (entries) => {
        if (this.navigationContainer) {
          entries.forEach(({ target, isIntersecting }) => {
            if (!target.previousElementSibling)
              this.navigationPrevButton.disabled = isIntersecting;

            if (!target.nextElementSibling)
              this.navigationNextButton.disabled = isIntersecting;
          });
        }
      },
      options,
    );

    this.#navigationStateControlObserver.observe(this.items.firstElementChild);
    this.#navigationStateControlObserver.observe(this.items.lastElementChild);
  }

  #moveItems(position, behavior = 'instant') {
    let itemsScrollX = position;
    if (itemsScrollX < 0) {
      itemsScrollX = 0;
    } else if (itemsScrollX > this.items.scrollWidth - this.items.offsetWidth) {
      itemsScrollX = this.items.scrollWidth - this.items.offsetWidth;
    }

    if (behavior === 'instant') {
      this.items.scrollTo({
        behavior: 'instant',
        left: itemsScrollX,
      });
    } else {
      this.#isNavigating = true;
      this.classList.add('is-scrolling');

      this.smoothScrollItems(itemsScrollX).finally(() => {
        this.#isNavigating = false;
        this.classList.remove('is-scrolling');
      });
    }
  }

  smoothScrollItems(position) {
    return new Promise((resolve, reject) => {
      let same = 0;
      let lastPos = null;

      const check = () => {
        const newPos = this.items.scrollLeft;

        if (this.#isScrollBarDragged) return reject(newPos);

        if (newPos === lastPos) {
          if (same++ > 2) {
            return resolve(position);
          }
        } else {
          same = 0;
          lastPos = newPos;
        }

        window.requestAnimationFrame(check);
      };

      this.items.scrollTo({
        left: position,
        behavior: 'smooth',
      });

      window.requestAnimationFrame(check);
    });
  }
}
customElements.define('items-scroll', ItemsScroll);
