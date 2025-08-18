// static/js/sliderControls.js

import { setResultsPerPage } from './pagination.js';
import { setTemporalResultsPerPage } from './paginationTemporal.js';

export function adjustThumbnailSize() {
    const sizeSlider = document.getElementById('size-slider');

    const width = sizeSlider.value;
    const height = (width * 9) / 16;
    document.documentElement.style.setProperty('--thumbnail-width', `${width}px`);
    document.documentElement.style.setProperty('--thumbnail-height', `${height}px`);
}

export function initSliderControls() {
    const sizeSlider = document.getElementById('size-slider');
    const slider = document.getElementById('slider_k');
    const kInput = document.getElementById('k');
    const resultsPerPageSlider = document.getElementById('results-per-page-slider');
    const resultsPerPageValue = document.getElementById('results-per-page-value');

    // START: Get new checkbox elements
    const returnS2TCheckbox = document.getElementById('return-s2t-checkbox');
    const returnObjectCheckbox = document.getElementById('return-object-checkbox');
    const frameClassFilterCheckbox = document.getElementById('frame-class-filter-checkbox');
    // END: Get new checkbox elements

    // Initialize values
    slider.value = 100;
    kInput.value = 100;
    resultsPerPageSlider.value = 50;
    resultsPerPageValue.value = 50;
    sizeSlider.value = 300;

    // START: Initialize new checkbox values based on your defaults
    returnS2TCheckbox.checked = true;       // default: true
    returnObjectCheckbox.checked = false;   // default: false
    frameClassFilterCheckbox.checked = true;// default: true
    // END: Initialize new checkbox values

    // Apply initial thumbnail size
    adjustThumbnailSize();

    const updateResultsPerPage = () => {
        const newSize = parseInt(resultsPerPageSlider.value, 10);
        // Call both functions. The guard clauses inside them will ensure only
        // the correct one executes based on the current view mode.
        setResultsPerPage(newSize);
        setTemporalResultsPerPage(newSize);
    };

    // Link the "results per page" slider and its text box
    resultsPerPageSlider.addEventListener('input', () => {
        resultsPerPageValue.value = resultsPerPageSlider.value;
    });
    resultsPerPageValue.addEventListener('change', () => {
        resultsPerPageSlider.value = resultsPerPageValue.value;
        updateResultsPerPage(); // Update when the text box is changed directly
    });

    // Fire the update when the user releases the slider
    resultsPerPageSlider.addEventListener('change', updateResultsPerPage);

    // Link the thumbnail size slider
    sizeSlider.addEventListener('input', adjustThumbnailSize);
    sizeSlider.addEventListener('change', adjustThumbnailSize);

    // Link the "number of results" (k) slider
    slider.addEventListener('input', () => kInput.value = slider.value);
    kInput.addEventListener('input', () => slider.value = kInput.value);
    slider.addEventListener('change', () => kInput.value = slider.value);
    kInput.addEventListener('change', () => slider.value = kInput.value);
}
