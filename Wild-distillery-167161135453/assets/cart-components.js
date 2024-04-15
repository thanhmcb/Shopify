class InteractiveCart extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const debounce = (f, delay) => {
      let timer = 0;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => f.apply(this, args), delay);
      };
    };

    this.id = this.getAttribute('id');
    this.form = this.querySelector('form');
    this.cart = window.theme.cart.store.getState().products;
    this.freeShippingBar = this.querySelector('free-shipping-bar');

    this._cartDraw = this.closest('.cart-draw');
    this._controlHeightAtValue = null;
    this._resizeObserver = null;
    if (this.getAttribute('height-control') && this._cartDraw) {
      this._controlHeightAtValue = Number(this.getAttribute('height-control'));
      this._resizeObserver = new ResizeObserver(
        debounce(this._onResize.bind(this), 100),
      );

      this._resizeObserver.observe(this._cartDraw);
    }

    this._render();

    this.unsubscribe = window.theme.cart.store.subscribe((state, prevState) => {
      this.cart = state.products;
      this._render();

      this._updateCartDiscounts();
      this._updateCartTotal();
      this._updateFreeShipping();
    });
  }

  disconnectedCallback() {
    this.unsubscribe();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  _onResize(entries) {
    entries.forEach(() => {
      const parentElement = this.parentElement;
      const parentElementComputedStyle = window.getComputedStyle(parentElement);
      const gap = Number(
        parentElementComputedStyle
          .getPropertyValue('row-gap')
          .replace('px', ''),
      );
      const parentElementTopPadding = Number(
        parentElementComputedStyle
          .getPropertyValue('padding-top')
          .replace('px', ''),
      );
      const siblingElements = Array.from(
        this.parentElement.querySelectorAll(
          '.cart-draw__announcement, .cart-draw__head, .free-shipping-bar',
        ),
      );
      const cartControls = this.querySelector('.cart__controls');

      if (!cartControls) return;

      const blockedHeight =
        parentElementTopPadding +
        siblingElements.reduce(
          (total, element) => total + element.offsetHeight + gap,
          0,
        ) +
        cartControls.offsetHeight;

      this._cartDraw.classList.toggle(
        'is-scrollable',
        this._controlHeightAtValue > window.innerHeight - blockedHeight,
      );
    });
  }

  _render() {
    if (this.cart.item_count > 0) {
      this._renderCart();
    } else {
      this._renderEmptyCart();
    }
  }

  _renderCart() {
    if (this.querySelector('cart-full')) return;

    const cartTemplate = document.getElementById('template-cart').content;
    const cartFragment = cartTemplate.cloneNode(true);
    const cartNote = cartFragment.querySelector('cart-note');

    const emptyCart = this.querySelector('cart-empty');

    if (emptyCart) {
      emptyCart.remove();
    }

    this.appendChild(cartFragment);

    if (cartNote) {
      // cartNote.value = this.cart.note;
      cartNote.querySelector('cart-textarea').value = this.cart.note;
    }
    this._updateCartDiscounts();
    this._updateCartTotal();
  }

  _renderEmptyCart() {
    if (this.querySelector('cart-empty')) return;

    const cartEmptyTemplate = document.getElementById(
      'template-empty-cart',
    ).content;
    const cartEmptyFragment = cartEmptyTemplate.cloneNode(true);

    const cartFull = this.querySelector('cart-full');

    if (cartFull) {
      cartFull.remove();
    }

    this.appendChild(cartEmptyFragment);
  }

  _updateFreeShipping() {
    if (!this.freeShippingBar) return;

    this.freeShippingBar.setAttribute('value', this.cart.total_price);
  }

  _updateCartTotal() {
    const cartTotal = this.querySelector('cart-total');
    if (!cartTotal) return;

    cartTotal.innerHTML = window.Shopify.formatMoney(
      this.cart.total_price,
      window.theme.money_total_price_format,
    );
  }

  _updateCartDiscounts() {
    const discountsContainer = this.querySelector('cart-discounts');
    if (!discountsContainer) return;

    const discounts = discountsContainer.querySelector('discount-list');
    // Liquid-rendered cart discount data differs from the one gotten via AJAX
    const discountApplications = this.cart.cart_level_discount_applications;
    const discountItems =
      discountApplications.length > 0 &&
      discountApplications[0].hasOwnProperty('discount_application')
        ? discountApplications.reduce(
            (
              items,
              {
                discount_application: {
                  key,
                  title,
                  total_allocated_amount: amount,
                },
              },
            ) => {
              const sameKeyItemIndex = items.findIndex((i) => i.key === key);

              if (sameKeyItemIndex > -1) {
                items[sameKeyItemIndex].amount += amount;
                return items;
              }

              items.push({
                key,
                title,
                amount,
              });

              return items;
            },
            [],
          )
        : discountApplications.reduce(
            (items, { key, title, total_allocated_amount: amount }) => {
              items.push({
                key,
                title,
                amount,
              });

              return items;
            },
            [],
          );

    this.classList.toggle('has-cart-discounts', discountItems.length);

    const discountItemsString = JSON.stringify(discountItems);
    discounts.setAttribute('items', discountItemsString);
  }
}
customElements.define('interactive-cart', InteractiveCart);

