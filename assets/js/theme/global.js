/* eslint-disable no-console */
/* eslint-disable func-names */
import 'focus-within-polyfill';

import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import footer from './global/footer';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import carousel from './common/carousel';
import svgInjector from './global/svg-injector';
import objectFitImages from './global/object-fit-polyfill';
import matchHeight from 'jquery-match-height';
// eslint-disable-next-line no-unused-vars
import { each } from 'jquery';

export default class Global extends PageManager {
    onReady() {
        const { cartId, secureBaseUrl, apiToken } = this.context;
        cartPreview(secureBaseUrl, cartId);
        quickSearch();
        currencySelector(cartId);
        foundation($(document));
        quickView(this.context);
        carousel(this.context);
        menu();
        footer();
        mobileMenuToggle();
        privacyCookieNotification();
        svgInjector();
        objectFitImages();
        this.perfectSolution();
        this.matchCardHeight();
        this.changeImage();
        const self = this;
        // scroll function
        $(window).scroll(() => {
            const scroll = $(window).scrollTop();
            if (scroll >= 50) {
                $('body').addClass('scrolled');
            } else {
                $('body').removeClass('scrolled');
            }
        });
        // scroll function
        if ($(window).width() <= 800) {
            $('.tab-scroll').click(() => {
                $([document.documentElement, document.body]).animate({
                    scrollTop: $('#tab-contentz').offset().top,
                }, 1000);
            });
        }

        const stickyElem = document.querySelector('.sticky-nav--container');

        /* Gets the amount of height of the element from the viewport and adds the pageYOffset to get the height relative to the page */
        if (stickyElem) {
            const currStickyPos = stickyElem.getBoundingClientRect().bottom + window.pageYOffset;
            window.onscroll = function () {
                //self.removeStickyNavTargetElementClass();
                /* Check if the current Y offset is greater than the position of the element */
                if (window.pageYOffset > currStickyPos) {
                    stickyElem.classList.add('scrolled');
                } else {
                    stickyElem.classList.remove('scrolled');
                }
            };
        }

        //add margin-top when clicked on sticky Nav
        const stickyNavElements = document.querySelectorAll('.sticky-nav-items li a');
        stickyNavElements.forEach(navElement => {
            navElement.onclick = (event) => {
                self.removeStickyNavTargetElementClass();
                const targetId = (event.target.getAttribute('href')).replace('#','');
                const targetEl = document.getElementById(targetId);
                targetEl.classList.add('target-sticky-element');
                console.log(targetEl)
            }
        }); 

        /*
         * Custom Widget Sticky Nav Toggle functionality for Mobile
         * */
        const stickyMenuToggleEl = $('.stickyMobileMenu-toggle');
        const stickyNavItemsEl = $('.sticky-nav-items');

        stickyMenuToggleEl.on('click', () => {
            if (stickyMenuToggleEl.hasClass('is-open')) {
                stickyMenuToggleEl.removeClass('is-open');
                stickyNavItemsEl.removeClass('is-open');
                stickyMenuToggleEl.attr('aria-expanded', false);
            } else {
                stickyMenuToggleEl.addClass('is-open');
                stickyNavItemsEl.addClass('is-open');
                stickyMenuToggleEl.attr('aria-expanded', true);
            }
        });
        
        $('.sticky-nav--container .sticky-nav-items li').on('click', () => {
            stickyMenuToggleEl.removeClass('is-open');
            stickyNavItemsEl.removeClass('is-open');
            stickyMenuToggleEl.attr('aria-expanded', false);
        });

        // Hot Spot Widget
        if ($('.hot-spot-panel').length) {
            $('.hot-spot-panel').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                fade: true,
                dots: false,
            });
            $('.hot-spot-carousel').slick({
                dots: false,
                infinite: true,
                slidesToShow: 4,
                slidesToScroll: 1,
                lazyLoad: 'ondemand',
                arrows: true,
                responsive: [
                    {
                        breakpoint: 800,
                        settings: {
                            slidesToShow: 3,
                        },
                    },
                ],
            });
            $('.hot-spot-carousel .slick-slide').on('click', function () {
                $('.hot-spot-panel').slick('slickGoTo', $(this).data('slickIndex'));
                $('.hot-spot-carousel .slick-slide').removeClass('slick-selected');
                $(this).addClass('slick-selected');
            });
            $('.hot-spot-carousel .hot-spot-item.slick-current').addClass('slick-selected');
            const hotSpotPositionFix = (element) => {
                if (element) {
                    if (document.querySelector('.scrolled .header')) {
                        const headerHeight = document.querySelector('.scrolled .header').getBoundingClientRect().height;
                        if (document.querySelector('.hot-spot-item.is-open')) {
                            const stickyNav = document.querySelector('.sticky-nav--container.scrolled');
                            if (element.getBoundingClientRect().top - headerHeight < 0 || stickyNav) {
                                document.querySelector('.hot-spot-item.is-open .dropdown-menu').classList.remove('flipped');
                                document.querySelector('.hot-spot-item.is-open .dropdown-menu').classList.add('flipped');
                            } else {
                                document.querySelector('.hot-spot-item.is-open .dropdown-menu').classList.remove('flipped');
                            }
                        }
                    }
                }
            };
            // Product icon click, loads product data
            $('.hot-spot-link').on('click', (e) => {
                const $this = $(e.currentTarget);
                const $parent = $this.parent();
                const sku = $this.attr('data-sku');
                const id = $this.attr('data-id');
                const $dropdown = $(id);
                const isOpen = $parent.is('.is-open');
                $('.hot-spot-item').removeClass('is-open');
                if (!$parent.is('loaded')) {
                    fetch('/graphql', {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${apiToken}`,
                        },
                        body: JSON.stringify({
                            query: `
                            query getProduct {
                                site {
                                    product(sku: "${sku}") {
                                        id
                                        entityId
                                        name
                                        prices {
                                            price {
                                                value
                                            }
                                        }
                                        path
                                        images {
                                            edges {
                                                node {
                                                    ...ImageFields
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            fragment ImageFields on Image {
                                url640wide: url(width: 640)
                            }
                        `,
                        }),
                    })
                        .then(res => res.json())
                        .then(res => {
                            const product = res.data.site.product;
                            const images = product.images.edges;
                            const imageStr = (images.length ? `<img src="${product.images.edges[0].node.url640wide}">` : '');
                            const dollarUSLocale = Intl.NumberFormat('en-US');
                            $dropdown.empty().append(`
                            <div class="product-popup">
                                ${imageStr}
                                <h4>${product.name}</h4>
                                <p>$${dollarUSLocale.format(product.prices.price.value)}</p>
                                <a class="hot-spot-a button button--primary" href="${product.path}">Customize Yours</a>
                                <div class="close-popup" aria-label="{{lang 'common.close'}}" role="button">
                                    <svg><use xlink:href="#icon-remove-icon" /></svg>
                                </div>
                            </div>
                        `);
                            $parent.addClass('loaded');
                        });
                }
                $parent.toggleClass('is-open', !isOpen);
                hotSpotPositionFix(e.currentTarget);
            });
            // Close popup on click outside
            $(document).on('click', (e) => {
                if ($(e.target).closest('.hot-spot-item').length !== 0 && !$(e.target).is('.hot-spot-a')) return false;
                $('.hot-spot-item').removeClass('is-open');
            });
            $(document).on('click', '.close-popup', () => {
                $('.hot-spot-item').removeClass('is-open');
            });
            // flip the popup downward if it's off the screen
            const hotspots = document.querySelectorAll('.hot-spot-link');
            hotspots.forEach(element => {
                window.addEventListener('scroll', () => {
                    hotSpotPositionFix(element);
                });
            });
        }



        // cart preview background
        const $div = $('#cart-preview-dropdown');
        const observer = new MutationObserver(((mutations) => {
            mutations.forEach((mutation) => {
                const attributeValue = $(mutation.target).prop(mutation.attributeName);
                const isOpen = attributeValue.includes('is-open');
                $('.cart-preview-background').toggleClass('is-open', isOpen);
                $('html').toggleClass('cartPreview-open', isOpen);
            });
        }));
        observer.observe($div[0], {
            attributes: true,
            attributeFilter: ['class'],
        });

        // global header nav
        const navItems = document.querySelectorAll('.navPage-subMenu-list:not(.list__container) .navPage-subMenu-action')
        navItems.forEach(item => {
            item.addEventListener('mouseover', event => {
                if(!event.target.closest('.navPage-subMenu-item.active')) {

                    const menuItems = document.querySelectorAll(".navPage-subMenu-list:not(.list__container) .navPage-subMenu-item")
                    menuItems.forEach(item => { if(item.classList.contains('active')) item.classList.remove('active') });

                    event.target.closest('.navPage-subMenu-item').classList.add('active');
                    const imgSrc = event.target.closest('li').getAttribute('data-image-src');
                    const navImg = document.querySelector('.nav-propImage img');
                    if(navImg && imgSrc) navImg.src = imgSrc
                }
            })
        })
        const subNavItems = document.querySelectorAll(".navPage-subMenu-list:not(.list__container) .navPage-childList-item");
        subNavItems.forEach(item => {
            item.addEventListener('mouseover', event => {
                const imgSrc = event.target.closest('li').getAttribute('data-image-src');
                const navImg = document.querySelector('.nav-propImage img');
                if(navImg && imgSrc) navImg.src = imgSrc
            })
        })
        // insert icon row into homeHero
        const waitForRow = setInterval(function(){
            const iconRow = document.querySelector('ul.custom-icons');
            const heroSlides = document.querySelectorAll('.homeHeroWidget-slide');
            if(iconRow && heroSlides.length > 0) {
                clearInterval(waitForRow)
                heroSlides.forEach(slide => {
                    slide.querySelector('.left').insertAdjacentElement('beforeend', iconRow.cloneNode(true));
                })
            }
        },100)
    }

    removeStickyNavTargetElementClass() {
        const targetStickyNavEl = document.querySelectorAll('.target-sticky-element');
        targetStickyNavEl.forEach(element => {
            element.classList.remove('target-sticky-element');
        });
    }
    // switch grid to list and back

    perfectSolution() {
        const perfect = $('.perfectsolution');

        if (perfect.length) {
            const perfectSolutionJson = '/content/perfect-solutions.json';

            let homepageCategories = `{
                "title": "Find Your Perfect Solution",
                "cards": [
                    {
                        "category_images": "https://cdn11.bigcommerce.com/s-bcwxdbhdjm/product_images/uploaded_images/img-1.jpg",
                        "category_link": "/",
                        "category_name": "Premium Portable Room Dividers"
                    },
                    {
                        "category_images": "https://cdn11.bigcommerce.com/s-bcwxdbhdjm/product_images/uploaded_images/canvas-room-divider.jpg",
                        "category_link": "/",
                        "category_name": "Economical Canvas Partitions"  
                    },
                    {
                        "category_images": "https://cdn11.bigcommerce.com/s-bcwxdbhdjm/product_images/uploaded_images/img-3.jpg",
                        "category_link": "/",
                        "category_name": "TBD"
                    },
                    {
                        "category_images": "https://cdn11.bigcommerce.com/s-bcwxdbhdjm/product_images/uploaded_images/img-3.jpg",
                        "category_link": "/",
                        "category_name": "TBD"  
                    },
                    {
                        "category_images": "https://cdn11.bigcommerce.com/s-bcwxdbhdjm/product_images/uploaded_images/img-5.jpg",
                        "category_link": "/",
                        "category_name": "Office Work Stations"
                    },
                    {
                        "category_images": "https://cdn11.bigcommerce.com/s-bcwxdbhdjm/product_images/uploaded_images/portable-acoustic-panels.jpg",
                        "category_link": "/",
                        "category_name": "Portable Acoustic Panels"
                    },
                    {
                        "category_images": "https://cdn11.bigcommerce.com/s-bcwxdbhdjm/product_images/uploaded_images/img-3.jpg",
                        "category_link": "/",
                        "category_name": "Outdoor Privacy Screens"
                    },
                    {
                        "category_images": "https://cdn11.bigcommerce.com/s-bcwxdbhdjm/product_images/uploaded_images/img-4.jpg",
                        "category_link": "/",
                        "category_name": "Expanding Gates"
                    }
                ]
            }`;

            $.getJSON(perfectSolutionJson, (data) => {
                this.topSolutions(data);
                this.topSolutionsCards(data);
            }).fail(() => {
                homepageCategories = JSON.parse(homepageCategories);
                this.topSolutions(homepageCategories);
                this.topSolutionsCards(homepageCategories);
            });
        }
    }

    topSolutions(categories) {
        const perfectsolutionTitle =
        `<div class="heading-container">
         <div class="heading">${categories.title}</div>
         <div class="heading-line"></div>`;

        $('.perfectsolution').prepend(perfectsolutionTitle);
    }

    topSolutionsCards(categories) {
        let categoryCards = '';
        $.each(categories.cards, (key, value) => {
            categoryCards +=
            `<div class="solution-outer">
                <div class="solution-part">
                    <a href="${value.category_link}">
                        <img class="solution-image" src="${value.category_images}"/>
                        <svg class="solution-icon" viewBox="0 0 180 320" preserveAspectRatio="none"><path d="M0,0C0,0,0,182,0,182C0,182,90,126.5,90,126.5C90,126.5,180,182,180,182C180,182,180,0,180,0C180,0,0,0,0,0C0,0,0,0,0,0"></path><desc></desc><defs></defs></svg>
                        <h2 class="icon-header">${value.category_name}</h2>
                        <button class="view-btn" title="View">View</button>
                    </a>
                </div>
            </div>`;
        });

        $('.solution-wrapper').append(categoryCards);
    }


    changeImage() {
        const navImage = $('.navPage-image');

        if (navImage.length) {
            const navImageJson = '/content/main-nav-image.json';

            let navImageItem = `{
                    
                    "header_image_src": "https://pull06-versare.netdna-ssl.com/media//catalog/category/CustomRD360image.png",
                    "header_image_link": "/"
                        
                    }`;

            $.getJSON(navImageJson, (data) => {
                this.changeHeaderImage(data);
            }).fail(() => {
                navImageItem = JSON.parse(navImageItem);
                this.changeHeaderImage(navImageItem);
            });
        }
    }

    changeHeaderImage(data) {
        let upsellBanner = '';
        upsellBanner +=
                    `<a href="${data.header_image_link}">
                    <img class="navPage-image-item"src="${data.header_image_src}"/>
                    </a>`;

        $('.navPage-image').append(upsellBanner);
    }

    matchCardHeight() {
        const card = $('.shop-card');
        const cardTitle = $('.shop-card-heading');

        if (card.length > 0) {
            card.matchHeight();
            cardTitle.matchHeight();
        }
    }
}
