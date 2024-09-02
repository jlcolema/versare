/*
 Import all product specific js
 */
import PageManager from './page-manager';

export default class ProductCustom extends PageManager {
    constructor(context) {
        super(context);
        this.$rectFromLabelEl = document.querySelectorAll(".productViewCustomDesign [data-product-attribute='set-rectangle'] .form-label");
        this.$selectFromLabelEl = document.querySelectorAll(".productViewCustomDesign [data-product-attribute='set-select'] .form-label");
    }

    onReady() {
        const acc = document.getElementsByClassName('accordion');

        $(acc).click(event => {
            event.target.classList.toggle('active');
            event.target.nextElementSibling.classList.toggle('show');
        });

        const formElements = document.querySelectorAll('.form-select');
        formElements.forEach(formElement => {
            formElement.onchange = (event) => {
                if (event.target.value !== '') {
                    event.target.style.color = '#222f4d';
                } else {
                    event.target.style.color = '#798190';
                }
            };
        });

        this.$rectFromLabelEl.forEach(rectEl => {
            rectEl.addEventListener('click', (event) => {
                event.target.parentElement.classList.toggle('open');
            });
        });

        this.$selectFromLabelEl.forEach(selectEl => {
            selectEl.addEventListener('click', (event) => {
                event.target.parentElement.classList.toggle('open');
            });
        });

        const recElements = document.querySelectorAll('.form-field .rectangle-item');
        recElements.forEach(recEl => {
            recEl.onclick = event => {
                event.target.closest('.form-field').classList.remove('open');
                const selectedAttribute = event.target.childNodes[1].innerText;
                const labelEl = event.target.parentElement.firstChild.nextElementSibling;
                const labelChildEl = labelEl.childNodes[1];
                if (labelEl) {
                    const labelText = labelEl.getAttribute('data-type');
                    if (labelText) {
                        const updatedLabelText = labelText.replace('Choose ', '').replace('Room ', '').replace('Divider ', '');
                        labelEl.innerText = `${updatedLabelText} ${selectedAttribute}`;
                        if (labelChildEl) {
                            labelEl.append(labelChildEl);
                        }
                    }
                }
            };
        });

        const selectElements = document.querySelectorAll('.form-field .form-select');
        selectElements.forEach(selectEl => {
            selectEl.onchange = event => {
                const selectedTarget = event.target;
                selectedTarget.closest('.form-field').classList.remove('open');
                const selectedAttribute = selectedTarget.options[selectedTarget.selectedIndex].text;
                const labelEl = selectedTarget.parentElement.firstChild.nextElementSibling;
                const labelChildEl = labelEl.childNodes[1];
                if (labelEl) {
                    const labelText = labelEl.getAttribute('data-type');
                    if (labelText) {
                        const updatedLabelText = labelText.replace('Choose ', '');
                        labelEl.innerText = `${updatedLabelText} ${selectedAttribute}`;
                        if (labelChildEl) {
                            labelEl.append(labelChildEl);
                        }
                    }
                }
            };
        });

        // TODO: DELETE THIS - this is a quickfix for https://intranet.americaneagle.com/tickets/view.asp?TICKET_ID=607337#post-6118181
        if (window.location.pathname === '/custom-print-room-divider-360/') {
            const formAccordion = document.querySelectorAll('.productView-options .form-field');
            formAccordion.forEach(accordion => {
                accordion.classList.add('open');
            });
        }
    }
}
