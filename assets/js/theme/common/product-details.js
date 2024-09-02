import utils from '@bigcommerce/stencil-utils';
import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.reveal';
import ImageGallery from '../product/image-gallery';
import modalFactory, { showAlertModal } from '../global/modal';
import _ from 'lodash';
import Wishlist from '../wishlist';

export default class ProductDetails {
    constructor($scope, context, productAttributesData = {}) {
        this.$overlay = $('[data-cart-item-add] .loadingOverlay');
        this.$scope = $scope;
        this.context = context;
        this.imageGallery = new ImageGallery($('[data-image-gallery]', this.$scope));
        this.imageGallery.init();
        this.listenQuantityChange();
        this.initRadioAttributes();
        Wishlist.load(this.context);
        this.getTabRequests();
        this.swatchSwitch();
        
        // let previewModal = null;
        const $form = $('form[data-cart-item-add]', $scope);
        const $productOptionsElement = $('[data-product-option-change]', $form);
        const $childSkuElement = $('.child-sku');
        const $checkboxElement = $('[data-product-attribute="input-checkbox"]', $form);

        const hasOptions = $productOptionsElement.html().trim().length;
        const hasDefaultOptions = $productOptionsElement.find('[data-default]').length;
        let isHushPanel = false;
        if($('input[name="product_sku"][value="HP"]').length || $('input[name="product_sku"][value="HPCable"]').length || $('input[name="product_type"][value="HushPanel"]').length){
            isHushPanel = true;
        };
        $checkboxElement.on('change', event => {
            console.log(event);
            setTimeout(()=> {
                this.productOptionsChanged(event);
                this.setProductVariant();
            }, 500);
        });

        $productOptionsElement.on('click', event => {
            if (($childSkuElement.text() !== null && $childSkuElement.text() !== '') || isHushPanel === true) {
                this.productOptionsChanged(event);
                this.setProductVariant();
            }
        });

        let childSku = document.querySelectorAll('.child-sku-wrapper'),
        options = {
            attributes: true
        },
        observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
                if (mutation.type === 'attributes') {
                    $productOptionsElement.trigger('click');
                }
            }
        });
        
        if (childSku !== undefined && childSku !== null && childSku.length > 0) {
            observer.observe(childSku[0], options);
        }

        $form.on('submit', event => {
            this.addProductToCart(event);
        });

        // Update product attributes. Also update the initial view in case items are oos
        // or have default variant properties that change the view
        if ((_.isEmpty(productAttributesData) || hasDefaultOptions) && hasOptions) {
            const $productId = $('[name="product_id"]', $form).val();
            utils.api.productAttributes.optionChange($productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
                const attributesData = response.data || {};
                const attributesContent = response.content || {};
                this.updateProductAttributes(attributesData);
                if (hasDefaultOptions) {
                    this.updateView(attributesData, attributesContent);
                } else {
                    this.updateDefaultAttributesForOOS(attributesData);
                }
            });
        } else {
            this.updateProductAttributes(productAttributesData);
        }

        $productOptionsElement.show();

        this.previewModal = modalFactory('#previewModal')[0];

        if (isHushPanel) {
            this.hushPanelSetup();
            $('div .form-field--increments').css('display', 'none');
            $('label.form-label.form-label--alternate.addtocart-qty-label').css('display', 'none');
            //$('.form-action.form-cart--changes').css('width', '100%');
            $('input#form-action-addToCart').css('width', '100%');
        }
    }

    swatchSwitch(){
        $('.swatch-cont-titles').on('click', function(e){
            $(this).closest('.swatch-container').find('.label-color-container').toggle();
            $(this).find('.swatch-switch').attr('aria-label', (index, attr) =>{
                return attr == 'open' ? 'closed' : 'open';
            });
        });
    }
    
    setZoom(imgObj) {
        this.imageGallery.currentImage = imgObj;
        this.imageGallery.swapMainImage();
    }

    hushPanelSetup() {
        const priceSpan = document.createElement('span');
        priceSpan.className += 'price price--withoutTax price-custom';
        document.querySelector('.productView-details .price-now-label').parentNode.insertBefore(priceSpan, document.querySelector('.productView-details .price-now-label').nextSibling);
        
        // Posts price span 
        const subPriceSpan = document.createElement('span');
        subPriceSpan.className += 'price price--withoutTax price-sub';
        $('label:contains("# of Posts")')[0].nextSibling.parentNode.insertBefore(subPriceSpan, $('label:contains("# of Posts")')[0].nextSibling);

        // Brackets price span
        const bracketPriceSpan = document.createElement('span');
        bracketPriceSpan.className += 'price price--withoutTax price-brackets';
        $('label:contains("# of Wall-Mount Brackets")')[0].nextSibling.parentNode.insertBefore(bracketPriceSpan, $('label:contains("# of Wall-Mount Brackets")')[0].nextSibling);

        let panelSelector = $('label:contains("# of Panels") ~ select');
        if (panelSelector.length === 0) {
            panelSelector = $('label:contains("# of Panels") ~ .rectangle-item');
            panelSelector.on('click', () => {
                setTimeout(()=> {
                    this.rerunMath();
                }, 500);
            });
        }
        let postSelector = $('label:contains("# of Posts") ~ select');
        if (postSelector.length === 0) {
            postSelector = $('label:contains("# of Posts") ~ .rectangle-item');
            postSelector.on('click', () => {
                setTimeout(()=> {
                    this.postMath();
                }, 500);
            });
        }
        let bracketSelector = $('label:contains("# of Wall-Mount Brackets") ~ select');
        if (bracketSelector.length === 0) {
            bracketSelector = $('label:contains("# of Wall-Mount Brackets") ~ .rectangle-item');
            bracketSelector.on('click', () => {
                setTimeout(()=> {
                    this.bracketMath();
                }, 500);
            });
        }

        priceSpan.innerHTML = $('.productView-details span[data-product-price-without-tax]').text();
        subPriceSpan.innerHTML = '+ $0.00';
        bracketPriceSpan.innerHTML = '+ $0.00';
        $('.productView-details span[data-product-price-without-tax]').attr('data-base-price', $('.productView-details span[data-product-price-without-tax]').text().replace('$', ''));
        panelSelector.on('change', () => {
            this.rerunMath();
        });

        postSelector.on('change', () => {
            this.postMath();
        });

        bracketSelector.on('change', () => {
            this.bracketMath();
        });

        $('div[data-product-attribute="product-list"] input[type="radio"]').on('change', () => {
            const target = document.querySelector('.productView-options [data-product-price-without-tax]');
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        setTimeout(() => {
                            this.rerunMath(true);
                        }, 300);
                        //observer.disconnect();
                    }
                });
            });
            const config = { characterData: true, attributes: false, childList: true, subtree: false };
            observer.observe(target, config);

            // Facebook DPA
            const childPid = $('div[data-product-attribute="product-list"] input[type="radio"]:checked').attr('data-product-attribute-pid');
            const productViewEvent = new CustomEvent('productView', { detail: parseInt(childPid, 10) });
            document.dispatchEvent(productViewEvent);
        });

        $('[data-rect-type="Width"] ~ span.rectangle-item').on('click', () => {
            setTimeout(() => { this.postMath(); }, 300);
        });

        $('[data-rect-type="Height"] ~ span.rectangle-item').on('click', () => {
            setTimeout(() => { this.bracketMath(); }, 300);
        });

        $('[data-select-type="Width"] ~ select').on('click', () => {
            setTimeout(() => { this.postMath(); }, 300);
        });

        $('[data-select-type="Height"] ~ select').on('click', () => {
            setTimeout(() => { this.bracketMath(); }, 300);
        });
    }

    rerunMath(resetBase = false) {
        const priceWrapper = $('.productView-details span[data-product-price-without-tax]');
        const priceItem = $('.productView-details .price-custom');
        let panelNumber = parseInt($('label:contains("# of Panels") + select option:selected').text(), 10);

        if ($('label:contains("# of Panels") + select option:selected').length === 0) {
            panelNumber = parseInt($('label:contains("# of Panels") ~ .rectangle-item.active-rectangle .form-option-variant').text(), 10);
        }
        
        if (resetBase) {
            priceWrapper.attr('data-base-price', $('.productView-details span[data-product-price-without-tax]').text().replace('$', ''));
        } 

        const basePrice = parseInt($('.productView-details span[data-product-price-without-tax]').attr('data-base-price'), 10);
        if (!isNaN(panelNumber)) {
            priceItem.text(`$${panelNumber * basePrice}.00`);
        } else {
            priceItem.text(`$${basePrice}.00`);
        }
    }

    postMath() {
        const subPriceSpan = document.querySelector('.price-sub');
        // const heightItem = $('label[data-rect-type="Height"] ~ .active-rectangle .form-option-variant').text().charAt(0);
        const heightItem = 6;
        let postCount = parseInt($('label:contains("# of Posts") ~ select').find('option:selected').text(), 10);
        if ($('label:contains("# of Posts") ~ select').length === 0) {
            postCount = parseInt($('label:contains("# of Posts") ~ .rectangle-item.active-rectangle .form-option-variant').text(), 10);
        }
        let newTotal = 0;

        if (isNaN(postCount)) {
            postCount = 0;
        }

        if (parseInt(heightItem, 10) === 4) {
            newTotal = (33 * postCount);
        } else if (parseInt(heightItem, 10) === 6) {
            const pricePer = ($('input[name="product_sku"][value="HPCable"]').length) ? 50 : 46;
            newTotal = (pricePer * parseInt(postCount, 10));
        } else {
            newTotal = 0;
        }
        subPriceSpan.innerHTML = `+ $${newTotal}.00`;
    }

    bracketMath() {
        const bracketPriceSpan = document.querySelector('.price-brackets');
        const heightItem = 6;
        let bracketCount = parseInt($('label:contains("# of Wall-Mount Brackets") ~ select').find('option:selected').text(), 10);
        if ($('label:contains("# of Wall-Mount Brackets") ~ select').length === 0) {
            bracketCount = parseInt($('label:contains("# of Wall-Mount Brackets") ~ .rectangle-item.active-rectangle .form-option-variant').text(), 10);
        }
        let newTotal = 0;

        if (isNaN(bracketCount)) {
            bracketCount = 0;
        }
        if (parseInt(heightItem, 10) === 4) {
            newTotal = (56 * bracketCount);
        } else if (parseInt(heightItem, 10) === 6) {
            newTotal = (56 * bracketCount);
        } else {
            newTotal = 0;
        }

        bracketPriceSpan.innerHTML = `+ $${newTotal}.00`;
    }

    /**
     * https://stackoverflow.com/questions/49672992/ajax-request-fails-when-sending-formdata-including-empty-file-input-in-safari
     * Safari browser with jquery 3.3.1 has an issue uploading empty file parameters. This function removes any empty files from the form params
     * @param formData: FormData object
     * @returns FormData object
     */
    filterEmptyFilesFromForm(formData) {
        try {
            for (const [key, val] of formData) {
                if (val instanceof File && !val.name && !val.size) {
                    formData.delete(key);
                }
            }
        } catch (e) {
            console.error(e); // eslint-disable-line no-console
        }
        return formData;
    }

    setProductVariant() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-product-attribute]'), (index, value) => {
            const optionLabel = value.children[0].innerText;
            const optionTitle = optionLabel.split(':')[0].trim();
            const required = optionLabel.toLowerCase().includes('required');
            const type = value.getAttribute('data-product-attribute');

            if ((type === 'input-file' || type === 'input-text' || type === 'input-number') && value.querySelector('input').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0);

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select')).map((x) => x.value).join('-');
                    options.push(`${optionTitle}:${dateString}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select');
                const selectedIndex = select.selectedIndex;

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'product-list') {
                const checked = value.querySelector(':checked');
                if (checked) {
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'product-list') {
                        let label = false;
                        if (checked.labels) {
                            label = checked.labels[0].innerText;
                        }
                        if (label) {
                            options.push(`${optionTitle}:${label}`);
                        }
                    }

                    if (type === 'swatch') {
                        const label = checked.labels[0].children[0];
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`);
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`);
                    }

                    return;
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`);
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }
        });

        let productVariant = unsatisfiedRequiredFields.length === 0 ? options.sort().join(', ') : 'unsatisfied';
        const view = $('.productView');

        if (productVariant) {
            productVariant = productVariant === 'unsatisfied' ? '' : productVariant;
            if (view.attr('data-event-type')) {
                view.attr('data-product-variant', productVariant);
            } else {
                const productName = view.find('.productView-title')[0].innerText;
                const card = productName.at(-1) === '"' ? $(`[data-name='${productName}']`)
                           : $(`[data-name="${productName}"]`);
                card.attr('data-product-variant', productVariant);
            }
        }
    }

    /**
     * Since $productView can be dynamically inserted using render_with,
     * We have to retrieve the respective elements
     *
     * @param $scope
     */
    getViewModel($scope) {
        return {
            $priceWithTax: $('[data-product-price-with-tax]', $scope),
            $priceWithoutTax: $('[data-product-price-without-tax]', $scope),
            rrpWithTax: {
                $div: $('.rrp-price--withTax', $scope),
                $span: $('[data-product-rrp-with-tax]', $scope),
            },
            rrpWithoutTax: {
                $div: $('.rrp-price--withoutTax', $scope),
                $span: $('[data-product-rrp-price-without-tax]', $scope),
            },
            nonSaleWithTax: {
                $div: $('.non-sale-price--withTax', $scope),
                $span: $('[data-product-non-sale-price-with-tax]', $scope),
            },
            nonSaleWithoutTax: {
                $div: $('.non-sale-price--withoutTax', $scope),
                $span: $('[data-product-non-sale-price-without-tax]', $scope),
            },
            priceSaved: {
                $div: $('.price-section--saving', $scope),
                $span: $('[data-product-price-saved]', $scope),
            },
            priceNowLabel: {
                $span: $('.price-now-label', $scope),
            },
            priceLabel: {
                $span: $('.price-label', $scope),
            },
            $weight: $('.productView-info [data-product-weight]', $scope),
            $increments: $('.form-field--increments :input', $scope),
            $addToCart: $('#form-action-addToCart', $scope),
            $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
            stock: {
                $container: $('.form-field--stock', $scope),
                $input: $('[data-product-stock]', $scope),
            },
            sku: {
                $label: $('dt.sku-label', $scope),
                $value: $('[data-product-sku]', $scope),
            },
            upc: {
                $label: $('dt.upc-label', $scope),
                $value: $('[data-product-upc]', $scope),
            },
            quantity: {
                $text: $('.incrementTotal', $scope),
                $input: $('[name=qty\\[\\]]', $scope),
            },
            $bulkPricing: $('.productView-info-bulkPricing', $scope),
        };
    }

    /**
     * Checks if the current window is being run inside an iframe
     * @returns {boolean}
     */
    isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     *
     * Handle product options changes
     *
     */
    productOptionsChanged(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }

        utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
            const productAttributesData = response.data || {};
            const productAttributesContent = response.content || {};
            this.updateProductAttributes(productAttributesData);
            this.updateView(productAttributesData, productAttributesContent);
        });
    }

    showProductImage(image) {
        if (_.isPlainObject(image)) {
            const zoomImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.themeSettings.zoom_size },
                /*
                    Should match zoom size used for data-zoom-image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            );

            const mainImageUrl = utils.tools.imageSrcset.getSrcset(
                image.data,
                { '1x': this.context.themeSettings.product_size },
                /*
                    Should match fallback image size used for the main product image in
                    components/products/product-view.html

                    Note that this will only be used as a fallback image for browsers that do not support srcset

                    Also note that getSrcset returns a simple src string when exactly one size is provided
                */
            );

            const mainImageSrcset = utils.tools.imageSrcset.getSrcset(image.data);

            this.imageGallery.setAlternateImage({
                mainImageUrl,
                zoomImageUrl,
                mainImageSrcset,
            });
        } else {
            this.imageGallery.restoreImage();
        }
    }

    /**
     *
     * Handle action when the shopper clicks on + / - for quantity
     *
     */
    listenQuantityChange() {
        this.$scope.on('click', '[data-quantity-change] button', event => {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const viewModel = this.getViewModel(this.$scope);
            const $input = viewModel.quantity.$input;
            const quantityMin = parseInt($input.data('quantityMin'), 10);
            const quantityMax = parseInt($input.data('quantityMax'), 10);

            let qty = parseInt($input.val(), 10);

            // If action is incrementing
            if ($target.data('action') === 'inc') {
                // If quantity max option is set
                if (quantityMax > 0) {
                    // Check quantity does not exceed max
                    if ((qty + 1) <= quantityMax) {
                        qty++;
                    }
                } else {
                    qty++;
                }
            } else if (qty > 1) {
                // If quantity min option is set
                if (quantityMin > 0) {
                    // Check quantity does not fall below min
                    if ((qty - 1) >= quantityMin) {
                        qty--;
                    }
                } else {
                    qty--;
                }
            }

            // update hidden input
            viewModel.quantity.$input.val(qty);
            // update text
            viewModel.quantity.$text.text(qty);
        });
    }

    /**
     *
     * Add a product to cart
     *
     */
    // addProductToCart(event, form) {
    addProductToCart(event) {
        const $addToCartBtn = $('#form-action-addToCart', $(event.target));
        // const originalBtnVal = $addToCartBtn.val();
        // eslint-disable-next-line
        const waitMessage = $addToCartBtn.data('waitMessage');
        let isHushPanel = false;
        if($('input[name="product_sku"][value="HP"]').length || $('input[name="product_sku"][value="HPCable"]').length || $('input[name="product_type"][value="HushPanel"]').length){
            isHushPanel = true;
        };

        // Do not do AJAX if browser doesn't support FormData
        if (window.FormData === undefined) {
            return;
        }
        
        // Prevent default
        event.preventDefault();

        // $addToCartBtn.val(waitMessage).prop('disabled', true);

        this.$overlay.show();

        // Facebook DPA
        const addToCartPid = $('div[data-product-attribute="product-list"] input[type="radio"]:checked').attr('data-product-attribute-pid');
        const addToCartEvent = new CustomEvent('productAddToCart', { detail: parseInt(addToCartPid, 10) });
        document.dispatchEvent(addToCartEvent);
        // Add item to cart
        if (isHushPanel) {
            const button = document.querySelector('#form-action-addToCart');
            button.classList.add('disabled');
            button.value = 'Adding to Cart...'

            // const heightItem = $('label[data-rect-type="Height"] ~ .active-rectangle .form-option-variant').text().charAt(0);
            const heightItem = 6;
            let cartID = '';
            let cartUrl = '';

            // panel ID live
            // let panelID = 9812;
            // panel ID sandbox
            let panelID = 9812;

            //post ID
            let postID = 0;
            if (parseInt(heightItem, 10) === 4) {
                //live
                // heightID = 8328;
                //sandbox
                postID = 13289;
            } else {
                //live
                postID = 8573;
                //sandbox
                // postID = 13290;

                // if($('label[data-rect-type="Cable Channel"]').siblings('.active-rectangle').find('span').text() == 'Yes'){
                if($('input[name="product_sku"][value="HPCable"]').length){
                    //live
                    postID = 10431;
                    //sandbox
                    // postID = 14428;
                }
            }

            // bracket ID live
            let bracketID = 8330;
            // bracket ID sandbox
            // let bracketID = 13291;

            let customFields = this.context.custom_fields;
       
            customFields.forEach(customField => {
                if(customField.name === 'postId') {
                    postID = customField.value;
                }
                if(customField.name === 'bracketId') {
                    bracketID = customField.value;
                }
            });

            const qtyCount = $('input.form-input.form-input--incrementTotal.form-number--changes').val();
            const variationID = $('div[data-product-attribute="product-list"] input[type="radio"]:checked').attr('data-product-attribute-pid');

            let panelCount = $('label:contains("# of Panels") ~ select option:selected').text();
            if ($('label:contains("# of Panels") ~ select option:selected').length === 0) {
                panelCount = parseInt($('label:contains("# of Panels") ~ .rectangle-item.active-rectangle .form-option-variant').text(), 10);
            }
            let postCount = $('label:contains("# of Posts") ~ select option:selected').text();
            if ($('label:contains("# of Posts") ~ select option:selected').length === 0) {
                postCount = parseInt($('label:contains("# of Posts") ~ .rectangle-item.active-rectangle .form-option-variant').text(), 10);
            }
            let bracketCount = $('label:contains("# of Wall-Mount Brackets") ~ select option:selected').text();
            if ($('label:contains("# of Wall-Mount Brackets") ~ select option:selected').length === 0) {
                bracketCount = parseInt($('label:contains("# of Wall-Mount Brackets") ~ .rectangle-item.active-rectangle .form-option-variant').text(), 10);
            }
            // set default post count to 0
            if (postCount === 'Choose Options') {
                postCount = 0;
            }

            // set default bracket count to 0
            if (bracketCount === 'Choose Options') {
                bracketCount = 0;
            }

            const formData = new FormData();
            formData.append('action', 'add');
            formData.append('product_id', variationID);
            formData.append('qty[]', parseInt(qtyCount, 10) * parseInt(panelCount, 10));
            // panels
            $.get(`/cart.php?action=add&product_id=${variationID}&qty=${panelCount}`, () => {
                // // posts
                if (postCount > 0 && bracketCount > 0) {
                    $.get(`/cart.php?action=add&product_id=${postID}&qty=${postCount}`, () => {
                        // // brackets
                        $.get(`/cart.php?action=add&product_id=${bracketID}&qty=${bracketCount}`, () => {
                            window.location = "/cart.php";
                        });
                    }); 
                }
                else if (postCount == 0 && bracketCount > 0) {
                    // // brackets
                    $.get(`/cart.php?action=add&product_id=${bracketID}&qty=${bracketCount}`, () => {
                        window.location = "/cart.php";
                    });
                }
                else if (postCount > 0 && bracketCount == 0) {
                    $.get(`/cart.php?action=add&product_id=${postID}&qty=${postCount}`, () => {
                        window.location = "/cart.php";
                    }); 
                }
                else {
                    window.location = "/cart.php";
                }
            });
        } 
        else  {
            let variationID = $('div[data-product-attribute="product-list"] input[type="radio"]:checked').attr('data-product-attribute-pid');
            if (!variationID && document.querySelector('[data-product-attribute="product-list"] input[type="radio"]:checked')) {
                variationID = document.querySelector('[data-product-attribute="product-list"] input[type="radio"]:checked').value;
            }
            const qtyCount = $('input.form-input.form-input--incrementTotal.form-number--changes').val();
            let cartID = '';
            let cartUrl = '';
            //document.querySelector('[data-product-attribute="product-list"] input[type="radio"]:checked').value
            const formData = new FormData();

            formData.append('action', 'add');
            console.log(variationID)

            if(!document.querySelector('div[data-product-option-change]').childElementCount){
                console.log('if')
                formData.append('product_id', document.querySelector('input[name="product_id"]').value);
            } else {
                console.log('else')
                formData.append('product_id', variationID);
            }
            formData.append('qty[]', qtyCount);
            console.log(formData)
            utils.api.cart.itemAdd(this.filterEmptyFilesFromForm(formData), (err, response) => {
                //Add add-ons to the cart
                const checkboxes = document.querySelectorAll('.form-checkbox');
                let lineItems = [];
                checkboxes.forEach(checkbox => {
                    let addOn = checkbox.getAttribute('alt');
                    let checked = checkbox.checked;
                    if (checked) {
                        const custom_fields = this.context.custom_fields;
                        custom_fields.forEach(custom_field => {
                            if (custom_field.name === addOn) {
                                lineItems.push({'productId': custom_field.value, 'quantity': qtyCount});
                            }
                        });
                    }
                });

                if(lineItems.length > 0) {
                    this.postData(response.data.cart_id, lineItems);
                }

                const errorMessage = err || response.data.error;

                this.$overlay.hide();

                // Guard statement
                if (errorMessage) {
                    // Strip the HTML from the error message
                    const tmp = document.createElement('DIV');
                    tmp.innerHTML = errorMessage;

                    return showAlertModal(tmp.textContent || tmp.innerText);
                }

                // Open cart flyout
                // $('[data-cart-preview]').click();
                this.previewModal = modalFactory('#previewModal')[0];
                if (this.previewModal) {
                    this.previewModal.open();                   
                    this.updateCartContent(this.previewModal, response.data.cart_item.id);
                } else {
                    this.$overlay.show();
                    // if no modal, redirect to the cart page
                    this.redirectTo(response.data.cart_item.cart_url || this.context.urls.cart);
                }
                // const itemCount = $('.form-input--incrementTotal').val();
                // $('.cart-preview-background #cart-preview-dropdown').attr('data-alert-content', `${itemCount} ${itemCount == 1 ? `item` : `items`} successfully added to cart`);
                if(typeof HawkSearch !== "undefined"){
                    HawkSearch.Tracking.track('add2cart', {
                        uniqueId: $('input[name="product_id"]').attr('value'),
                        price: $('.productView-price .price.price--withoutTax').text().replace('$','').trim(),
                        quantity: $('.form-input--incrementTotal').val(),
                        currency: 'USD'
                    });
                }
            });
        } 
    }

    

    /* eslint-enable arrow-body-style, no-trailing-space quote-props, quotes, comma-dangle */
    /* eslint-disable quotes, comma-dangle, no-trailing-spaces */
    postData(cartId = '', lineItems = {}) {
        const button = document.querySelector('#form-action-addToCart');
        button.classList.add('disabled');
        button.value = 'Adding to Cart...'
        fetch(`/api/storefront/carts/${cartId}/items`, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "lineItems": lineItems
            })
        })
        .then(response => response.json())
        .then(response => {
            window.location.href = '/cart.php';
        })
        .catch(err => {
            console.error(err);

            if (typeof callback == 'function') {
                callback.call(this, null);
            }
        });
    }
    /* eslint-enable quotes, comma-dangle, no-trailing-spaces */

    /**
     * Get cart contents
     *
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    getCartContent(cartItemId, onComplete) {
        const options = {
            template: 'cart/preview',
            params: {
                suggest: cartItemId,
            },
            config: {
                cart: {
                    suggestions: {
                        limit: 4,
                    },
                },
            },
        };

        utils.api.cart.getContent(options, onComplete);
    }

    /**
     * Redirect to url
     *
     * @param {String} url
     */
    redirectTo(url) {
        if (this.isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    /**
     * Update cart content
     *
     * @param {Modal} modal
     * @param {String} cartItemId
     * @param {Function} onComplete
     */
    updateCartContent(modal, cartItemId, onComplete) {
        this.getCartContent(cartItemId, (err, response) => {
            if (err) {
                return;
            }

            modal.updateContent(response);

            // Update cart counter
            const $body = $('body');
            const $cartQuantity = $('[data-cart-quantity]', modal.$content);
            const $cartCounter = $('.navUser-action .cart-count');
            const quantity = $cartQuantity.data('cartQuantity') || 0;

            $cartCounter.addClass('cart-count--positive');
            $body.trigger('cart-quantity-update', quantity);

            if (onComplete) {
                onComplete(response);
            }
        });
    }

    /**
     * Show an message box if a message is passed
     * Hide the box if the message is empty
     * @param  {String} message
     */
    showMessageBox(message) {
        const $messageBox = $('.productAttributes-message');

        if (message) {
            $('.alertBox-message', $messageBox).text(message);
            $messageBox.show();
        } else {
            $messageBox.hide();
        }
    }

    /**
     * Hide the pricing elements that will show up only when the price exists in API
     * @param viewModel
     */
    clearPricingNotFound(viewModel) {
        viewModel.rrpWithTax.$div.hide();
        viewModel.rrpWithoutTax.$div.hide();
        viewModel.nonSaleWithTax.$div.hide();
        viewModel.nonSaleWithoutTax.$div.hide();
        viewModel.priceSaved.$div.hide();
        viewModel.priceNowLabel.$span.hide();
        viewModel.priceLabel.$span.hide();
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updatePriceView(viewModel, price) {
        this.clearPricingNotFound(viewModel);

        if (price.with_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithTax.html(price.with_tax.formatted);
        }

        if (price.without_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithoutTax.html(price.without_tax.formatted);
        }

        if (price.rrp_with_tax) {
            viewModel.rrpWithTax.$div.show();
            viewModel.rrpWithTax.$span.html(price.rrp_with_tax.formatted);
        }

        if (price.rrp_without_tax) {
            viewModel.rrpWithoutTax.$div.show();
            viewModel.rrpWithoutTax.$span.html(price.rrp_without_tax.formatted);
        }

        if (price.saved) {
            viewModel.priceSaved.$div.show();
            viewModel.priceSaved.$span.html(price.saved.formatted);
        }

        if (price.non_sale_price_with_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithTax.$span.html(price.non_sale_price_with_tax.formatted);
        }

        if (price.non_sale_price_without_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithoutTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithoutTax.$span.html(price.non_sale_price_without_tax.formatted);
        }
    }

    /**
     * Update the view of price, messages, SKU and stock options when a product option changes
     * @param  {Object} data Product attribute data
     */
    updateView(data, content = null) {
        const viewModel = this.getViewModel(this.$scope);

        this.showMessageBox(data.stock_message || data.purchasing_message);

        if (_.isObject(data.price)) {
            this.updatePriceView(viewModel, data.price);
        }

        if (_.isObject(data.weight)) {
            viewModel.$weight.html(data.weight.formatted);
        }

        // Set variation_id if it exists for adding to wishlist
        if (data.variantId) {
            viewModel.$wishlistVariation.val(data.variantId);
        }

        // If SKU is available
        if (data.sku) {
            viewModel.sku.$value.text(data.sku);
            viewModel.sku.$label.show();
        } else {
            viewModel.sku.$label.hide();
            viewModel.sku.$value.text('');
        }

        // If UPC is available
        if (data.upc) {
            viewModel.upc.$value.text(data.upc);
            viewModel.upc.$label.show();
        } else {
            viewModel.upc.$label.hide();
            viewModel.upc.$value.text('');
        }

        // if stock view is on (CP settings)
        if (viewModel.stock.$container.length && _.isNumber(data.stock)) {
            // if the stock container is hidden, show
            viewModel.stock.$container.removeClass('u-hiddenVisually');

            viewModel.stock.$input.text(data.stock);
        } else {
            viewModel.stock.$container.addClass('u-hiddenVisually');
            viewModel.stock.$input.text(data.stock);
        }

        this.updateDefaultAttributesForOOS(data);

        // If Bulk Pricing rendered HTML is available
        if (data.bulk_discount_rates && content) {
            viewModel.$bulkPricing.html(content);
        } else if (typeof (data.bulk_discount_rates) !== 'undefined') {
            viewModel.$bulkPricing.html('');
        }
    }

    updateDefaultAttributesForOOS(data) {
        const viewModel = this.getViewModel(this.$scope);
        if (!data.purchasable || !data.instock) {
            viewModel.$addToCart.prop('disabled', true);
            viewModel.$increments.prop('disabled', true);
        } else {
            viewModel.$addToCart.prop('disabled', false);
            viewModel.$increments.prop('disabled', false);
        }
    }

    /**
     * Hide or mark as unavailable out of stock attributes if enabled
     * @param  {Object} data Product attribute data
     */
    updateProductAttributes(data) {
        const behavior = data.out_of_stock_behavior;
        const inStockIds = data.in_stock_attributes;
        const outOfStockMessage = ` (${data.out_of_stock_message})`;

        this.showProductImage(data.image);

        if (behavior !== 'hide_option' && behavior !== 'label_option') {
            return;
        }

        $('[data-product-attribute-value]', this.$scope).each((i, attribute) => {
            const $attribute = $(attribute);
            const attrId = parseInt($attribute.data('productAttributeValue'), 10);


            if (inStockIds.indexOf(attrId) !== -1) {
                this.enableAttribute($attribute, behavior, outOfStockMessage);
            } else {
                this.disableAttribute($attribute, behavior, outOfStockMessage);
            }
        });
    }

    disableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
           // return this.disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.hide();
        } else {
            $attribute.addClass('unavailable');
        }
    }

    disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        const $select = $attribute.parent();

        if (behavior === 'hide_option') {
            $attribute.toggleOption(false);
            // If the attribute is the selected option in a select dropdown, select the first option (MERC-639)
            if ($select.val() === $attribute.attr('value')) {
                $select[0].selectedIndex = 0;
            }
        } else {
            $attribute.attr('disabled', 'disabled');
            $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
        }
    }

    enableAttribute($attribute, behavior, outOfStockMessage) {
        if (this.getAttributeType($attribute) === 'set-select') {
            return this.enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
        }

        if (behavior === 'hide_option') {
            $attribute.show();
        } else {
            $attribute.removeClass('unavailable');
        }
    }

    enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
        if (behavior === 'hide_option') {
            $attribute.toggleOption(true);
        } else {
            $attribute.prop('disabled', false);
            $attribute.html($attribute.html().replace(outOfStockMessage, ''));
        }
    }

    getAttributeType($attribute) {
        const $parent = $attribute.closest('[data-product-attribute]');

        return $parent ? $parent.data('productAttribute') : null;
    }

    /**
     * Allow radio buttons to get deselected
     */
    initRadioAttributes() {
        $('[data-product-attribute] input[type="radio"]', this.$scope).each((i, radio) => {
            const $radio = $(radio);

            // Only bind to click once
            if ($radio.attr('data-state') !== undefined) {
                $radio.on('click', () => {
                    if ($radio.data('state') === true) {
                        $radio.prop('checked', false);
                        $radio.data('state', false);

                        $radio.trigger('change');
                    } else {
                        $radio.data('state', true);
                    }

                    this.initRadioAttributes();
                });
            }

            $radio.attr('data-state', $radio.prop('checked'));
        });
    }

    /**
     * Check for fragment identifier in URL requesting a specific tab
     */
    getTabRequests() {
        if (window.location.hash && window.location.hash.indexOf('#tab-') === 0) {
            const $activeTab = $('.tabs').has(`[href='${window.location.hash}']`);
            const $tabContent = $(`${window.location.hash}`);

            if ($activeTab.length > 0) {
                $activeTab.find('.tab')
                    .removeClass('is-active')
                    .has(`[href='${window.location.hash}']`)
                    .addClass('is-active');

                $tabContent.addClass('is-active')
                    .siblings()
                    .removeClass('is-active');
            }
        }
    }
}
