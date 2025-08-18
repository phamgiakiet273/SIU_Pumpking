// static/js/searchHandler.js

import { adjustThumbnailSize } from './sliderControls.js';
import { initS2THover } from './s2tHover.js'
import { initThumbnailView } from './thumbnailView.js';
import { initVideoView } from './videoView.js'
import { setResults } from './pagination.js';
import { createLoadingOverlay, showLoadingOverlay, hideLoadingOverlay } from './loadingOverlay.js';
import { displayTemporalResults } from './temporalHandler.js';
import { initThumbnailSelection } from './submitHandler.js'
import { translateText } from './translate.js';
import { setTemporalResults } from './paginationTemporal.js';
import { getFilters, updateExcludedList } from './filterPanel.js'; // Import filter functions

// Helper to count sentences in text
function countSentences(text) {
    const matches = text.match(/[^.!?]+[.!?]*/g);
    return matches ? matches.filter(s => s.trim().length).length : 0;
}

// Define API routes for each model and query type
const ROUTES = {
    META_V2: {
        text: 'hub/metaclip_v2_text_search',
        image: 'hub/metaclip_v2_image_search',
        temporal: 'hub/metaclip_v2_temporal_search',
        scroll: 'hub/metaclip_v2_scroll'
    },
    SIGLIP_V2: {
        text: 'hub/siglip_v2_text_search',
        image: 'hub/siglip_v2_image_search',
        temporal: 'hub/siglip_v2_temporal_search',
        scroll: 'hub/siglip_v2_scroll'
    },
    META: {
        text: 'hub/metaclip_text_search',
        image: 'hub/metaclip_image_search',
        temporal: 'hub/metaclip_temporal_search',
        scroll: 'hub/metaclip_scroll'
    }
};

export function initSearchHandler() {
    const form = document.getElementById('form');
    const videos = document.getElementById('videos');
    const textarea = document.getElementById('query');
    const charCountDiv = document.getElementById('charCount');
    const slider = document.getElementById('slider_k');
    const kInput = document.getElementById('k');
    const autoTranslateCheckbox = document.getElementById('auto-translate-checkbox');

    textarea.addEventListener('keydown', e => {
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.requestSubmit();
        }
    });

    createLoadingOverlay();

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab?.dataset.tab !== 'tab-search-content')
            return;

        showLoadingOverlay();
        try {

            const fd = new FormData(form);
            let queryText = fd.get('query').trim();
            const kVal = fd.get('k');

            // Read checkbox values from the settings panel
            const returnS2T = document.getElementById('return-s2t-checkbox').checked;
            const returnObject = document.getElementById('return-object-checkbox').checked;
            const frameClassFilter = document.getElementById('frame-class-filter-checkbox').checked;

            // Add them to the FormData object
            fd.set('return_s2t', returnS2T);
            fd.set('return_object', returnObject);
            fd.set('frame_class_filter', frameClassFilter);

            // Get filters from filter panel
            const filters = getFilters();
            fd.set('video_filter', filters.video_filter);
            fd.set('s2t_filter', filters.s2t_filter);
            fd.set('time_in', filters.time_in);
            fd.set('time_out', filters.time_out);
            fd.set('skip_frames', filters.skip_frames);

            let queryType = document.querySelector('input[name="query-type"]:checked').value;
            const model = document.querySelector('input[name="model"]:checked').value;

            // Handle auto-translate for text queries
            if (autoTranslateCheckbox.checked && queryType == 'text' && queryText) {
                try {
                    console.log(`Auto-translating text: "${queryText}"`);
                    queryText = await translateText(queryText);
                    console.log(`Translated text: "${queryText}"`);
                    textarea.value = queryText;
                } catch (err) {
                    alert(`Auto-translation failed: ${err.message}\nSearch cancelled.`);
                    hideLoadingOverlay();
                    return;
                }
            }

            // Update query history
            // if (queryText) {
            //     window.updateQueryHistory(queryText);
            //     document.getElementById('previous-query').textContent = queryText;
            // }

            fd.set('text', queryText);

            // Handle empty query - switch to scroll endpoint
            if (!queryText && queryType === 'text') {
                queryType = 'scroll';
            }

            // Fallback to non-temporal model for single-sentence queries
            let activeModel = model;
            if (model.startsWith('TEMPORAL_')) {
                if (queryType == 'text'){
                    if (countSentences(queryText) <= 1) {
                        console.log('Single-sentence detected, switching to non-temporal');
                        activeModel = model.replace('TEMPORAL_', '');
                    }
                    else {
                        queryType = 'temporal';
                        activeModel = model.replace('TEMPORAL_', '');
                    }
                }
            }

            // Sync slider and input
            slider.value = kVal;
            kInput.value = kVal;

            // Determine API URL
            const routeSet = ROUTES[activeModel] || {};
            let url = routeSet[queryType] || '';

            if (!url) {
                alert('Invalid model or query type');
                hideLoadingOverlay();
                return;
            }

            // Additional params for image query
            if (queryType == 'image') {
                const imagePreview = document.getElementById('image-preview');
                const imageUrlInput = document.getElementById('image-url');

                if (imagePreview.src.startsWith('data:')) {
                    fd.set('image_path', imagePreview.src);
                } else if (imageUrlInput.value) {
                    fd.set('image_path', imageUrlInput.value);
                } else {
                    alert('Please select an image first');
                    hideLoadingOverlay();
                    return;
                }
            } else if (queryType == 'temporal') {
                fd.set('return_list', 'true');
            }

            // Build full URL with prefix
            const fullUrl = buildUrl(url);

            // Execute request
            const resp = await fetch(fullUrl, { method: 'POST', body: fd });
            if (!resp.ok) {
                const err = await resp.text();
                alert('Search error: ' + err);
                return;
            }
            const payload = await resp.json();

            // Create search context object
            const searchContext = {
                timestamp: new Date().toISOString(),
                query: queryText,
                queryType,
                model: activeModel,
                filters: {
                    video_filter: filters.video_filter,
                    s2t_filter: filters.s2t_filter,
                    time_in: filters.time_in,
                    time_out: filters.time_out,
                    skip_frames: filters.skip_frames
                },
                settings: {
                    k: kVal,
                    returnS2T,
                    returnObject,
                    frameClassFilter
                },
                results: payload.data.data // Store actual results
            };

            // Update history with full context
            window.updateQueryHistory(searchContext);

            // Render results directly without new search
            renderResults(searchContext.results);

        } catch (error) {
            console.error("Unexpected search error:", error);
            alert('Search error: ' + error.message);
        } finally {
            hideLoadingOverlay();
        }
    });
}

