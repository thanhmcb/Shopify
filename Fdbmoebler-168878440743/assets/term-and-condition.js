const showCartPopUp = function(){
    document.getElementById("mini-cart-terms").setAttribute("open", "true");  
    
    document.querySelector('#mini-cart-terms .openable__overlay').addEventListener('click', function (e) {
      document.getElementById('mini-cart-terms').removeAttribute("open");
    });
    
    document.getElementById('mini-cart-terms-btn-denice').addEventListener('click', function (e) {
      document.getElementById("mini-cart-terms").removeAttribute("open");
    });
  }

  const checkoutButton = document.querySelector('.cart-drawer button[type="submit"');
  const inputCheckout = document.querySelector('.cart-drawer input#terms'); 
  const checkoutButtonCartPage = document.querySelector('.cart-form button[type="submit"');
  const inputCheckoutCartPage = document.querySelector('.cart-form input#terms'); 
  const reCapContainer = document.querySelector('.cart-order__recap');

 checkoutButton.addEventListener('click', function (evt) { 
    if(!inputCheckout.checked){
        console.log("khoi");
        evt.preventDefault();
        showCartPopUp();
    }

  });

  
 checkoutButtonCartPage.addEventListener('click', function (evt) { 
    if(!inputCheckoutCartPage.checked){
        evt.preventDefault();
        document.querySelector('.cart-form .terms-agreement').classList.add('cart__terms--focus');   
    }    
  });


reCapContainer.addEventListener('click',function(){
    if(inputCheckoutCartPage.checked){
        if(document.querySelector('.cart-form .cart__terms--focus')){
            document.querySelector('.cart-form .terms-agreement').classList.remove('cart__terms--focus'); 
        }
    }
 })