class CartItems extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.items = Array.from(this.querySelectorAll('cart-item'));
    this.giftWrappingProductId = this.getAttribute('gift-wrapping-product-id');

    this.unsubscribe = window.theme.cart.store.subscribe((state) => {
      this.items = this.items.reduce((newItems, item) => {
        const key = item.getAttribute('key');
        const itemInCart = state.products.items.find((i) => i.key === key);

        if (!itemInCart) {
          item.remove();
          return newItems;
        }

        newItems.push(item);
        return newItems;
      }, []);

      const currentItemsKeys = this.items.map((item) => item.key);
      const newItems = [];
      state.products.items.forEach((item, i) => {
        if (!currentItemsKeys.includes(item.key)) {
          const newCartItem = this._createCartItem(item);
          if (i === 0) {
            this.prepend(newCartItem);
          } else {
            newItems[i - 1].after(newCartItem);
          }
          newItems.push(newCartItem);
        } else {
          const oldItem = this.items.find((i) => i.key === item.key);
          if (currentItemsKeys.indexOf(oldItem.key) !== i) {
            if (i === 0) {
              this.prepend(oldItem);
            } else {
              newItems[i - 1].after(oldItem);
            }
          }
          newItems.push(oldItem);
        }
      });
      this.items = newItems;
    });
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  _createCartItem(item) {
    const cartItemTemplate =
      document.getElementById('template-cart-item').content;
    const cartItemFragment = cartItemTemplate.cloneNode(true);
    const cartItem = cartItemFragment.querySelector('cart-item');
    cartItem.setAttribute('key', item.key);
    return cartItem;
  }
}
customElements.define('cart-items', CartItems);

