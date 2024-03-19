
const showErroMessage = function(){
    document.querySelector('.cart-sumary-term').classList.add('cart__terms--focus');
    document.getElementById("cart-terms").addEventListener('click', function (e) {
        document.querySelector('.cart-sumary-term').classList.remove('cart__terms--focus');
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
        console.log('t2');
      }
  
      /**
       * Handles cart form submit
       * @param {object} evt - Event object.
       */
      handleSubmit(evt) {
        if (!this.cartTermsCheckbox.checked) {
          evt.preventDefault();
          showErroMessage();
        } 
       
      }
    }
    customElements.define('cart-terms', CartTerms);
  }
  