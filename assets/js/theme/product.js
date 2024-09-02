/* eslint-disable no-param-reassign */
/*
 Import all product specific js
 */
import PageManager from "./page-manager";
import Review from "./product/reviews";
import collapsibleFactory from "./common/collapsible";
import ProductDetails from "./common/product-details";
import videoGallery from "./product/video-gallery";
import { classifyForm } from "./common/utils/form-utils";
// eslint-disable-next-line no-unused-vars
import { hasClass } from "nod-validate";

export default class Product extends PageManager {
  constructor(context) {
    super(context);
    this.url = window.location.href;
    this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
    this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
  }

  onReady() {
    // Listen for foundation modal close events to sanitize URL after review.
    $(document).on("close.fndtn.reveal", () => {
      if (
        this.url.indexOf("#write_review") !== -1 &&
        typeof window.history.replaceState === "function"
      ) {
        window.history.replaceState(
          null,
          document.title,
          window.location.pathname
        );
      }
    });

    let validator;

    // Init collapsible
    collapsibleFactory();

    this.productDetails = new ProductDetails(
      $(".productView"),
      this.context,
      window.BCData.product_attributes
    );
    this.productDetails.setProductVariant();

    videoGallery();

    if ($("#tab-customDelivery").length === 0) {
      $('[href="#tab-customDelivery"]').parent().hide();
    }

    const $reviewForm = classifyForm(".writeReview-form");
    const review = new Review($reviewForm);

    $("body").on("click", '[data-reveal-id="modal-review-form"]', () => {
      validator = review.registerValidation(this.context);
    });

    $reviewForm.on("submit", () => {
      if (validator) {
        validator.performCheck();
        return validator.areAll("valid");
      }

      return false;
    });

    this.productReviewHandler();
    this.bulkPricingHandler();
    this.relatedProductsPricing();

    // Custom printing modal js
    // ---------------------------------------
    // Get the modal
    const modal = document.getElementById("cp-modal");
    // Get the button that opens the modal
    const btn = document.getElementById("cp-btn");
    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName("cp-close")[0];
    // When the user clicks the button, open the modal
    btn.onclick = () => {
      modal.style.display = "block";
    };
    // When the user clicks on <span> (x), close the modal
    span.onclick = () => {
      modal.style.display = "none";
    };
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
    // -----------------------------------------

    // Hush panel modal js
    // -------------------------------------------

    if (document.getElementById("hp-btn") != null) {
      // Get the modal
      const hpModal = document.getElementById("hp-modal");
      // Get the button that opens the modal
      const hpBtn = document.getElementById("hp-btn");
      // Get the <span> element that closes the modal
      const hpSpan = document.getElementsByClassName("hp-close")[0];
      // When the user clicks the button, open the modal
      hpBtn.onclick = () => {
        hpModal.style.display = "block";
      };
      // When the user clicks on <span> (x), close the modal
      hpSpan.onclick = () => {
        hpModal.style.display = "none";
      };
      // When the user clicks anywhere outside of the modal, close it
      window.onclick = (event) => {
        if (event.target === hpModal) {
          hpModal.style.display = "none";
        }
      };
    }
    // ----------------------------------------------

    const widthArray = [];
    widthArray["1'"] = "width-0";
    widthArray["2'"] = "width-0";
    widthArray["7'2\""] = "width-1";
    widthArray["8'6\""] = "width-1";
    widthArray["11'3\""] = "width-0";
    widthArray["14'"] = "width-2";
    widthArray["15'6\""] = "width-2";
    widthArray["19'6\""] = "width-3";
    widthArray["19'9\""] = "width-3";
    widthArray["25'"] = "width-4";
    widthArray["30'6\""] = "width-5";

    const heightArray = [];
    heightArray["2'"] = "height-0";
    heightArray["4'"] = "height-1";
    heightArray["5'"] = "height-2";
    heightArray["6'"] = "height-3";
    heightArray["6'10\""] = "height-4";
    heightArray["7'6\""] = "height-5";

    $('label[data-rect-type="Window Type"]').parent().hide();
    $('label[data-select-type="Window Type"]').parent().hide();

    // returning index
    $("span.rectangle-item").on("click", (e) => {
      const text = $(e.target).parent().text();
      if (text.match("Width")) {
        // var index = $('label.form-option').index(e.target);
        const indexString = $(e.target).find(".form-option-variant").text();
        for (let a = 5; a > 0; a--) {
          $(".model-p").removeClass(`width-${a}`);
        }
        // add the new width class
        $(".model-p").addClass(widthArray[indexString]);
        if (
          $(".model-p").has(widthArray[indexString]) &&
          (widthArray[indexString] === "width-5" ||
            widthArray[indexString] === "width-4")
        ) {
          $(".model-p-container").addClass("wide--mode");
        } else {
          $(".model-p-container").removeClass("wide--mode");
        }
      }
      if (text.match("Height")) {
        const indexString = $(e.target).find(".form-option-variant").text();
        for (let b = 5; b > 0; b--) {
          $(".model-p").removeClass(`height-${b}`);
        }
        // add the new height class
        $(".model-p").addClass(heightArray[indexString]);
      }
    });

    // dynamic product specs begin

    $('[data-product-attribute="set-rectangle"]').each((index, elm) => {
      if ($(elm).find("span.rectangle-item").length === 1) {
        const targetElm = $(elm).find("span.rectangle-item:eq(0)");
        setTimeout(() => {
          targetElm.trigger("click");
        }, 200);
      }
    });

    // get product dimensions & values

    let objectWidth = null;
    let objectHeight = null;
    let objectColor = null;
    let objectFoot = null;
    let objectWheels = null;
    let objectWindowStyle = null;
    let objectType = null;
    let objectWindowType = null;
    let objectStyle = null;
    let objectSize = null;
    let objectElectric = null;
    let objectPattern = null;
    let objectWithFlooring = null;
    let objectPanels = null;
    let objectMounting = null;
    let objectDoor = null;
    let objectTrim = null;
    let objectRoofColor = null;
    let objectSurfaceType = null;
    let objectFinish = null;
    let objectDepth = null;
    // eslint-disable-next-line no-unused-vars
    let objectLegColor = null;
    let objectProtection = null;

    if ($(".form-label--changes").parent().text().match("Width")) {
      $(".addtocart-wrapper").addClass("disabled");
    }
    if ($(".form-label--changes").parent().text().match("Height")) {
      $(".addtocart-wrapper").addClass("disabled");
    }
    if ($("#form-field-colors").length > 0) {
      $(".addtocart-wrapper").addClass("disabled");
    }

    // eslint-disable-next-line no-undef
    const objectData = jsContext.productLabels;

    const specialSkus = [
      "RD360V2",
      "PS",
      "QWF",
      "WMQWF",
      "QWS",
      "WMQWS",
      "RD360",
      "WMRD360",
      "SW",
      "WMSW",
      "WST",
    ];
    const productSku = this.context.productSku;

    if (specialSkus.includes(productSku)) {
      const trimItems = $('label[data-rect-type="Trim"]').parent().children();
      Array.from(trimItems).forEach((trimItem) => {
        if (trimItem.children[0].outerText === "White") {
          trimItem.classList.add("disabled");
        }
      });
    }

    const returnParameters = () => {
      let productData = null;

      // color
      if (objectColor !== null) {
        productData = `${objectColor}`;
      }
      if ($('label[data-select-type="Color"]').length) {
        // console.log('color', objectColor);
        productData = `${objectColor}`;
      }

      // width x height
      if (objectWidth !== null && objectHeight !== null) {
        productData = `${objectWidth} x ${objectHeight}`;
      }

      // Surface Type
      if (
        $('label[data-rect-type="Surface Type"]').length > 0 ||
        $('label[data-select-type="Surface Type"]').length > 0
      ) {
        productData = objectSurfaceType;
      }

      // width x height color (or simple window)
      if (
        objectWidth !== null &&
        objectHeight !== null &&
        objectColor !== null
      ) {
        productData = `${objectWidth} x ${objectHeight} ${objectColor}`;
      }

      // width
      if (objectWidth !== null && objectHeight === null) {
        productData = `${objectWidth}`;
      }

      if (
        ($('label[data-rect-type="Width"]').length ||
          $('label[data-select-type="Width"]').length) &&
        ($('label[data-rect-type="Height"]').length > 0 ||
          $('label[data-select-type="Height"]').length > 0)
      ) {
        //productData = `${objectWidth} x ${objectHeight}`;
      }

      // width && Y/N

      if (
        ($('label[data-rect-type="Width"]').length > 0 ||
          $('label[data-select-type="Width"]').length > 0) &&
        ($('label[data-rect-type="With Flooring"]').length > 0 ||
          $('label[data-select-type="With Flooring"]').length > 0)
      ) {
        productData = `${objectWidth} - ${objectWithFlooring}`;
      }

      // Panels && Y/N
      if (
        ($('label[data-rect-type="Panels"]').length > 0 ||
          $('label[data-select-type="Panels"]').length > 0) &&
        ($('label[data-rect-type="Mounting"]').length > 0 ||
          $('label[data-select-type="Mounting"]').length > 0)
      ) {
        productData = `${objectPanels} ${objectMounting}`;

        if (objectPanels === 1) {
          $(".form-option-variant").each((index, elm) => {
            if (
              $(elm).text() === "Freestanding" &&
              !$(elm).parent().hasClass("active-rectangle")
            ) {
              $(elm).parent().click();
            } else if ($(elm).text() === "Wall-Mounted") {
              $(elm).parent().addClass("disabled");
            }
          });
        } else {
          $(".form-option-variant").parent().removeClass("disabled");
        }
      }

      if (
        $('label[data-rect-type="Style"]').length ||
        $('label[data-select-type="Style"]').length
      ) {
        if (objectColor !== null) {
          productData = `${objectStyle} ${objectColor}`;
        } else {
          productData = `${objectStyle}`;
        }
      }

      // width x height color foot
      if (
        $('label[data-rect-type="Foot Style"]').length ||
        $('label[data-select-type="Foot Style"]').length
      ) {
        if (
          $("label[data-rect-type]").length > 1 ||
          $("label[data-select-type]").length > 1
        ) {
          productData = `${objectWidth} x ${objectHeight} ${objectColor} - ${objectFoot}`;
        } else {
          productData = `${objectFoot}`;
        }
      }

      if (
        $('label[data-rect-type="Protection"]').length ||
        $('label[data-select-type="Protection"]').length
      ) {
        productData = `${objectWidth} x ${objectHeight} ${objectColor} - ${objectProtection}`;
      }

      // width x height color wheels
      if (window.location.pathname === "/hush-screen-office-partition/") {
        productData = `${objectWidth} x ${objectHeight} ${objectColor} - Yes`;
      } else {
        // width x height color wheels
        if (
          $('label[data-rect-type="Wheels"]').length ||
          $('label[data-select-type="Wheels"]').length
        ) {
          productData = `${objectWidth} x ${objectHeight} ${objectColor} - ${objectWheels}`;
        }
      }

      // width x height color style wheels
      if (
        window.location.pathname === "/hush-screen-office-partition/" &&
        ($('label[data-rect-type="Window Style"]').length ||
          $('label[data-select-type="Window Style"]').length)
      ) {
        productData = `${objectWidth} x ${objectHeight} ${objectColor} - ${objectWindowStyle} - Yes`;
      } else {
        // width x height color style wheels
        if (
          ($('label[data-rect-type="Wheels"]').length ||
            $('label[data-select-type="Wheels"]').length) &&
          ($('label[data-rect-type="Window Style"]').length ||
            $('label[data-select-type="Window Style"]').length)
        ) {
          productData = `${objectWidth} x ${objectHeight} ${objectColor} - ${objectWindowStyle} - ${objectWheels}`;
        }
      }

      if (
        $("#form-field-colors").length &&
        ($('label[data-rect-type="Window Type"]').length ||
          $('label[data-select-type="Window Type"]').length)
      ) {
        // eslint-disable-next-line eqeqeq
        if (objectHeight != null && objectHeight.includes("W/ Window")) {
          productData = `${objectWidth} x ${objectHeight} ${objectColor} - ${objectWindowType}`;
        } else {
          productData = `${objectWidth} x ${objectHeight} ${objectColor}`;
        }

        if ($('input[name="product_sku"][value="HPCable"]').length) {
          productData += " Yes";
        }
      }

      // eslint-disable-next-line eqeqeq
      if (objectHeight != null && objectHeight.includes("W/ Window")) {
        $('label[data-rect-type="Window Type"]').parent().show();
        if ($('label[data-select-type="Window Type"]').length) {
          $('label[data-select-type="Window Type"]').parent().show();
        }
      } else {
        $('label[data-rect-type="Window Type"]').parent().hide();
        if ($('label[data-select-type="Window Type"]').length) {
          $('label[data-select-type="Window Type"]').parent().hide();
        }
      }

      // eslint-disable-next-line eqeqeq
      if (
        ($('label[data-rect-type="Size"]').length ||
          $('label[data-select-type="Size"]').length) &&
        $(".accordion-color-selector").length > 0
      ) {
        productData = `${objectSize} ${objectColor}`;
      }

      if (
        ($('label[data-select-type="Style"]').length ||
          $('label[data-rect-type="Style"]').length) &&
        ($('label[data-rect-type="Size"]').length ||
          $('label[data-select-type="Size"]').length) &&
        $(".accordion-color-selector").length > 0
      ) {
        productData = `${objectSize} - ${objectStyle} - ${objectColor}`;
      }

      if (
        ($('label[data-rect-type="Surface Type"]').length ||
          $('label[data-select-type="Surface Type"]').length) &&
        $(".accordion-color-selector").length > 0
      ) {
        productData = `${objectSurfaceType} ${objectColor}`;
      }

      if (
        ($('label[data-rect-type="Finish"]').length ||
          $('label[data-select-type="Finish"]').length) &&
        $(".accordion-color-selector").length > 0
      ) {
        productData = `${objectFinish} ${objectColor}`;
      }

      if (
        ($('label[data-rect-type="Size"]').length ||
          $('label[data-select-type="Size"]').length) &&
        ($('label[data-rect-type="Finish"]').length ||
          $('label[data-select-type="Finish"]').length) &&
        $(".accordion-color-selector").length > 0
      ) {
        productData = `${objectSize} ${objectColor} - ${objectFinish}`;
      }

      if (
        ($('label[data-rect-type="Size"]').length ||
          $('label[data-select-type="Size"]').length) &&
        ($('label[data-rect-type="Pattern"]').length ||
          $('label[data-select-type="Pattern"]').length)
      ) {
        productData = `${objectSize} ${objectPattern} ${objectColor}`;
      }

      if (
        ($('label[data-rect-type="Width"]').length ||
          $('label[data-select-type="Width"]').length) &&
        ($('label[data-rect-type="Height"]').length > 0 ||
          $('label[data-select-type="Height"]').length > 0) &&
        ($('label[data-rect-type="Type"]').length > 0 ||
          $('label[data-select-type="Type"]').length > 0)
      ) {
        productData = `${objectWidth} x ${objectHeight} - ${objectType} - ${objectColor}`;
      }

      if (
        ($('label[data-rect-type="Size"]').length ||
          $('label[data-select-type="Size"]').length) &&
        ($('label[data-rect-type="Roof Color"]').length ||
          $('label[data-select-type="Roof Color"]').length > 0)
      ) {
        productData = `${objectSize} - ${objectRoofColor}`;
      }

      if (
        $('label[data-rect-type="Height"]').length ||
        $('label[data-select-type="Height"]').length
      ) {
        const doorItems = $('label[data-rect-type="Door"]').parent().children();
        if (objectHeight === "7'") {
          Array.from(doorItems).forEach((doorItem) => {
            if (
              doorItem.children[0].outerText === "Left Swing Door" ||
              doorItem.children[0].outerText === "Right Swing Door"
            ) {
              doorItem.classList.add("disabled");
            }
            if (doorItem.children[0].outerText === "Accordion Door") {
              doorItem.click();
            }
          });
        }
        if (objectHeight === "8'") {
          Array.from(doorItems).forEach((doorItem) => {
            if (
              doorItem.children[0].outerText === "Left Swing Door" ||
              doorItem.children[0].outerText === "Right Swing Door"
            ) {
              doorItem.classList.remove("disabled");
            }
          });
        }
        if (specialSkus.includes(productSku)) {
          const trimItems = $('label[data-rect-type="Trim"]')
            .parent()
            .children();
          if (
            objectHeight === "6'" ||
            objectHeight === '70"' ||
            objectHeight === '70" W/ Window' ||
            objectHeight === "5'10\""
          ) {
            Array.from(trimItems).forEach((trimItem) => {
              if (trimItem.children[0].outerText === "White") {
                trimItem.classList.remove("disabled");
              }
            });
          } else {
            Array.from(trimItems).forEach((trimItem) => {
              if (trimItem.children[0].outerText === "White") {
                trimItem.classList.add("disabled");
              }
              if (trimItem.children[0].outerText === "Black") {
                trimItem.click();
              }
            });
          }
        }
      }

      if (
        ($('label[data-rect-type="Width"]').length ||
          $('label[data-select-type="Width"]').length) &&
        ($('label[data-rect-type="Depth"]').length ||
          $('label[data-select-type="Depth"]').length) &&
        ($('label[data-rect-type="Height"]').length ||
          $('label[data-select-type="Height"]').length) &&
        ($('label[data-rect-type="Color"]').length ||
          $('label[data-select-type="Color"]').length)
      ) {
        productData = `${objectWidth} x ${objectDepth} x ${objectHeight}  ${objectColor}`;
      }

      if (
        $('label[data-rect-type="Leg Color"]').length ||
        $('label[data-select-type="Leg Color"]').length
      ) {
        productData = `${productData} - ${objectLegColor}`;
      }

      if (
        $('label[data-rect-type="Electric Channel"]').length ||
        $('label[data-rect-type="Electric"]').length ||
        $('label[data-select-type="Electric Channel"]').length ||
        $('label[data-select-type="Electric"]').length
      ) {
        productData = `${productData} ${objectElectric}`;
      }

      if (
        $('label[data-rect-type="Door"]').length ||
        $('label[data-select-type="Door"]').length
      ) {
        productData = `${productData} - ${objectDoor}`;
      }

      if (
        $('label[data-rect-type="Trim"]').length ||
        $('label[data-select-type="Trim"]').length ||
        $('label[data-rect-type="Trim Color"]').length ||
        $('label[data-select-type="Trim Color"]').length
      ) {
        productData = `${productData} - ${objectTrim}`;
      }

      console.log("productData", productData);

      for (let i = 0; i < objectData.length; i++) {
        const mainLabel = objectData[i].label;
        // eslint-disable-next-line no-useless-concat
        const lastIndex = mainLabel
          .replace(new RegExp("&" + "#" + "x27;", "g"), "'")
          .replace(new RegExp("&quot;", "g"), '"')
          .lastIndexOf(" - ");

        if (
          mainLabel
            .replace(new RegExp("&" + "#" + "x27;", "g"), "'")
            .replace(new RegExp("&quot;", "g"), '"') === productData
        ) {
          return [objectData[i].data, productData];
        }

        if (
          window.location.pathname === "/hush-screen-office-partition/" &&
          mainLabel
            .replace(new RegExp("&" + "#" + "x27;", "g"), "'")
            .replace(new RegExp("&quot;", "g"), '"')
            .slice(0, lastIndex) === productData
        ) {
          return [objectData[i].data, productData];
        }
      }

      if (
        window.location.pathname ===
          "/dividewrite-mobile-whiteboard-partition/" ||
        window.location.pathname === "/hush-screen-office-partition/"
      ) {
        objectHeight = "6'";
      }

      return null;
    };

    $(".rectangle-item, .form-select").on("click", (e) => {
      $(e.target).siblings().removeClass("active-rectangle");
      $(e.target).addClass("active-rectangle");
      $(".child-sku-wrapper").hide();
      $(".child-sku").text("");
      let info = $(e.target).children(".form-option-variant").text();
      let dimension = $(e.target).siblings(".form-label").text();
      if (e.target.tagName === "SELECT") {
        info = e.target.options[e.target.selectedIndex].text;
      }
      if (e.target.tagName === "OPTION") {
        info = e.target.text;
        dimension = $(e.target).parent().siblings(".form-label").text();
      }
      if (e.target.tagName === "SPAN") {
        info = e.target.querySelector(".form-option-variant").innerText;
        dimension = e.target
          .closest(".form-field")
          .querySelector(".form-label")
          .getAttribute("data-rect-type");
      }
      $(".productView-price-notice").show();
      $(".price-section .price.price--withoutTax.price-custom").text(
        "Select options for price"
      );

      if (dimension.match("Width")) {
        objectWidth = info;
        this.disabledButtons($(e.target).find(".form-option-variant").text());
      }
      if (dimension.match("Height")) {
        objectHeight = info;
      }
      if (dimension.match("Depth")) {
        objectDepth = info;
      }

      if ($(e.target).hasClass("form-option-swatch")) {
        objectColor = $(e.target).find("span").attr("title");
        $("#form-field-colors .swatch-header-btn").trigger("click");
      }
      if (
        $(e.target).siblings(".form-label").is('[data-select-type="Color"]')
      ) {
        objectColor = $(e.target).find(":selected").text();
      }
      if ($(e.target).siblings(".form-label").is('[data-rect-type="Color"]')) {
        objectColor = $(e.target).find(".form-option-variant").text();
      }

      if (dimension.match("Foot Style")) {
        objectFoot = info;
      }
      if (dimension.match("Wheels")) {
        objectWheels = info;
      }
      if (dimension.match("Window Style")) {
        objectWindowStyle = info;
      }
      if (dimension.match("Type")) {
        objectType = info;
      }
      if (dimension.match("Window Type")) {
        objectWindowType = info;
      }
      if (dimension.match("Style")) {
        objectStyle = info;
      }
      if (dimension.match("Size")) {
        objectSize = info;
      }
      if (dimension.match("Cable Channel")) {
        objectElectric = info;
      }
      if (dimension.match("Pattern")) {
        objectPattern = info;
      }
      if (dimension.match("With Flooring")) {
        objectWithFlooring = info;
      }
      if (dimension.match("Panels")) {
        objectPanels = info;
      }
      if (dimension.match("Mounting")) {
        objectMounting = info;
      }
      if (dimension.toLowerCase().includes("Electric".toLowerCase())) {
        objectElectric = info;
      }
      if (dimension.match("Door")) {
        objectDoor = info;
      }
      if (dimension.match("Trim")) {
        objectTrim = info;
      }
      if (dimension.match("Roof Color")) {
        objectRoofColor = info;
      }
      if (dimension.match("Surface Type")) {
        objectSurfaceType = info;
      }
      if (dimension.match("Finish")) {
        objectFinish = info;
      }
      if (dimension.match("Leg Color")) {
        objectLegColor = info;
      }

      if (dimension.match("Protection")) {
        objectProtection = info;
      }

      // eslint-disable-next-line no-shadow
      const productSku = returnParameters();
      const targetList = $('[data-product-attribute="product-list"] input');
      if (productSku !== null) {
        targetList.each((index, val) => {
          // eslint-disable-next-line eqeqeq
          if ($(`label[for="${$(val).attr("id")}"]`).text() == productSku[1]) {
            $(".productView-price-notice").hide();
            $(`label[for="${$(val).attr("id")}"]`).click();
            $(".addtocart-wrapper").removeClass("disabled");

            let productId = $(`input[id="${$(val).attr("id")}"]`).attr(
              "data-product-attribute-pid"
            );
            if ($('input[name="product_type"][value="HushPanel"]').length) {
              // $('[name="product_id"]').val(productId);
            }
            if (!productId)
              productId = document.querySelector(
                'input[name="product_id"]'
              ).value;

            fetch("/graphql", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.context.sf_api_key}`,
              },
              body: JSON.stringify({
                query: `
                    query SingleProduct {
                        site {
                        product(entityId: ${productId}) {
                            entityId
                            name
                            sku
                            defaultImage {
                                url320wide: url(width: 320)
                                url640wide: url(width: 640)
                                url960wide: url(width: 960)
                                url1280wide: url(width: 1280)
                            }
                            availabilityV2 {
                                description
                            }
                        }
                        }
                    }
                    `,
              }),
            })
              .then((res) => res.json())
              .then((json) => {
                if (json.data.site.product != null) {
                  // console.log(json.data.site.product);
                  const sku = json.data.site.product.sku;
                  $(".child-sku-wrapper").show();
                  $(".child-sku").text(sku);
                  if (json.data.site.product.availabilityV2) {
                    $(".productView-info-value--availability").text(
                      json.data.site.product.availabilityV2.description
                    );
                  }
                  if (json.data.site.product.defaultImage !== null) {
                    if (
                      json.data.site.product.defaultImage.url320wide !==
                      undefined
                    ) {
                      const srcString = `${json.data.site.product.defaultImage.url320wide} 320w, ${json.data.site.product.defaultImage.url640wide} 640w, ${json.data.site.product.defaultImage.url960wide} 960w, ${json.data.site.product.defaultImage.url1280wide} 1280w`;

                      $("figure.productView-image").attr(
                        "data-zoom-image",
                        json.data.site.product.defaultImage.url1280wide
                      );
                      $("figure.productView-image a").attr(
                        "href",
                        json.data.site.product.defaultImage.url1280wide
                      );
                      $("figure.productView-image img").attr(
                        "src",
                        json.data.site.product.defaultImage.url1280wide
                      );
                      $("figure.productView-image img").attr(
                        "srcset",
                        srcString
                      );
                      $("figure.productView-image img").attr(
                        "data-srcset",
                        srcString
                      );
                      this.productDetails.setZoom({
                        mainImageSrcset: srcString,
                        mainImageUrl:
                          json.data.site.product.defaultImage.url1280wide,
                        zoomImageUrl:
                          json.data.site.product.defaultImage.url1280wide,
                      });
                    }
                  }
                } else {
                  $(".child-sku-wrapper").hide();
                  $(".child-sku").text("");
                }
              });
          }
        });
      } else {
        $(".addtocart-wrapper").addClass("disabled");
      }
    });

    $(".form-select").on("change", (e) => {
      $(e.target).trigger("click");
    });
    // dynamic product specs ends

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // eslint-disable-next-line eqeqeq
        if (mutation.type == "attributes") {
          mutation.target.removeAttribute("disabled");
          if (document.querySelector(".button--changes")) {
            document
              .querySelector('.button--changes[data-action="dec"]')
              .removeAttribute("disabled");
            document
              .querySelector(".form-input--incrementTotal")
              .removeAttribute("disabled");
            document
              .querySelector('.button--changes[data-action="inc"]')
              .removeAttribute("disabled");
          }
        }
      });
    });

    observer.observe(document.getElementById("form-action-addToCart"), {
      attributes: true,
    });

    // active colored people

    const person = document.querySelectorAll(".model-p-people img");
    $(person).bind("touchstart click", (e) => {
      $(e.target).addClass("colored-active");
      $(e.target).siblings().removeClass("colored-active");
    });

    // integration of model into carousel

    $(".productView-thumbnail-link").click(() => {
      if ($(".product-model-p").hasClass("is-active")) {
        $(".model-p-container").removeClass("inactive-model");
        $(".standard-container").addClass("inactive-model");
      } else {
        $(".standard-container").removeClass("inactive-model");
        $(".model-p-container").addClass("inactive-model");
      }
    });

    // color swatch - panel background functionality

    const swatch = document.querySelectorAll(".form-option-swatch");
    $(swatch).on("touchstart click", (e) => {
      const color = $(e.target).find("span").css("background-color");
      const image = $(e.target)
        .find("span")
        .css("background-image")
        .replace("222x222", "22x22");
      const label = $(e.target).next("div").text();
      // changes to selected color
      if (color) {
        $(".upper").css("background-color", color);
        $(".lower").css("background-color", color);
        $(".upper-long").css("background-color", color);
        $(".lower-long").css("background-color", color);
        $(".chosen-swatch").addClass("active-swatch");
        $(".chosen-swatch").css("background-color", color);
        $(".chosen-color").text(label);
      }

      // changes to selected image and/or pattern
      if (image) {
        $(".upper").css("background-image", image);
        $(".lower").css("background-image", image);
        $(".upper-long").css("background-image", image);
        $(".lower-long").css("background-image", image);
        $(".chosen-swatch").addClass("active-swatch");
        $(".chosen-swatch").css("background-image", image);
        $(".chosen-color").text(label);
      }
    });
    // pdp model page end

    const colorInfo = $(".form-option-swatch");
    $(colorInfo).each((index, targetelm) => {
      const colorType = $(targetelm).children("span").attr("title");
      // adding the colors in their individual category locations
      if (colorType.match("Tile")) {
        $("#tileSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Laminate")) {
        $("#laminateSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Fabric")) {
        $("#fabricSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Polyester")) {
        $("#polyesterSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Polycarbonate")) {
        $("#polycarbonateSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Design")) {
        $("#designSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Canvas")) {
        $("#canvasSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Wicker")) {
        $("#wickerSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Steel")) {
        $("#steelSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Aluminum")) {
        $("#aluminumSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Plastic")) {
        $("#plasticSwatch").append($(targetelm).parent());
      }
      if (colorType.match("FRP")) {
        $("#frpSwatch").append($(targetelm).parent());
      }
      if (colorType.match("High Density Polyester")) {
        $("#hdPolyesteSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Wood Grain")) {
        $("#woodGrainSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Window")) {
        $("#windowSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Olefin Color")) {
        $("#olefinSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Block")) {
        $("#blockSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Desktop Color")) {
        $("#desktopColorSwatch").append($(targetelm).parent());
      }
      if (colorType.match("Desktop")) {
        $("#desktopSwatch").append($(targetelm).parent());
      }
    });

    $(".accordion-color-selector:not(:first)").remove();
    // checking if any colors exist for category - hide category if not
    const allz = document.querySelectorAll(".swatch-cont-titles");
    // if ($(allz).siblings('.label-color-container').length > 0) {
    // }
    // eslint-disable-next-line no-unused-vars
    let failCounter = 0;

    $(allz).each((index, targetelm) => {
      if ($(targetelm).siblings().length === 0) {
        $(targetelm).hide();
        $(targetelm).parent(".swatch-container").addClass("no-use").hide();
        failCounter++;
      }
    });

    $(allz).each((index, targetelm) => {
      if (!$(targetelm).parent(".swatch-container").hasClass("no-use")) {
        $(targetelm)
          .parent(".swatch-container")
          .find(".swatch-cont-titles")
          .trigger("click");
        // return false;
      }
    });

    let prevScroll = window.pageYOffset;
    $(window).scroll((e) => {
      const widget = $(".desktop--widget");
      const reviewEl = $("#reviews-info");
      const reviewElOffset = $("#reviews-info").offset();
      const desktopEl = $("#desktop--title");
      if (
        widget !== undefined &&
        reviewEl !== undefined &&
        desktopEl !== undefined &&
        reviewElOffset !== undefined
      ) {
        if (window.pageYOffset > prevScroll) {
          if (
            widget.offset().top +
              widget.height() +
              $("#desktop--title").height() <
            $("#reviews-info").offset().top
          ) {
            widget.css("top", $(e.target).scrollTop() + $(".header").height());
          } else {
            widget.css(
              "top",
              $("#reviews-info").offset().top -
                widget.height() -
                $("#desktop--title").height()
            );
            widget.addClass("stopped");
          }
        } else if (
          window.pageYOffset === prevScroll &&
          window.pageYOffset !== 0
        ) {
          widget.css(
            "top",
            $("#reviews-info").offset().top -
              widget.height() -
              $("#desktop--title").height()
          );
          widget.addClass("stopped");
        } else if (widget.offset().top >= $(".productView").offset().top) {
          if (widget.hasClass("stopped")) {
            if (
              $(e.target).scrollTop() <
              $("#reviews-info").offset().top -
                widget.height() -
                $(".productView").offset().top
            ) {
              widget.css(
                "top",
                $(e.target).scrollTop() + $(".header").height()
              );
              widget.removeClass("stopped");
            }
          } else {
            widget.css("top", $(e.target).scrollTop() + $(".header").height());
          }
        }
        prevScroll = window.pageYOffset;
      }
    });

    $(window).trigger("scroll");

    $(".tabs .tab").on("click", () => {
      setTimeout(() => {
        $(window).trigger("scroll");
      }, 100);
    });

    if ($("#designSwatch").css("display") === "flex") {
      $("#cp-btn").css("display", "block");
    }

    const urlVars = this.getUrlVars();
    const urlKeys = Object.keys(urlVars);
    if (urlKeys.length) {
      this.preSelect(urlVars, this);
    }

    if (
      !document.querySelector("div[data-product-option-change]")
        .childElementCount
    ) {
      $(".addtocart-wrapper").removeClass("disabled");
    }

    
     //Check if there is only one choice
     var waitForElements = setInterval(() => {
      const selectColor = document.querySelector(".select-color");
      const swatches = document.querySelectorAll(".swatch-container:not(.no-use)"); 
      if(selectColor && swatches.length) {
        clearInterval(waitForElements);
          const checkSwatchs = document.querySelectorAll(".swatch-container .label-color-container");
          if(checkSwatchs.length == 1) {
            selectColor.click();
            swatches.forEach(swatch => {
              const swatchColor = swatch.querySelector('.form-option')
              swatchColor.click();
            })
          }
      }
    }, 1000)
  }

  getUrlVars() {
    const vars = {};
    // eslint-disable-next-line no-unused-vars
    const parts = window.location.href.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      (m, key, value) => {
        vars[key] = value;
      }
    );
    return vars;
  }

  preSelect(urlVars, obj) {
    for (const [key, value] of Object.entries(urlVars)) {
      const targetKey = $(
        `label[data-rect-type="${this.attrRebuild(decodeURI(key))}"]`
      );
      if (targetKey.length === 0) {
        const targetKeySelect = $(
          `label[data-select-type="${this.attrRebuild(decodeURI(key))}"]`
        );
        targetKeySelect
          .find("~ .form-select option")
          .filter(
            (index, targetElm) =>
              $(targetElm).text().toLowerCase() ===
              obj.valRebuild(decodeURI(value)).toLowerCase()
          )
          .attr("selected", "selected")
          .click();
      } else if (!targetKey.next().hasClass("select-color")) {
        targetKey
          .find("~ .rectangle-item .form-option-variant")
          .filter(
            (index, targetElm) =>
              $(targetElm).text().toLowerCase() ===
              obj.valRebuild(decodeURI(value)).toLowerCase()
          )
          .parent()
          .click();
      } else {
        targetKey
          .parent()
          .parent()
          .find("span[title]")
          .filter(
            (index, targetElm) =>
              $(targetElm).attr("title").toLowerCase() ===
              obj.valRebuild(decodeURI(value)).toLowerCase()
          )
          .parent()
          .click();
        $("#form-field-colors .swatch-header-btn").trigger("click");
      }
    }
  }

  attrRebuild(str) {
    str = str.replace("-", " ");
    str = str.replace("%2F", "/");
    return str.replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
  }

  valRebuild(str) {
    str = str.replace("%2F", "/");
    return str.replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
  }

  disabledButtons(buttonText) {
    const isSSAP = $('input[name="product_sku"][value="HDAP"]').length;
    const isCPRD = $('input[name="product_sku"][value="CPRD360"]').length;

    const lineArray = [];
    $(".productOptions-list-item label").each((index, item) => {
      lineArray.push(item.innerText);
    });

    // eslint-disable-next-line eqeqeq
    const lineArray2 = lineArray.filter(
      (itm) => itm.substring(0, buttonText.length) == buttonText
    );
    $('label[data-rect-type="Height"]')
      .parent()
      .find(".rectangle-item")
      .each((index, button) => {
        let lineArray3 = "";
        if (isSSAP) {
          lineArray3 = lineArray2.filter((itm) =>
            itm.includes(`${buttonText} x ${button.innerText} High`)
          );
        } else if (isCPRD) {
          lineArray3 = lineArray2.filter((itm) =>
            itm.includes(`${buttonText} x ${button.innerText} Your`)
          );
        } else {
          lineArray3 = lineArray2.filter((itm) =>
            itm.includes(button.innerText.trim())
          );
        }
        if (lineArray3.length === 0) {
          button.classList.add("disabled");
          button.classList.remove("active-rectangle");
          $(".productView-price-notice").show();
          $(".price-section .price.price--withoutTax.price-custom").text(
            "Select options for price"
          );
        } else {
          button.classList.remove("disabled");
        }
      });

    // eslint-disable-next-line eqeqeq
    if ($('[data-product-attribute="product-list"] input:checked').val() == 0) {
      $(".productView-price-notice").show();
      $(".price-section .price.price--withoutTax.price-custom").text(
        "Select options for price"
      );
    }
  }

  productReviewHandler() {
    if (this.url.indexOf("#write_review") !== -1) {
      this.$reviewLink.trigger("click");
    }
  }

  bulkPricingHandler() {
    if (this.url.indexOf("#bulk_pricing") !== -1) {
      this.$bulkPricingLink.trigger("click");
    }
  }

  relatedProductsPricing() {
    // currency formatter
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

    const relatedProductUI = document.querySelectorAll("[data-related-id]");
    const { relatedProducts } = this.context;
    relatedProductUI.forEach((product) => {
      const item = document.querySelector(
        `[data-related-id="${product.getAttribute(
          "data-related-id"
        )}"] .price.price--withoutTax`
      );
      const customFields = relatedProducts.filter(
        (related) =>
          related.id === Number(product.getAttribute("data-related-id"))
      )[0];
      if (
        customFields?.custom_fields?.filter(
          (field) => field.name === "StartingAtPrice"
        ).length
      ) {
        item.textContent = formatter.format(
          customFields.custom_fields.filter(
            (field) => field.name === "StartingAtPrice"
          )[0].value
        );
      }
    });
  }
}
