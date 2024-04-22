/*
* Broadcast Theme
*
* Use this file to add custom Javascript to Broadcast.  Keeping your custom
* Javascript in this fill will make it easier to update Broadcast. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*/

const checkboxTermAndCondition = document.getElementById('term-acceptance');
const buttonTermAndCondition = document.querySelector('.cart__foot__inner .cart__buttons');
(function() {
  // Add custom code below this line
  const checkInput = function checkUncheck(){
    if ( checkboxTermAndCondition.checked){
      checkboxTermAndCondition.nextSibling.nextSibling.nextSibling.nextSibling.classList.remove("is-expanded");
    }else{
      checkboxTermAndCondition.nextSibling.nextSibling.nextSibling.nextSibling.classList.add("is-expanded");
    }
  }
  checkboxTermAndCondition.addEventListener('click', function (e) {
    checkInput(); 
  })
  buttonTermAndCondition.addEventListener('click', function (e) {
    checkInput(); 
  }); 
  // ^^ Keep your scripts inside this IIFE function call to 
  // avoid leaking your variables into the global scope.
})();
