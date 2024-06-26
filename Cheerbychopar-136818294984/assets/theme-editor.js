window.addEventListener('load', () => {

  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target;

    if (typeof CartDrawer !== 'undefined') {
      new CartDrawer();
    }
    if (section.classList.contains('product-section')) {
      window.dispatchEvent(new Event('resize'));
    }
  });
});