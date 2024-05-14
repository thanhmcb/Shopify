//# sourceURL=mega-menu.js
$(document).ready(function() {
 $('.mega-menu__nav--support ~ .navigation-promo__wrapper').remove();
  if ($(".product-info__variant-picker").find(".option-value").length == 0) {
    $(".product-info__variant-picker")
      .closest('.shopify-section--main-product')
      .siblings(".shopify-section--product-menu")
      .find("a[href='#before-after']")
      .closest('li')
      .hide();
  } else {
    if ($('.product-info__variant-picker').text().indexOf("Coated") === -1) {
      $(".product-info__variant-picker")
        .closest('.shopify-section--main-product')
        .siblings(".shopify-section--product-menu")
        .find("a[href='#before-after']")
        .closest('li')
        .hide();
  
    }
  }
  if ($(".shopify-section--testimonials").find(".testimonial").length == 0) {
    $(".shopify-section--testimonials")
      .siblings(".shopify-section--product-menu")
      .find("a[href='#testimonials']")
      .closest('li')
      .hide();
  }
  
  if ($(".shopify-section--hot-spots").find(".content-over-media").length == 0) {
    $(".shopify-section--hot-spots")
      .siblings(".shopify-section--product-menu")
      .find("a[href='#hot-spots']")
      .closest('li')
      .hide();
  }
  
  if ($('.shopify-section--media-with-text').find('.media-with-text__item').length == 0) {
    $('.shopify-section--media-with-text')
      .siblings('.shopify-section--product-menu')
      .find("a[href='#videos']")
      .closest('li')
      .hide();
  }
});