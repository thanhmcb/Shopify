//# sourceURL=list-view.js

$('#main').on('click', '.tab', function(evt) {
  evt.preventDefault();
  $('.tab').toggleClass('active');
  var sel = this.getAttribute('data-toggle-target');
  $('.tab-content').removeClass('active').filter(sel).addClass('active');
    if ($(".tab-list-view").hasClass('active')) {
    $('.pagination__item').addClass('button-list-view');
}       
});

$('#main').on('click', '.pagination__item.button-list-view',  function(evt) {
  $('.shopify-section--main-collection').addClass('list-view-layout');
  $('.shopify-section--main-search').addClass('list-view-layout');
});

$('#main').on('click', '.pagination__item',  function(evt) {
   
    if ($(".tab-grid-view").hasClass('active')) {    
    }  
    if (window.innerWidth > 1000) {   
      $('html, body').animate({
        scrollTop: $('.collection--filters-horizontal').offset().top - 150
    }, 1000); 
    } 
});

$('#main').on('click', '.tab-grid-view', function(evt) {
  $('.shopify-section--main-collection').removeClass('list-view-layout');
  $('.shopify-section--main-collection').addClass('grid-view-layout');
     $('.shopify-section--main-search').removeClass('list-view-layout');
  $('.shopify-section--main-search').addClass('grid-view-layout');
  $('.pagination__item').removeClass('button-list-view');
  $('.tab-grid-view').addClass('active');
  $('.tab-list-view').removeClass('active');
  console.log("tt");
});

$('#main').on('click', '.tab-list-view', function(evt) {
  $('.shopify-section--main-collection').removeClass('grid-view-layout');
  $('.shopify-section--main-collection').addClass('list-view-layout');
  $('.shopify-section--main-search').removeClass('grid-view-layout');
  $('.shopify-section--main-search').addClass('list-view-layout');
  console.log("tt3");
});   

function closestParentWithClass(element, className) {
  if (element && element.classList.contains(className))
    return element;
  
  if (!element || element === document.body)
    return null;
  
  return closestParentWithClass(element.parentElement, className);
}
      
function closestWithAttribute(element, attributeName) {
  if (element && element.hasAttribute(attributeName))
    return element;
  
  if (!element || element === document.body)
    return null;
  
  return closestWithAttribute(element.parentElement, attributeName);
}

function closestVariantPicker(element) {
  while (element && element.tagName !== 'HTML') {
    if (element.tagName === 'VARIANT-PICKER')
      return element;
    
    element = element.parentElement;
  }
  
  return null;
}
function closestElementOfTagType(element, tagOfType) {
  while (element && element.tagName !== tagOfType) {
    element = element.parentElement;
  }
  
  return element;
}

function closestWithClassQuick(element, className) {
  return element.closest("." + className);
}

function OnBuyButtonClicked(event) {
  event.stopPropagation();
  event_store = event;

  var closestForm = closestElementOfTagType(event.target, "form");
  var productCardOfClickedBuyButton = closestParentWithClass(event.target, 'product-card'); 
  var formOfClickedBuyButton =  closestParentWithClass(event.target, 'shopify-product-form'); 
  var variantPickerOfClickedBuyButton = productCardOfClickedBuyButton.querySelector('variant-picker');
  var optionsInClickedVariantPicker = variantPickerOfClickedBuyButton.querySelectorAll('fieldset.variant-picker__option');
  
  var errorMsg = '';
  var count = 0;
  var errorMsgTrail = '';
  
  optionsInClickedVariantPicker.forEach((element) => {
    var optionName = element.innerText;
    var selectedOptionByUser = element.querySelector('.text-subdued.selected-value');
    
    //user has not made a selection for this optionType
    if(selectedOptionByUser.innerText.length === 0 ) {
      if(count === 0 )
        errorMsgTrail = ', is not selected, please select a option for the required variant.';
      if(count === 1 )
        errorMsgTrail = ', are not selected, please select options for the required variants.';

      if(count === 0 ) 
        errorMsg += 'Variant(s): "' + optionName+'"';
      if(count === 1 )
        errorMsg += ', "' + optionName +'"';
         
      count++;
    }
  });
  
  if(errorMsg?.length > 0) {
    console.error(errorMsg+errorMsgTrail);
    alert(errorMsg+errorMsgTrail);
  } else {
    //if no error then continue suspended event - do submit here
    try {       
      if (document.createEvent) { //Not IE
          event.target.dispatchEvent(event_store);
      } else { //IE
          event.target.fireEvent("on" + event_store.eventType, event_store);
      }      
    } catch (error) {
     //silencio
    }
  }
}

function onDomLoaded() {
  registerListViewBuyButtonsEventHandlers();
}

function registerListViewBuyButtonsEventHandlers() {
  const productListViewParentElement = document.querySelector(`product-list.product-list.product-list__list-view`);
  
  if(productListViewParentElement !== undefined) {
    if(productListViewParentElement !== null) {
      let buyButtonDataAttributeDefinitionSelector = `div[data-buy-button]`;
      let allBuyButtonsInListView = productListViewParentElement.querySelectorAll(buyButtonDataAttributeDefinitionSelector);
      
      allBuyButtonsInListView.forEach((element) => {
        var buyButtonGrandParentNode = element?.parentNode?.parentNode;
        
        if(buyButtonGrandParentNode !== undefined) {
            buyButtonGrandParentNode.addEventListener('click', function (event) {
              OnBuyButtonClicked(event);
            });   
        }
      });
    }
  }
  
}

document.addEventListener("DOMContentLoaded", onDomLoaded);   