class CartItem extends HTMLElement {
  constructor() {
    super();

    // TODO: Make debounce standalone module
    const debounce = (f, delay) => {
      let timer = 0;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => f.apply(this, args), delay);
      };
    };

    this._debouncedChangeQuantity = debounce(
      this._changeQuantity.bind(this),
      250,
    );
    this._boundRemoveProduct = this._removeProduct.bind(this);
  }

  connectedCallback() {
    this.key = this.getAttribute('key');
    this.item = window.theme.cart.store
      .getState()
      .products.items.find((item) => item.key === this.key);

    if (!this.item) return;

    if (
      this.item.variant_id ===
      window.theme.cart.store.getState().giftWrapping.productId
    ) {
      this.giftWrappingItem = true;
      this.noQuantityInput = true;
      this.noLinks = true;
      this.giftWrappingMessageEnabled =
        window.theme.cart.store.getState().giftWrapping.giftMessageEnabled;
      this.giftWrappingMessage =
        window.theme.cart.store.getState().products.attributes[
          'gift-wrapping-message'
        ] || '';
    }

    this.image = this.querySelector('cart-item-image-container img');
    this.imageContainerRatio = this.getAttribute(
      'image-container-ratio',
    ).trim();
    this.imageFit = this.hasAttribute('image-fit');

    this.details = this.querySelector('cart-item-details');

    this._isRendered = this.hasAttribute('rendered');

    if (!this._isRendered) {
      this._render();
    }

    this.quantity = this.querySelector('quantity-input');
    this.removeItemButton = this.querySelector('[cart-item-remove');

    setTimeout(() => {
      if (this.quantity)
        this.quantity.addEventListener('update', this._debouncedChangeQuantity);
      if (this.removeItemButton)
        this.removeItemButton.addEventListener(
          'click',
          this._boundRemoveProduct,
        );
    });

    this.unsubscribe = window.theme.cart.store.subscribe((state, prevState) => {
      if (state.lineItemsBeingUpdated.length > 0) {
        this._renderError();
      }

      if (state.lineItemsBeingUpdated.includes(this.key)) {
        this._toggleSpinner(true);
      } else {
        const newItem = state.products.items.find(
          (item) => item.key === this.key,
        );

        if (newItem && prevState.lineItemsBeingUpdated.includes(this.key)) {
          this._toggleSpinner(false);
        }

        if (!state.lineItemsBeingUpdated.includes(this.key)) {
          if (this.quantity && this.quantity.value !== newItem.quantity) {
            this.quantity.value = newItem.quantity;
          } else {
            const quantityDisplay = this.querySelector('quantity-display');

            if (quantityDisplay) {
              quantityDisplay.innerHTML = newItem.quantity;
            }
          }
        }

        this.item = newItem;

        this._clearTotalPrice();
        this._renderTotalPriceAndDiscounts();
      }
    });
  }

  disconnectedCallback() {
    this.unsubscribe();

    if (this.quantity)
      this.quantity.removeEventListener(
        'update',
        this._debouncedChangeQuantity,
      );

    if (this.removeItemButton)
      this.removeItemButton.removeEventListener(
        'click',
        this._boundRemoveProduct,
      );
  }

  _render() {
    this.querySelectorAll('a[cart-item-url]').forEach((link) => {
      if (this.noLinks) {
        const div = document.createElement('div');
        if (link.hasAttribute('class')) {
          div.setAttribute('class', link.getAttribute('class'));
        }
        if (link.hasAttribute('style')) {
          div.setAttribute('style', link.getAttribute('style'));
        }
        div.innerHTML = link.innerHTML;
        link.replaceWith(div);
        this.image = this.querySelector('cart-item-image-container img');
      } else {
        link.href = this.item.url;
      }
    });

    this._setImage();

    if (this.imageContainerRatio === 'natural') {
      this.image.closest('.o-ratio').style.paddingBottom = `${
        (1 /
          (this.item.featured_image
            ? this.item.featured_image.aspect_ratio
            : 1)) *
        100
      }%`;
    } else {
      this.image.closest('.o-ratio').style.paddingBottom = null;
    }

    this._updateSkeleton();

    this.querySelector('cart-item-title').innerHTML = this.item.product_title;

    const metaItemTemplate = document.getElementById(
      'template-cart-item-meta',
    ).content;

    const vendor = this.querySelector('cart-item-vendor');
    if (vendor) {
      vendor.appendChild(metaItemTemplate.cloneNode(true));
      vendor.querySelector('property-value').innerHTML = this.item.vendor;
    }

    if (
      this.item.variant_title &&
      !this.item.variant_title.includes('Default')
    ) {
      const defaultProperty = this.querySelector('cart-item-default-property');
      defaultProperty.appendChild(metaItemTemplate.cloneNode(true));
      defaultProperty.querySelector('property-value').innerHTML =
        this.item.variant_title;
    }

    if (Object.keys(this.item.properties).length > 0) {
      const propertyItemTemplate = document.getElementById(
        'template-cart-item-property',
      ).content;
      const properties = this.querySelector('cart-item-properties');
      Object.entries(this.item.properties).forEach(([name, value]) => {
        if (value !== '' && name.slice(0, 1) !== '_') {
          const propertyTemplate = propertyItemTemplate.cloneNode(true);
          propertyTemplate.querySelector('property-name').innerHTML = name;
          propertyTemplate.querySelector('property-value').innerHTML =
            value.includes('/uploads/')
              ? `<a href="${value}">${value.split('/').pop()}</a>`
              : value;
          properties.appendChild(propertyTemplate);
        }
      });
    }

    if (this.item.selling_plan_allocation) {
      const sellingPlanAllocation = this.querySelector(
        'cart-item-selling-plan-allocation',
      );
      sellingPlanAllocation.appendChild(metaItemTemplate.cloneNode(true));

      sellingPlanAllocation.querySelector('property-value').innerHTML = `${
        this.item.selling_plan_allocation.selling_plan.name
      }${
        this.item.selling_plan_allocation.compare_at_price &&
        this.item.selling_plan_allocation.compare_at_price !==
          this.item.selling_plan_allocation.price
          ? ` (-${Math.round(
              (1 -
                this.item.selling_plan_allocation.price /
                  this.item.selling_plan_allocation.compare_at_price) *
                100,
            )}%)`
          : ''
      }`;
    }

    const sku = this.querySelector('cart-item-sku');
    if (sku && this.item.sku) {
      sku.appendChild(metaItemTemplate.cloneNode(true));
      sku.querySelector('property-value').innerHTML = this.item.sku;
    }

    if (this.item.unit_price_measurement) {
      const itemUnitPrice = this.querySelector('cart-item-unit-price');
      const unitPriceTemplate = document.getElementById(
        'template-unit-price',
      ).content;
      itemUnitPrice.appendChild(unitPriceTemplate.cloneNode(true));

      const baseUnit = `${
        this.item.unit_price_measurement.reference_value !== 1
          ? this.item.unit_price_measurement.reference_value
          : ''
      }${this.item.unit_price_measurement.reference_unit}`;

      itemUnitPrice.querySelector('unit-price').innerHTML =
        window.Shopify.formatMoney(
          this.item.unit_price,
          window.theme.money_format,
        );
      itemUnitPrice.querySelector('base-unit').innerHTML = baseUnit;
    }

    if (this.giftWrappingItem && this.giftWrappingMessageEnabled) {
      const giftWrappingMessageTemplate = document.getElementById(
        'template-cart-gift-wrapping-message',
      ).content;
      this.querySelector('cart-item-micro-copy').appendChild(
        giftWrappingMessageTemplate.cloneNode(true),
      );

      this.classList.add('cart-item--full-details');

      this.querySelector('cart-textarea').value = this.giftWrappingMessage;
    }

    if (this.noQuantityInput) {
      const quantityDisplay = document.createElement('quantity-display');
      quantityDisplay.classList.add('cart-item__qty-display');
      quantityDisplay.innerHTML = this.item.quantity;
      this.querySelector('cart-item-quantity').appendChild(quantityDisplay);
    } else {
      const quantityInputTemplate = document.getElementById(
        'template-quantity-input',
      ).content;
      const quantityElement = quantityInputTemplate.cloneNode(true);
      this.quantity = quantityElement.querySelector('quantity-input');
      const quantityInput = quantityElement.querySelector(
        'input[type="number"]',
      );
      quantityInput.setAttribute('id', `updates_${this.item.key}`);
      quantityInput.setAttribute('name', `updates[]`);
      this.querySelector('cart-item-quantity').appendChild(this.quantity);

      setTimeout(() => {
        this.quantity.value = this.item.quantity;
      });

      this.removeItemButton = this.querySelector('button[cart-item-remove]');
    }

    this._renderTotalPriceAndDiscounts();

    this.setAttribute('rendered', '');
  }

  // _setImage(url, width, height, alt = '', srcsetWidths = [120, 240, 360, 480]) {
  _setImage(srcsetWidths = [120, 240, 360, 480]) {
    if (!this.image) return;

    const imageData = this.item.featured_image;

    if (imageData && imageData.url) {
      const { width, height, url } = imageData;

      const imageContainerRatio =
        this.imageContainerRatio !== 'natural'
          ? this.imageContainerRatio
              .split(':')
              .reduce(
                (ratio, value) => (ratio !== 0 ? value / ratio : value),
                0,
              )
          : null;
      const aspectRatio = width / height;
      const uncroppedImage =
        this.imageContainerRatio === 'natural' ||
        (imageContainerRatio && this.imageFit);

      let masterWidth = width;
      let masterHeight = height;

      if (!uncroppedImage) {
        masterHeight = Math.round(masterWidth * imageContainerRatio);

        if (masterHeight > height) {
          masterHeight = height;
          masterWidth = Math.round(masterHeight / imageContainerRatio);
        }
      }

      const srcset = srcsetWidths.reduce((srcset, srcWidth) => {
        const srcHeight = Math.round(
          uncroppedImage
            ? srcWidth / aspectRatio
            : srcWidth * imageContainerRatio,
        );

        if (srcWidth > masterWidth || srcHeight > masterHeight) return srcset;

        return `${srcset}${url}${
          url.includes('?') ? '&' : '?'
        }width=${srcWidth}${
          !uncroppedImage ? `&height=${srcHeight}&crop=center` : ''
        } ${srcWidth}w ${srcHeight}h, `;
      }, '');

      const masterSrc = !uncroppedImage
        ? `${url}${
            url.includes('?') ? '&' : '?'
          }width=${masterWidth}&height=${masterHeight}&crop=center`
        : url;

      this.image.setAttribute('src', masterSrc);
      this.image.setAttribute('srcset', srcset);
      this.image.setAttribute('width', masterWidth);
      this.image.setAttribute('height', masterHeight);
    }

    this.image.setAttribute('alt', `Image for ${this.item.title}`);
  }

  _updateSkeleton() {
    if (!this.image) return;

    const skeleton =
      this.image.nextElementSibling &&
      this.image.nextElementSibling.tagName.toLowerCase() === 'image-skeleton'
        ? this.image.nextElementSibling
        : null;

    if (skeleton) {
      const svg = skeleton.querySelector('svg');
      const rect = svg.querySelector('rect');
      const width = this.image.getAttribute('width');
      const height = this.image.getAttribute('height');
      skeleton.setAttribute(
        'aria-label',
        `Loading image for ${this.item.title}`,
      );
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      rect.setAttribute('width', width);
      rect.setAttribute('height', height);
    }
  }

  _toggleSpinner(visible = true) {
    if (visible) {
      this._clearTotalPrice();

      const quantityInputTemplate =
        document.getElementById('template-spinner').content;
      this.querySelector('cart-item-spinner').appendChild(
        quantityInputTemplate.cloneNode(true),
      );
    } else {
      this.querySelector('cart-item-spinner').innerHTML = '';
    }
  }

  _clearTotalPrice() {
    const priceContainer = this.querySelector(
      'cart-item-original-line-price',
    ).parentElement;

    if (priceContainer) {
      const priceContainerWidth = priceContainer.offsetWidth;
      const priceContainerHeight = priceContainer.offsetHeight;
      priceContainer.style.width = `${priceContainerWidth}px`;
      priceContainer.style.height = `${priceContainerHeight}px`;
    }

    this.querySelector('cart-item-original-line-price').innerHTML = '';
    this.querySelector('cart-item-final-line-price').innerHTML = '';
    // this.querySelector('cart-item-discounts').setAttribute('hidden', '');
  }

  _renderTotalPriceAndDiscounts() {
    const originalLinePrice = this.querySelector(
      'cart-item-original-line-price',
    );
    const finalLinePrice = this.querySelector('cart-item-final-line-price');
    const priceTemplate = document.getElementById('template-price').content;

    if (this.item.original_line_price !== this.item.final_line_price) {
      originalLinePrice.appendChild(priceTemplate.cloneNode(true));
      originalLinePrice
        .querySelector('.price')
        .classList.add('price--original');
      originalLinePrice.querySelector('money-amount').innerHTML =
        window.Shopify.formatMoney(
          this.item.original_line_price,
          window.theme.money_format,
        );
      finalLinePrice.appendChild(priceTemplate.cloneNode(true));
      finalLinePrice.querySelector('.price').classList.add('price--sale');
      finalLinePrice.querySelector('money-amount').innerHTML =
        window.Shopify.formatMoney(
          this.item.final_line_price,
          window.theme.money_format,
        );
    } else {
      originalLinePrice.appendChild(priceTemplate.cloneNode(true));
      originalLinePrice.querySelector('money-amount').innerHTML =
        window.Shopify.formatMoney(
          this.item.final_line_price,
          window.theme.money_format,
        );
    }

    const discountsContainer = this.querySelector('cart-item-discounts');
    const discounts = discountsContainer.querySelector('discount-list');
    const discountItems = JSON.stringify(
      this.item.line_level_discount_allocations.reduce(
        (items, { amount, discount_application: { key, title } }) => {
          items.push({
            key,
            title,
            amount,
          });

          return items;
        },
        [],
      ),
    );
    discounts.setAttribute('items', discountItems);
    // discountsContainer.removeAttribute('hidden');

    this.classList.toggle(
      'has-discounts',
      this.item.line_level_discount_allocations.length > 0,
    );

    const priceContainer = this.querySelector(
      'cart-item-original-line-price',
    ).parentElement;

    if (priceContainer) {
      priceContainer.style.width = '';
      priceContainer.style.height = '';
    }
  }

  _renderError(errorText = '') {
    const errorContainer = this.querySelector('cart-item-errors');

    this.classList.toggle('has-errors', errorText);
    errorContainer.innerHTML = `<div class="errors qty-error u-small">${errorText}</div>`;
  }

  async _changeQuantity() {
    if (!this.key) return;

    try {
      await window.theme.cart.store
        .getState()
        .change(this.key, this.quantity.value);
    } catch (e) {
      if (e.name && e.name === 'AbortError') return;
      this._renderError(e.message);
    }
  }

  async _removeProduct(e) {
    if (!this.key) return;

    e.preventDefault();

    if (this.giftWrappingItem) {
      await window.theme.cart.store.getState().setGiftWrapping(false);
    } else {
      await window.theme.cart.store.getState().change(this.key, 0);
    }
  }
}
customElements.define('cart-item', CartItem);

