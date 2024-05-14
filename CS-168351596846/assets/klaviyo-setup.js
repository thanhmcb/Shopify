//# sourceURL=klaviyo-setup.js
var klaviyo = klaviyo || [];
klaviyo.init({account: "YwrtFt", platform: "shopify"});
klaviyo.enable("backinstock", {
  trigger: {
    product_page_text: "Notify me when available",
    product_page_class: "btn",
    product_page_text_align: "center",
    product_page_margin: "0px",
    replace_anchor: false
  },
  modal: {
    headline: "<h1>{product_name}</h1>",
    body_content: "Sign up to receive a notification when the item is back in stock",
    email_field_label: "Email",
    button_label: "Notify me when available",
    subscription_success_label: "You are signed up! We will notify you as soon as the item is back in stock.",
    footer_content: '',
    additional_styles: "@import url('https://db.onlinewebfonts.com/c/175bb37214e59d8e24ee6ea635b2eeff?family=Px+Grotesk+Bold');",
    font_family: '"Px Grotesk Bold", sans-serif;',
    drop_background_color: "#000",
    background_color: "#fff",
    text_color: "#222",
    button_text_color: "#fff",
    button_background_color: "#000",
    close_button_color: "#ccc",
    error_background_color: "#fcd6d7",
    error_text_color: "#C72E2F",
    success_background_color: "#d3efcd",
    success_text_color: "#1B9500"
  }
});