class BackToTopButton extends HTMLElement {
  constructor() {
    super();
    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
  }

  connectedCallback() {
    window.addEventListener('scroll', this.toggleVisibility);
    window.addEventListener('resize', this.toggleVisibility);
    window.addEventListener('touchmove', this.toggleVisibility);
    this.addEventListener('click', this.scrollToTop);

    this.toggleVisibility();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.toggleVisibility);
    window.removeEventListener('resize', this.toggleVisibility);
    window.removeEventListener('touchmove', this.toggleVisibility);
    this.removeEventListener('click', this.scrollToTop);
  }

  toggleVisibility() {
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;

    const isScrolledPastViewport = scrollY > innerHeight;

    if (isScrolledPastViewport) {
      this.classList.add('visible');
      this.classList.remove('hidden');
    } else {
      this.classList.remove('visible');
      this.classList.add('hidden');
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}

customElements.define('back-to-top-button', BackToTopButton);