class DiscountList extends HTMLElement {
  constructor() {
    super();

    // [{key: 'unique discount key', title: 'discount title', amount: 'discount amount'}]
    this.items = JSON.parse(this.getAttribute('items') || '[]');
  }

  static get observedAttributes() {
    return ['items'];
  }

  attributeChangedCallback(_, oldVal, newVal) {
    if (oldVal !== newVal) {
      this.items = JSON.parse(newVal);
      this._renderDiscounts();
    }
  }

  _renderDiscounts() {
    this.innerHTML = '';
    if (this.items.length > 0) {
      const discountsList = document.createElement('ul');
      discountsList.classList.add('discounts');
      this.appendChild(discountsList);

      this.items.forEach((item) => {
        const discount = document.createElement('li');
        discount.classList.add('discount');
        discountsList.appendChild(discount);
        const discountTemplate = document.getElementById(
          'template-discount-item',
        ).content;
        discount.appendChild(discountTemplate.cloneNode(true));
        discount.querySelector('discount-title').innerHTML = item.title;
        if (item.amount > 0) {
          discount.querySelector('discount-amount').innerHTML =
            window.Shopify.formatMoney(item.amount, window.theme.money_format);
        }
      });
    }
  }
}
customElements.define('discount-list', DiscountList);

class CartTextarea extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    this._text = this.querySelector('textarea');
    this._status = this.querySelector('cart-textarea-status');

    this._updatedHTML = '<div class="is-saved">&checkmark;</div>';

    this._updating = false;
    this._updated = false;

    this._spinnerTemplate = document.getElementById('template-spinner').content;

    this._function = () => {};

    this._text.addEventListener('input', this._function);
  }

  disconnectedCallback() {
    this._text.removeEventListener('input', this._function);
  }

  set updating(isUpdating) {
    this._updated = false;
    this._updating = isUpdating;
    if (isUpdating) {
      this._status.innerHTML = '';
      this._status.appendChild(this._spinnerTemplate.cloneNode(true));
    }
  }

  get updating() {
    return this._updating;
  }

  set updated(isUpdated) {
    this._updating = false;
    this._updated = isUpdated;
    if (isUpdated) {
      this._status.innerHTML = this._updatedHTML;
    }
  }

  get updated() {
    return this._updated;
  }

  set value(value) {
    this._text.value = value;
  }

  get value() {
    return this._text.value;
  }

  set updatedHTML(html) {
    this._updatedHTML = html;
  }

  get updatedHTML() {
    return this._updatedHTML;
  }

  set function(f) {
    const debounce = (f, delay) => {
      let timer = 0;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => f.apply(this, args), delay);
      };
    };

    this._text.removeEventListener('input', this._function);

    this._function = debounce(f, 1000);

    this._text.addEventListener('input', this._function);
  }

  get function() {
    return this._function;
  }
}
customElements.define('cart-textarea', CartTextarea);

