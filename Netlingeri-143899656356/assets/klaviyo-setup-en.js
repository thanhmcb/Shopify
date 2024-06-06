var klaviyo = klaviyo || [];
    klaviyo.init({
      account: "Rx7dRj",
      list: "QQ4aVE",
      platform: "shopify"
    });
    klaviyo.enable("backinstock",{ 
    trigger: {
      product_page_text: "Notify Me When Available",
      product_page_class: "btn",
      product_page_text_align: "center",
      product_page_margin: "0px",
      replace_anchor: false
    },
    modal: {
     headline: "{product_name}",
     body_content: "EN - Skriv dig op til at modtage besked når varen er på lager igen.",
     email_field_label: "Email",
     button_label: "EN - Notify me when available",
     subscription_success_label: "You're in! We'll let you know when it's back.",
     newsletter_subscribe_label: "Add me to your email list.",
     subscribe_checked: true,
     footer_content: '',
     additional_styles: "@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans');",
     drop_background_color: "#000",
     background_color: "#fff",
     text_color: "#222",
     button_text_color: "#fff",
     button_background_color: "#439fdb",
     close_button_color: "#ccc",
     error_background_color: "#fcd6d7",
     error_text_color: "#C72E2F",
     success_background_color: "#d3efcd",
     success_text_color: "#1B9500"
    }
  });