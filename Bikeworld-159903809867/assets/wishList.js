//# sourceURL=wishList.js

const LOCAL_STORAGE_WISHLIST_KEY = 'shopify-wishlist';
const LOCAL_STORAGE_DELIMITER = ',';
const LOCAL_STORAGE_URL_DELIMITER = '&';
const BUTTON_ACTIVE_CLASS = 'active';
const GRID_LOADED_CLASS = 'loaded';

const selectors = {
    button: '[button-wishlist]',
    grid: '[grid-wishlist]',
    productCard: '.product-item',
};

document.addEventListener('DOMContentLoaded', () => {
    var timesRun = 0;
    var interval = setInterval(function () {
        timesRun += 1;
        if (timesRun === 5) {
            clearInterval(interval);
        }
        initButtons();


    }, 500);

    initGrid();

   
});
function addWishlistCount(wishlist) {
    $('.wishlist--link__count').attr("data-wishlist-count",wishlist.length).html(wishlist.length);
}
    
document.addEventListener('shopify-wishlist:updated', (event) => {
    console.log('[Shopify Wishlist] Wishlist Updated ✅', event.detail.wishlist);
    initGrid();
  addWishlistCount(event.detail.wishlist);
});

document.addEventListener('shopify-wishlist:init-product-grid', (event) => {
    console.log('[Shopify Wishlist] Wishlist Product List Loaded ✅', event.detail.wishlist);
});

document.addEventListener('shopify-wishlist:init-buttons', (event) => {
    console.log('[Shopify Wishlist] Wishlist Buttons Loaded ✅', event.detail.wishlist);
    if( $('.sparxpres').is(':empty') ) {
      alert("empty");
      $('.sparxpres').parent().css( "background-color", "red" );
    }
      addWishlistCount(event.detail.wishlist);
});

const fetchProductCardHTML = (handle) => {
    const productTileTemplateUrl = `/products/${handle}?view=card`;
    return fetch(productTileTemplateUrl)
        .then((res) => res.text())
        .then((res) => {
            const text = res;
            const parser = new DOMParser();
            const htmlDocument = parser.parseFromString(text, 'text/html');
            const productCard = htmlDocument.documentElement.querySelector(selectors.productCard);
            return productCard.outerHTML;
        })
        .catch((err) => console.error(`[Shopify Wishlist] Failed to load content for handle: ${handle}`, err));
};

const setupGrid = async (grid) => {
    const wishlist = getWishlist();
    const requests = wishlist.map(fetchProductCardHTML);
    const responses = await Promise.all(requests);
    const wishlistProductCards = responses.join('');
    grid.innerHTML = wishlistProductCards;
    grid.classList.add(GRID_LOADED_CLASS);
    initButtons();

    const event = new CustomEvent('shopify-wishlist:init-product-grid', {
        detail: {
            wishlist: wishlist
        }
    });
    document.dispatchEvent(event);
};

const setupButtons = (buttons) => {
    buttons.forEach((button) => {
        const productHandle = button.dataset.productHandle || false;
        if (!productHandle) return console.error('[Shopify Wishlist] Missing `data-product-handle` attribute. Failed to update the wishlist.');
        if (wishlistContains(productHandle)) button.classList.add(BUTTON_ACTIVE_CLASS);
    });
};

const initGrid = () => {
    const grid = document.querySelector(selectors.grid) || false;
    if (grid) setupGrid(grid);
};

const initButtons = () => {
    const buttons = document.querySelectorAll(selectors.button) || [];
    if (buttons.length) setupButtons(buttons);
    else return;
    const event = new CustomEvent('shopify-wishlist:init-buttons', {
        detail: {
            wishlist: getWishlist()
        }
    });
    document.dispatchEvent(event);
};

const getWishlist = () => {
  const handleIndex = location.href.indexOf('?datahandle=');
  
  if(handleIndex == -1) {
    var wishListArray = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY) || false;
    if (wishListArray) return wishListArray.split(LOCAL_STORAGE_DELIMITER);  
  } else if(handleIndex > -1) {
    var wishListDataHandleA = window.location.href.split('?');
    wishListDataHandleA[1] = '&' + wishListDataHandleA[1];
    var wishListArray = wishListDataHandleA[1].split('&datahandle=');
    wishListArray = wishListArray.filter(x => x);
    
    if (wishListArray) return wishListArray;      
  }  
  
    return [];
};

const getWishlistURL = () => {
    const wishlist = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY) || false;
    if (wishlist) return wishlist.split(LOCAL_STORAGE_DELIMITER);
    return [];
};

const setWishlist = (array) => {
    const wishlist = array.join(LOCAL_STORAGE_DELIMITER);
    if (array.length) localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, wishlist);
    else localStorage.removeItem(LOCAL_STORAGE_WISHLIST_KEY);

    const event = new CustomEvent('shopify-wishlist:updated', {
        detail: {
            wishlist: array
        }
    });
    document.dispatchEvent(event);

    return wishlist;
};

const updateWishlist = (handle) => {
    const wishlist = getWishlist();
    const indexInWishlist = wishlist.indexOf(handle);
    if (indexInWishlist === -1) wishlist.push(handle);
    else wishlist.splice(indexInWishlist, 1);
    return setWishlist(wishlist);
};

const wishlistContains = (handle) => {
    const wishlist = getWishlist();
    return wishlist.includes(handle);
};

const resetWishlist = () => {
    return setWishlist([]);
};

$(document).on('click', '.btn-wishlist', function (event) {
    console.log('click');
    var datahandle = $(this).attr('data-product-handle');
    updateWishlist(datahandle);
    if ($(this).hasClass('active')) {
        $(this).removeClass('active')
    } else {
        $(this).addClass('active');
    }
});

function reloadHearth() {
    $(".btn-wishlist").each(function () {
        var datahandle = $(this).attr('data-product-handle');
        if (wishlistContains(datahandle)) {
            $(this).addClass('active');
        }
        else {
            $(this).removeClass('active');
        }
    });
};

$(document).on('click', 'body', function (event) {
    reloadHearth();
});

$(document).on('click', '.button-wishlist-share', function (event) {
    var currentURL = window.location.href;
    var datahandle = "?datahandle=";
    const wishlist = datahandle + getWishlistURL();
    const wishlistURL = currentURL + wishlist.replaceAll(",","&datahandle=");
    console.log('test'+ wishlistURL);
   document.getElementById("wishlist-link").value = wishlistURL;
});

    function copyToClipboard() {
        const copyText = document.getElementById("wishlist-link").value;
        let input = document.createElement('input');
        input.style.display = 'none';
        document.body.appendChild(input);
        input.value = copyText;
        input.focus();
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value);
        alert("Link kopieret: " + input.value);
    }


var clipboard = new ClipboardJS('#btnCopyToClipboard');
clipboard.on('success', function (e) {
	console.log('wishList url copied successfully to clipboard');
});

clipboard.on('error', function (e) {
	console.log(e);
});