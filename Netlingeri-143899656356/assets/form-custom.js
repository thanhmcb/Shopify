


    document.querySelectorAll('.variant-drop-down form').forEach((form) => {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          console.log(document.querySelector('.js-cart-drawer'));
          await fetch('/cart/add', {
            method: 'post',
            body: new FormData(form),
          });
          
      
        });
       
      });
 