class CartGiftWrappingMessage extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    this._cartTextarea = this.querySelector('cart-textarea');

    setTimeout(() => {
      this._cartTextarea.function = this._updateMessage.bind(this);
    });

    this.unsubscribe = window.theme.cart.store.subscribe((state, prevState) => {
      if (state.giftWrapping.messageBeingUpdated) {
        this._cartTextarea.updating = true;
      } else if (prevState.giftWrapping.messageBeingUpdated) {
        this._cartTextarea.updated = true;
      }
    });
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  async _updateMessage(e) {
    // try {
    await window.theme.cart.store
      .getState()
      .updateGiftWrappingMessage(e.target.value);
    // } catch (e) {
    //   if (e.name && e.name === 'AbortError') return;
    //   console.log(e);
    // }
  }
}
customElements.define('cart-gift-wrapping-message', CartGiftWrappingMessage);

class CartNote extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this._cartTextarea = this.querySelector('cart-textarea');

    setTimeout(() => {
      this._cartTextarea.function = this._updateNote.bind(this);
    });

    this.unsubscribe = window.theme.cart.store.subscribe((state, prevState) => {
      if (state.noteBeingUpdated) {
        this._cartTextarea.updating = true;
      } else if (prevState.noteBeingUpdated) {
        this._cartTextarea.updated = true;
      }

      // if (state.products.note !== prevState.products.note) {
      //   this.text.value = state.products.note;
      // }
    });
  }

  disconnectedCallback() {
    // this.text.removeEventListener('input', this._debouncedUpdateNote);
    this.unsubscribe();
  }

  async _updateNote(e) {
    try {
      await window.theme.cart.store.getState().updateNote(e.target.value);
    } catch (e) {
      if (e.name && e.name === 'AbortError') return;
      console.log(e);
    }
  }

  // set value(value) {
  //   this.text.value = value;
  // }

  // get value() {
  //   return this.text.value;
  // }
}
customElements.define('cart-note', CartNote);

