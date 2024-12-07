/*
* Broadcast Theme
*
* Use this file to add custom Javascript to Broadcast.  Keeping your custom
* Javascript in this fill will make it easier to update Broadcast. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*/


(function() {
  // Add custom code below this line
  $(document).ready(function () {
    if ($('#agree').is(':checked')) {
        $('#checkout-button-validate').prop('disabled', false);
        $('#cart__checkout-button-validate').prop('disabled', false);
    } else {
        $('#checkout-button-validate').prop('disabled', true);
        $('#cart__checkout-button-validate').prop('disabled', true);
    }

    $('body').on('click', '#agree', function () {
        if ($('#agree').is(':checked')) {
            $('#checkout-button-validate').prop('disabled', false);
            $('#cart__checkout-button-validate').prop('disabled', false);
            $('#checkout-button-disable').hide();
            $('#cart__checkout-button-disable').hide();
            $('#cart__terms-error-message').css('height', '0');
            $('.terms-checkbox').removeClass('is-active');
        } else {
            $('#checkout-button-validate').prop('disabled', true);
            $('#cart__checkout-button-validate').prop('disabled', true);
            $('#checkout-button-disable').show();
            $('#cart__checkout-button-disable').show();
        }
    });

    $('body').on('click', '#cart__checkout-button-disable', function () {
        if ($('#agree').is(':checked')) {
            $(this).submit();
            $('.cart__terms').removeClass('cart__terms--focus');
            $('#cart__terms-error-message').hide();
            $('.terms-checkbox').removeClass('is-active');

        } else {
            $('.cart__terms #agree').focus();
            $('.cart__terms').addClass('cart__terms--focus');
            $('.terms-checkbox').addClass('is-active');
            return false;
        }
    });

    $('.cart__aside').on('click', function () {
        if ($('.cart__terms #agree').is(':checked')) {
            $('.cart__terms').removeClass('cart__terms--focus');
        }
        if ($('#agree').is(':checked')) {
            $('#cart__checkout-button-validate').prop('disabled', false);
        } else {
            $('#cart__checkout-button-validate').prop('disabled', true);
        }
    });

});

  // ^^ Keep your scripts inside this IIFE function call to 
  // avoid leaking your variables into the global scope.
})();
