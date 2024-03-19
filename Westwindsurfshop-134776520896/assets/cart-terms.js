
const showCartPopUp = function(){
  document.getElementById("mini-cart-terms").setAttribute("open", "true");

  document.querySelector('.cart--accept').addEventListener('click', function (e) {
    document.getElementById("cart-terms").setAttribute("checked", "true")
  });
  document.querySelector('#mini-cart-terms .openable__overlay').addEventListener('click', function (e) {
    document.getElementById("mini-cart-terms").removeAttribute("open")
  });
  
  document.getElementById("mini-cart-terms-btn-denice").addEventListener('click', function (e) {
    document.getElementById("mini-cart-terms").removeAttribute("open")
  });

 
}


if (!customElements.get('cart-terms')) {
  class CartTerms extends HTMLElement {
    constructor() {
      super();
      this.cartTermsCheckbox = this.querySelector('.js-cart-terms-checkbox');
      this.form = document.getElementById(this.cartTermsCheckbox.getAttribute('form'));
      this.submitHandler = this.handleSubmit.bind(this);
      this.form.addEventListener('submit', this.submitHandler);
    }

    disconnectedCallback() {
      this.form.removeEventListener('submit', this.submitHandler);
    }

    /**
     * Handles cart form submit
     * @param {object} evt - Event object.
     */
    handleSubmit(evt) {
      if (!this.cartTermsCheckbox.checked) {
        evt.preventDefault();
        showCartPopUp();
        //alert(theme.strings.cartTermsConfirmation); // eslint-disable-line
        console.log('thanh');
      }
     
    }
  }
  customElements.define('cart-terms', CartTerms);
}