class CartSpinner extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.define('cart-spinner', CartSpinner);

class CartTerms extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.form = this.closest('form');
    this.input = this.querySelector('input[type="checkbox"]');
    this.error = this.querySelector('cart-terms-error');

    this._boundValidateForm = this._validateForm.bind(this);
    this._boundInputChange = this._inputChange.bind(this);

    setTimeout(() => {
      if (window.theme.lib.Cookies.get('cart_order_terms') === 'accepted') {
        this.input.checked = true;
      }
      this.form.addEventListener('submit', this._boundValidateForm);
      this.input.addEventListener('change', this._boundInputChange);
    });
  }

  disconnectedCallback() {
    this.form.removeEventListener('submit', this._boundValidateForm);
    this.input.removeEventListener('change', this._boundInputChange);
  }

  _validateForm(e) {
    if (!this.input.checked) {
      e.preventDefault();
      this._toggleError(true);
    }
  }

  _inputChange({ target: { checked } }) {
    if (checked) {
      this._toggleError(false);
    }
    window.theme.lib.Cookies.set(
      'cart_order_terms',
      checked ? 'accepted' : '',
      { secure: true, SameSite: 'None' },
    );
  }

  _toggleError(visible = true) {
    if (visible) {
      this.error.removeAttribute('hidden');
      this.error.classList.add('is-active');
    } else {
      this.error.classList.remove('is-active');
      this.error.setAttribute('hidden', '');
    }
  }
}
customElements.define('cart-terms', CartTerms);

