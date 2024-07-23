//MCB Term and Condition

//cart drawer
const showCartPopUp = function(){
  document.getElementById("mini-cart-terms").setAttribute("open", "true");  
  
  document.querySelector('#mini-cart-terms .openable__overlay').addEventListener('click', function (e) {
    document.getElementById('mini-cart-terms').removeAttribute("open");
  });
  
  document.getElementById('mini-cart-terms-btn-denice').addEventListener('click', function (e) {
    document.getElementById("mini-cart-terms").removeAttribute("open");
  });
}

const container = document.querySelector('.cart-drawer');
if (container){;
  container.addEventListener('click', function(event) {
    if (event.target.matches('#agree')) {
        if (document.querySelector('#agree').checked){
          document.querySelector('#checkout-button-disable').style.display="none";
          document.querySelector('.checkout-button-wrapper button[type="submit"]').style.opacity = "1";
        }else{
          document.querySelector('#checkout-button-disable').style.display="flex";
          document.querySelector('.checkout-button-wrapper button[type="submit"]').style.opacity = "0";
        }
  
    }
  });
}

document.body.addEventListener('click', function(event) {
  if (event.target && event.target.id === 'checkout-button-disable') {  
      if(!document.querySelector('#agree').checked){
        showCartPopUp();
      }
  }
});

//cart page
const checkoutButtonCartPage = document.querySelector('.cart-form button[type="submit"');
const inputCheckoutCartPage = document.querySelector('.cart-form input#terms'); 
const reCapContainer = document.querySelector('.cart-order__recap'); 

if(checkoutButtonCartPage) {
  checkoutButtonCartPage.addEventListener('click', function (evt) { 
    if(!inputCheckoutCartPage.checked){
        evt.preventDefault();
        document.querySelector('.cart-form .terms-agreement').classList.add('cart__terms--focus');   
    }    
  });
}

if(reCapContainer){
  reCapContainer.addEventListener('click',function(){
    if(inputCheckoutCartPage.checked){
        if(document.querySelector('.cart-form .cart__terms--focus')){
            document.querySelector('.cart-form .terms-agreement').classList.remove('cart__terms--focus'); 
        }
    }
  })
}




 

 

  