// Helper to render thumbnail view
function renderThumbnails(results = [], container) {
    const frag = document.createDocumentFragment();
    results.forEach(rec => {
        const encodedPath = encodeURIComponent(rec.frame_path);
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        thumb.innerHTML = `
            <div style="position: relative;">
            <a class="fps" style="display: none;">${rec.fps || ''}</a>
            <div class="half previous" id="previous-${rec.index}"></div>
            <div class="half after" id="after-${rec.index}"></div>
            <a class="video_id text-overlay-top" data-imageid="${rec.video_name}" target="${rec.index}">${rec.video_name.replace(/\.mp4$/, '')}</a>
            <img src="hub/send_img/${encodedPath}" id="${rec.index}" class="lazy-image" loading="lazy" style="width: var(--thumbnail-width); height: var(--thumbnail-height);" />
            <a class="image_id text-overlay-bottom" style="left: 0; bottom: 1.5rem;" id="frame_name-${rec.index}" target="${rec.index}">${rec.keyframe_id}</a>
            </div>
            <div style="align-items: center; display: flex; justify-content: center;">
            <div class="description-hover" style="position: absolute; bottom: 0; width: 40px; height: 1.5rem; z-index: 100;"></div>
            <p class="description">${rec.s2t}</p>
            </div>
        `;

        // Add exclude button
        const excludeBtn = document.createElement('button');
        excludeBtn.type = 'button';  // <--- Add this line
        excludeBtn.className = 'exclude-btn';
        excludeBtn.innerHTML = '&times;';
        excludeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.addExcludedFrame(rec);
            // Show filter panel
            document.querySelector('.filters-panel').style.display = 'block';
        });

        const thumbDiv = thumb.querySelector('div[style="position: relative;"]');
        thumbDiv.appendChild(excludeBtn);

        // Add get news button
        const getNewsBtn = document.createElement('button');
        getNewsBtn.type = 'button';
        getNewsBtn.className = 'get-news-btn';
        getNewsBtn.innerHTML = '📰';
        getNewsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            performScrollSearch(rec);
        });
        thumbDiv.appendChild(getNewsBtn);


        frag.appendChild(thumb);
    });
    container.innerHTML = '';
    container.appendChild(frag);
    window.currentVideos = results;
}