class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.timeout = null;

    this._boundAutoClose = this._autoClose.bind(this);
    this._boundStopAutoClose = this._stopAutoClose.bind(this);
  }

  connectedCallback() {
    this.image = this.querySelector('cart-item-image-container img');
    this.imageContainerRatio = this.querySelector('.cart-item')
      .getAttribute('image-container-ratio')
      .trim();
    this.imageFit = this.querySelector('.cart-item').hasAttribute('image-fit');

    this.item = window.theme.cart.store.getState().latestAddedProduct;
    this.unsubscribe = window.theme.cart.store.subscribe((state) => {
      if (state.latestAddedProduct) {
        this.item = state.latestAddedProduct;
        this._render();
      } else {
        this.item = null;
      }
    });

    if (this.closest('.mfp-content')) {
      this._autoClose();
    }
  }

  disconnectedCallback() {
    this.unsubscribe();

    this.removeEventListener('mouseenter', this._boundStopAutoClose);
    this.removeEventListener('mouseleave', this._boundAutoClose);
  }

  _autoClose() {
    this.timeout = setTimeout(() => {
      $.magnificPopup.close();
    }, 4000);
    this.addEventListener('mouseenter', this._boundStopAutoClose, {
      once: true,
    });
  }

  _stopAutoClose() {
    if (this.timeout) clearTimeout(this.timeout);
    this.addEventListener('mouseleave', this._boundAutoClose, {
      once: true,
    });
  }

  _render() {
    if (!this.item) return;

    this._setImage();

    if (this.imageContainerRatio === 'natural') {
      this.image.closest('.o-ratio').style.paddingBottom = `${
        (1 /
          (this.item.featured_image
            ? this.item.featured_image.aspect_ratio
            : 1)) *
        100
      }%`;
    } else {
      this.image.closest('.o-ratio').style.paddingBottom = null;
    }

    this._updateSkeleton();

    this.querySelector('cart-item-title').innerHTML = this.item.product_title;

    const metaItemTemplate = document.getElementById(
      'template-cart-item-meta',
    ).content;

    if (
      this.item.variant_title &&
      !this.item.variant_title.includes('Default')
    ) {
      const defaultProperty = this.querySelector('cart-item-default-property');
      defaultProperty.innerHTML = '';
      defaultProperty.appendChild(metaItemTemplate.cloneNode(true));
      defaultProperty.querySelector('property-value').innerHTML =
        this.item.variant_title;
    }

    const vendor = this.querySelector('cart-item-vendor');
    if (vendor) {
      vendor.innerHTML = '';
      vendor.appendChild(metaItemTemplate.cloneNode(true));
      vendor.querySelector('property-value').innerHTML = this.item.vendor;
    }
  }

  _setImage(srcsetWidths = [120, 240, 360, 480]) {
    if (!this.image) return;

    const imageData = this.item.featured_image;

    if (imageData && imageData.url) {
      const { width, height, url } = imageData;

      const imageContainerRatio =
        this.imageContainerRatio !== 'natural'
          ? this.imageContainerRatio
              .split(':')
              .reduce(
                (ratio, value) => (ratio !== 0 ? value / ratio : value),
                0,
              )
          : null;
      const aspectRatio = width / height;
      const uncroppedImage =
        this.imageContainerRatio === 'natural' ||
        (imageContainerRatio && this.imageFit);

      let masterWidth = width;
      let masterHeight = height;

      if (!uncroppedImage) {
        masterHeight = Math.round(masterWidth * imageContainerRatio);

        if (masterHeight > height) {
          masterHeight = height;
          masterWidth = Math.round(masterHeight / imageContainerRatio);
        }
      }

      const srcset = srcsetWidths.reduce((srcset, srcWidth) => {
        const srcHeight = Math.round(
          uncroppedImage
            ? srcWidth / aspectRatio
            : srcWidth * imageContainerRatio,
        );

        if (srcWidth > masterWidth || srcHeight > masterHeight) return srcset;

        return `${srcset}${url}${
          url.includes('?') ? '&' : '?'
        }width=${srcWidth}${
          !uncroppedImage ? `&height=${srcHeight}&crop=center` : ''
        } ${srcWidth}w ${srcHeight}h, `;
      }, '');

      const masterSrc = !uncroppedImage
        ? `${url}${
            url.includes('?') ? '&' : '?'
          }width=${masterWidth}&height=${masterHeight}&crop=center`
        : url;

      this.image.setAttribute('src', masterSrc);
      this.image.setAttribute('srcset', srcset);
      this.image.setAttribute('width', masterWidth);
      this.image.setAttribute('height', masterHeight);
    }

    this.image.setAttribute('alt', `Image for ${this.item.title}`);
  }

  _updateSkeleton() {
    if (!this.image) return;

    const skeleton =
      this.image.nextElementSibling &&
      this.image.nextElementSibling.tagName.toLowerCase() === 'image-skeleton'
        ? this.image.nextElementSibling
        : null;

    if (skeleton) {
      const svg = skeleton.querySelector('svg');
      const rect = svg.querySelector('rect');
      const width = this.image.getAttribute('width');
      const height = this.image.getAttribute('height');
      skeleton.setAttribute(
        'aria-label',
        `Loading image for ${this.item.title}`,
      );
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      rect.setAttribute('width', width);
      rect.setAttribute('height', height);
    }
  }
}
customElements.define('cart-notification', CartNotification);

