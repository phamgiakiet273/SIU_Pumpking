// static/js/main.js

import { initCharCounter, initTextAutoGrow } from './charCounter.js';
// import { initVideoFilter } from './videoFilter.js';
import { initQueryHistory } from './queryHistory.js';
import { initSearchHandler } from './searchHandler.js';
import { initVoiceRecognition } from './voiceRecognition.js';
import { initSliderControls } from './sliderControls.js';
import { initS2THover } from './s2tHover.js';
import { initRerankHandler } from './rerankHandler.js';
import { initThumbnailView } from './thumbnailView.js';
// import { initS2TFilter } from './s2tFilter.js';
import { initVideoView } from './videoView.js'
import { initPagination } from './pagination.js';
import { initImageQueryToggle, initImageUpload } from './searchImageHandler.js'
import { initPasteHandler } from './pasteHandler.js';
import { initTranslate } from './translate.js';
import { createLoadingOverlay, showLoadingOverlay, hideLoadingOverlay } from './loadingOverlay.js';
import { initSubmitHandler, initThumbnailSelection } from './submitHandler.js';
import { createChatHandler } from './chatbotHandler.js'
import { initTemporalPagination } from './paginationTemporal.js';
import { initSettingsPanel } from './settingPanel.js'
import { initFilterPanel, fetchVideoNames, addExcludedFrame } from './filterPanel.js';

// Add at the top
let API_PREFIX = '/siu_pumpking_1/';

export function setApiPrefix(prefix) {
    API_PREFIX = prefix;
}

export function buildUrl(path) {
    console.log(API_PREFIX + path);
    return API_PREFIX + path;
}



document.addEventListener('DOMContentLoaded', () => {

    // Set the initial active tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Update to the new ID for the search content tab
    document.getElementById('tab-search-content').classList.add('active');

    window.buildUrl = buildUrl;
    window.addExcludedFrame = addExcludedFrame;

    createLoadingOverlay();
    // showLoadingOverlay();

    // try {
    //fetchVideoNames();
    initCharCounter();
    initTextAutoGrow();
    // initVideoFilter();
    // initS2TFilter();

    initVoiceRecognition();
    initTranslate();
    initPagination();
    initTemporalPagination();
    initSliderControls();

    initS2THover();
    initThumbnailView();
    initVideoView();
    initImageQueryToggle();
    initImageUpload();
    initPasteHandler();
    initSearchHandler();
    // initRerankHandler();
    initSubmitHandler();
    initThumbnailSelection();  // Initialize for initial thumbnails
    // createChatHandler();
    initSettingsPanel();
    initFilterPanel();
    initQueryHistory();
    // } catch (error) {
    //     alert('Loading UI error: ' + error.message);
    // } finally {
    //     // Hide loading overlay
    //     hideLoadingOverlay();
    // }
});