export async function performScrollSearch(record) {
    showLoadingOverlay();

    try {

        // Get current model
        const model = document.querySelector('input[name="model"]:checked').value;
        let activeModel = model;

        // Handle temporal models
        if (model.startsWith('TEMPORAL_')) {
            activeModel = model.replace('TEMPORAL_', '');
        }

        // Get scroll endpoint
        const routeSet = ROUTES[activeModel] || {};
        const url = routeSet.scroll || '';

        if (!url) {
            throw new Error('Scroll endpoint not available for this model');
        }

        // Get current settings
        const kVal = document.getElementById('k').value;
        const returnS2T = document.getElementById('return-s2t-checkbox').checked;
        const returnObject = document.getElementById('return-object-checkbox').checked;
        const frameClassFilter = document.getElementById('frame-class-filter-checkbox').checked;

        // Prepare form data
        const fd = new FormData();
        const videoName = record.video_name.replace('.mp4', '');

        // Convert frames to time (mm:ss)
        const fps = parseFloat(record.fps);
        const startFrame = parseInt(record.related_start_frame);
        const endFrame = parseInt(record.related_end_frame);
        const startTime = frameToTime(startFrame, fps);
        const endTime = frameToTime(endFrame, fps);

        // Set parameters
        fd.set('k', 273); // Large enough to get all frames in segment
        fd.set('video_filter', videoName);
        fd.set('return_s2t', returnS2T);
        fd.set('return_object', returnObject);
        fd.set('frame_class_filter', frameClassFilter);
        fd.set('time_in', startTime);
        fd.set('time_out', endTime);

        // Build full URL
        const fullUrl = buildUrl(url);

        // Execute request
        const resp = await fetch(fullUrl, { method: 'POST', body: fd });
        if (!resp.ok) {
            const err = await resp.text();
            throw new Error('Scroll search error: ' + err);
        }

        const payload = await resp.json();

        // Create proper search context for scroll search
        const searchContext = {
            timestamp: new Date().toISOString(),
            query: '', // No text query for scroll
            queryType: 'scroll',
            model: activeModel,
            filters: {
                video_filter: videoName,
                s2t_filter: '',
                time_in: startTime,
                time_out: endTime,
                skip_frames: ''
            },
            settings: {
                k: kVal,
                returnS2T,
                returnObject,
                frameClassFilter
            },
            results: payload.data.data
        };

        // Update history
        window.updateQueryHistory(searchContext);

        // Render results
        renderResults(searchContext.results);

    } catch (error) {
        alert('Scroll search error: ' + error.message);
    } finally {
        hideLoadingOverlay();
    }
}

// Helper to convert frame number to mm:ss
function frameToTime(frame, fps) {
    const totalSeconds = Math.floor(frame / fps);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function renderResults(results) {
    // Clear previous results
    videos.innerHTML = '';
    videos.classList.remove('table-view');

    // Handle normal results (array of objects)
    if (Array.isArray(results) && results.length > 0 && results[0].video_name) {
        renderThumbnails(results, videos);
        setResults(results);
    }
    // Handle temporal results (array of arrays)
    else if (Array.isArray(results) && results.length > 0 && Array.isArray(results[0])) {
        videos.classList.add('table-view');
        const { flattenedResults, tableElement } = displayTemporalResults(results);
        setTemporalResults(tableElement);
    }
    // Handle object-based temporal results
    else if (results && results.rows) {
        videos.classList.add('table-view');
        const { flattenedResults, tableElement } = displayTemporalResults(results.rows);
        setTemporalResults(tableElement);
    }
    // Handle error cases
    else {
        console.error('Unknown results format', results);
        videos.innerHTML = '<p>No results found</p>';
    }

    adjustThumbnailSize();
    initS2THover();
    initThumbnailView();
    initVideoView();
    initThumbnailSelection();
}
export function loadSearchContext(context) {
    // Set form values
    document.getElementById('query').value = context.query;

    // Only set query type if it's not scroll or temporal
    if (context.queryType !== 'scroll' && context.queryType !== 'temporal') {
        const queryTypeRadio = document.querySelector(`input[name="query-type"][value="${context.queryType}"]`);
        if (queryTypeRadio) {
            queryTypeRadio.checked = true;
        }
    }

    let modelRadio;

    // Set model radio button
    if (context.queryType !== 'temporal'){
        modelRadio = document.querySelector(`input[name="model"][value="${context.model}"]`);
    }
    else {
        modelRadio = document.querySelector(`input[name="model"][value="TEMPORAL_${context.model}"]`);
    }

    if (modelRadio) {
        modelRadio.checked = true;
    }

    // Set settings
    document.getElementById('return-s2t-checkbox').checked = context.settings.returnS2T;
    document.getElementById('return-object-checkbox').checked = context.settings.returnObject;
    document.getElementById('frame-class-filter-checkbox').checked = context.settings.frameClassFilter;
    document.getElementById('k').value = context.settings.k;
    document.getElementById('slider_k').value = context.settings.k;

    // Set filters
    const filters = context.filters;
    document.getElementById('s2t_filter').value = filters.s2t_filter || '';
    document.getElementById('time_in').value = filters.time_in || '';
    document.getElementById('time_out').value = filters.time_out || '';

    // Set video filter
    if (filters.video_filter) {
        const videoNames = filters.video_filter.split(',');
        const dropdown = document.getElementById('video-names-dropdown');
        for (let option of dropdown.options) {
            option.selected = videoNames.includes(option.value);
        }
    }

    // Set excluded frames
    if (filters.skip_frames) {
        window.excludedFrames = filters.skip_frames.split(',').map(frame => {
            const [video_name, keyframe_id] = frame.split(':');
            return { video_name, keyframe_id };
        });
        updateExcludedList();
    }

    // Render results directly
    renderResults(context.results);

    // document.getElementById('prev-model').textContent = `(${context.model})`;
}