class CartQuantityInfo extends HTMLElement {
  constructor() {
    super();

    this.itemsCount = this.querySelector('items-count');
    this.infoContent = this.querySelector('info-content');
  }

  connectedCallback() {
    this.unsubscribe = window.theme.cart.store.subscribe((state) => {
      if (state.products.item_count > 0) {
        this.removeAttribute('hidden');

        if (state.products.item_count == 1) {
          this.infoContent.innerHTML = window.theme.t.cart_item_singular;
        } else {
          this.infoContent.innerHTML = window.theme.t.cart_item_plural;
        }
      } else {
        this.setAttribute('hidden', '');
      }
      this.itemsCount.innerHTML = state.products.item_count;
    });
  }

  disconnectedCallback() {
    this.unsubscribe();
  }
}
customElements.define('cart-quantity-info', CartQuantityInfo);

class CartGiftWrappingBanner extends HTMLElement {
  constructor() {
    super();

    this._boundEnable = this._enable.bind(this);
  }

  connectedCallback() {
    this.trigger = this.querySelector('button');

    if (
      Boolean(
        window.theme.cart.store.getState().products.attributes['gift-wrapping'],
      )
    ) {
      this.setAttribute('hidden', '');
    }

    this.unsubscribe = window.theme.cart.store.subscribe((state) => {
      const giftWrappingSet = Boolean(
        state.products.attributes['gift-wrapping'],
      );

      if (!giftWrappingSet) {
        this.removeAttribute('hidden');
      }
    });

    this.trigger.addEventListener('click', this._boundEnable);
  }

  disconnectedCallback() {
    this.unsubscribe();

    this.trigger.removeEventListener('click', this._boundEnable);
  }

  async _enable(e) {
    e.preventDefault();

    try {
      await this._setIsDoing();
      await window.theme.cart.store.getState().setGiftWrapping();
      await this._setIsDoing(false);
      this.setAttribute('hidden', '');
    } catch (error) {
      console.log(error);
      await this._setIsDoing(false, true);
    }
  }

  _setIsDoing(isDoing = true, error = false) {
    return new Promise((resolve) => {
      if (!this.trigger) {
        resolve('No trigger');
        return;
      }

      if (error) {
        this.trigger.classList.remove('is-doing');
        resolve('error');
        return;
      }

      if (isDoing) {
        this.trigger.classList.remove('is-done');
        this.trigger.classList.add('is-doing');
        resolve('Doing');
      } else {
        this.trigger.classList.remove('is-doing');
        this.trigger.classList.add('is-done');

        this.trigger.addEventListener('animationend', () => {
          this.trigger.classList.remove('is-done');
          resolve('Done');
        });
      }
      return;
    });
  }
}
customElements.define('cart-gift-wrapping-banner', CartGiftWrappingBanner);
