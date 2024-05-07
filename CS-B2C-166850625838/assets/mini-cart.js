//# sourceURL=mini-cart.js

      $(document).ready(function() {

      

       

        if ($('#agree').is(':checked')) {
		  $('#agree').prop('checked', true);
          $('#checkout-button-validate').prop('disabled', false);
          $('#cart__checkout-button-validate').prop('disabled', false);

        } else {
		  $('#agree').prop('checked', false);
          $('#checkout-button-validate').prop('disabled', true);
        }

        $('.cart-drawer').on('click', '#agree', function() {
          if ($('#agree').is(':checked')) {
            $('#checkout-button-validate').prop('disabled', false);
            $('#checkout-button-disable').hide();

            $('#cart__checkout-button-disable').hide();

          } else {
            $('#checkout-button-validate').prop('disabled', true);
            $('#checkout-button-disable').show();
            console.log("quan4");
          }
        });

        $('.cart-order__recap').on('click', '#agree', function() {
          if ($('#agree').is(':checked')) {
            $('#checkout-button-validate').prop('disabled', false);
            $('#cart__checkout-button-disable').hide();
          } else {
            $('#checkout-button-validate').prop('disabled', true);
            $('#cart__checkout-button-disable').hide();

          }
        });
   
        $('body').on('click', '#checkout-button-disable', function() {
          if ($('#agree').is(':checked')) {

            //$(this).submit();

          } else {
            $('#mini-cart-terms').attr("open", "true");

            $('#mini-cart-terms-btn-denice').off('click').on('click', function() {
              $('#mini-cart-terms').removeAttr("open");
              console.log('test');
            });

            $('#checkout-button-validate').off('click').on('click', function() {
              $('#mini-cart-terms').removeAttr("open");
              console.log('test-accept');
            });

            $('#mini-cart-terms .openable__overlay').off('click').click(function() {
              $('#mini-cart-terms').removeAttr("open");
            });
            return false;
          }
        });

        $('body').on('click', '#cart__checkout-button-disable', function() {
          if ($('#agree').is(':checked')) {
            //$(this).submit();
            $('.cart__terms').removeClass('cart__terms--focus');
            $('#cart__terms-error-message').hide();

          } else {
            $('.cart__terms #agree').focus();
            $('.cart__terms').addClass('cart__terms--focus');
            $('#cart__checkout-button-disable').hide();
            console.log('test hkjfld');
            return false;
          }
        });

        $('.cart-order__recap').on('click', function() {
          if ($('.cart__terms #agree').is(':checked')) {
            $('.cart__terms').removeClass('cart__terms--focus');
          }
        });
      });
   