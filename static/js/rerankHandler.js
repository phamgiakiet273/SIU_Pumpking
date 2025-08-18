// rerankHandler.js

import { adjustThumbnailSize } from './sliderControls.js';
import { initS2THover } from './s2tHover.js'
import { initThumbnailView } from './thumbnailView.js';
import { initVideoView } from './videoView.js'
import { setResults } from './pagination.js';
import { createLoadingOverlay, showLoadingOverlay, hideLoadingOverlay } from './loadingOverlay.js';
import { initThumbnailSelection } from './submitHandler.js'

export function initRerankHandler() {
    const rerankButton = document.getElementById('rerank-color-btn');
    if (!rerankButton) return;

    createLoadingOverlay();

    rerankButton.addEventListener('click', async () => {

        showLoadingOverlay();

        try {
            if (!window.currentVideos || window.currentVideos.length === 0) {
                alert('No videos to rerank. Please perform a search first.');
                return;
            }

            // Parse string representations
            const parsedVideos = window.currentVideos.map(video => {
                try {
                    return {
                        ...video,
                        s2t: parseStringArray(video.s2t),
                        object: parseObjectArray(video.object)
                    };
                } catch (error) {
                    console.error('Error parsing video metadata:', error);
                    return {
                        ...video,
                        s2t: [],
                        object: []
                    };
                }
            });

            try {
                const formData = new FormData();
                formData.append('video_metadata_list', JSON.stringify(parsedVideos));

                const response = await fetch('hub/rerank_color', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`Rerank failed: ${error}`);
                }

                const payload = await response.json();

                // Handle the response structure properly
                if (payload.data && Array.isArray(payload.data)) {
                    window.currentVideos = payload.data;
                } else if (payload.data && Array.isArray(payload.data.data)) {
                    // Handle nested data structure
                    window.currentVideos = payload.data.data;
                } else {
                    throw new Error('Invalid rerank response format');
                }

                renderVideoResults(window.currentVideos);
            } catch (error) {
                console.error('Rerank error:', error);
                alert(error.message);
            }
        } catch (error) {
            alert('Search error: ' + error.message);
        } finally {
            // Hide loading overlay
            hideLoadingOverlay();
        }
    });
}

function parseStringArray(str) {
    if (Array.isArray(str)) return str;
    if (typeof str === 'string') {
        try {
            // Handle Python-style string arrays
            if (str.startsWith('[') && str.endsWith(']')) {
                return JSON.parse(str.replace(/'/g, '"'));
            }
            // Handle space-separated words
            return str.split(/\s+/);
        } catch {
            return [];
        }
    }
    return [];
}

function parseObjectArray(str) {
    if (Array.isArray(str)) return str;
    if (typeof str === 'string') {
        try {
            // Handle Python-style object arrays
            if (str.startsWith('[') && str.endsWith(']')) {
                return JSON.parse(str.replace(/'/g, '"'));
            }
        } catch {
            return [];
        }
    }
    return [];
}

function renderVideoResults(records) {
    const videosContainer = document.getElementById('videos');
    videosContainer.innerHTML = '';
    const frag = document.createDocumentFragment();

    records.forEach(rec => {
        const encodedPath = encodeURIComponent(rec.frame_path);
        const s2tText = Array.isArray(rec.s2t) ? rec.s2t.join(' ') : rec.s2t;

        // console.log(rec)

        const tpl = document.createElement('div');
        tpl.className = 'thumbnail';
        tpl.innerHTML = `
            <div style="position: relative;">
                <a class="fps" style="display: none;">${rec.fps || ''}</a>
                <div class="half previous" id="previous-${rec.index}"></div>
                <div class="half after" id="after-${rec.index}"></div>
                <a class="video_id text-overlay-top"
                   data-imageid="${rec.video_name}"
                   target="${rec.index}">
                   ${rec.video_name.replace(/\.mp4$/, '')}
                </a>
                <img src="hub/send_img/${encodedPath}"  draggable="true"
                     id="${rec.index}"
                     class="lazy-image"
                     loading="lazy"
                     style="width: var(--thumbnail-width); height: var(--thumbnail-height);" />
                <a class="image_id text-overlay-bottom"
                   style="left: 0; bottom: 1.5rem;"
                   id="frame_name-${rec.index}"
                   target="${rec.index}">
                   ${rec.keyframe_id}
                </a>
            </div>
            <div style="align-items: center; display: flex; justify-content: center;">
                <div style="position: absolute; bottom: 0; width: 40px; height: 1.5rem; z-index: 100; justify-self: center;"
                     class="description-hover"></div>
                <p class="description">${s2tText}</p>
            </div>
        `;
        frag.appendChild(tpl);
    });
    videosContainer.appendChild(frag);     // single insert → single reflow

    // Reinitialize UI components
    setResults(records);
    adjustThumbnailSize();
    initS2THover();
    initThumbnailView();
    initVideoView();
    initThumbnailSelection();

}
