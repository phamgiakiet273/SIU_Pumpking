// static/js/pagination.js

import { adjustThumbnailSize } from './sliderControls.js';
import { initS2THover } from './s2tHover.js'
import { initThumbnailView } from './thumbnailView.js';
import { initVideoView } from './videoView.js'
import { performScrollSearch, performImageSearch } from './searchHandler.js'
import { addSubmissionButtons } from './submissionButtons.js';

// State variables
let currentPage = 1;
let resultsPerPage = 50; 
let totalResults = 0;
let allResults = [];
let thumbnailCache = {};

// DOM elements
let videosContainer;
let pageInfo;
let prevPageBtn;
let nextPageBtn;

export function initPagination() {
    videosContainer = document.getElementById('videos');
    pageInfo = document.getElementById('page-info');
    prevPageBtn = document.getElementById('prev-page');
    nextPageBtn = document.getElementById('next-page');

    resultsPerPage = parseInt(document.getElementById('results-per-page-slider').value, 10);
    
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    
    document.addEventListener('keydown', handleKeyDown);

    window.addEventListener('DOMContentLoaded', positionPaginator);
    window.addEventListener('resize',            positionPaginator);    
}

export function setResultsPerPage(newSize) {
    // Guard Clause: Do nothing if we are in temporal view
    if (videosContainer.classList.contains('table-view')) {
        return; 
    }

    resultsPerPage = newSize;
    const totalPages = Math.ceil(totalResults / resultsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    displayPage(currentPage);
}

function handleKeyDown(event) {
    if (window.isModalOpen) {
        return; 
    }

    // Guard Clause: Let the temporal handler manage keys
    if (videosContainer.classList.contains('table-view')) {
        return; 
    }

    const isInputFocused = document.activeElement.tagName === 'INPUT' || 
                          document.activeElement.tagName === 'TEXTAREA';
    
    if (isInputFocused) return;
    
    switch (event.key) {
        case 'ArrowLeft':
            goToPrevPage();
            break;
        case 'ArrowRight':
            goToNextPage();
            break;
        default:
            break;
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPage(currentPage);
    }
}

export function setResults(results, highlightIndex = -1) {
    allResults = results;
    totalResults = results.length;

    // Calculate which page contains the highlighted frame
    if (highlightIndex >= 0) {
        currentPage = Math.floor(highlightIndex / resultsPerPage) + 1;
    } else {
        currentPage = 1;
    }

    thumbnailCache = {};
    displayPage(currentPage, highlightIndex);
}

export function displayPage(page, highlightIndex = -1) {
    // Guard Clause: Do nothing if we are in temporal view
    if (videosContainer.classList.contains('table-view')) {
        return []; 
    }

    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
    const pageResults = allResults.slice(startIndex, endIndex);
    
    videosContainer.innerHTML = '';
    
    pageResults.forEach(rec => {
        const cacheKey = `${rec.video_name}_${rec.keyframe_id}`;
        
        if (thumbnailCache[cacheKey]) {
            videosContainer.appendChild(thumbnailCache[cacheKey]);
            return;
        }
        
        const thumbnail = createThumbnailElement(rec);
        thumbnailCache[cacheKey] = thumbnail;
        videosContainer.appendChild(thumbnail);
    });
    
    // After adding all thumbnails
    if (highlightIndex >= 0) {
        const pageStartIndex = (page - 1) * resultsPerPage;
        const pageEndIndex = Math.min(startIndex + resultsPerPage, totalResults);
        
        if (highlightIndex >= pageStartIndex && highlightIndex < pageEndIndex) {
            const localIndex = highlightIndex - pageStartIndex;
            const thumbnailElement = videosContainer.children[localIndex];
            if (thumbnailElement) {
                thumbnailElement.classList.add('highlighted');
                thumbnailElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    thumbnailElement.classList.remove('highlighted');
                }, 3000);
            }
        }
    }

    const totalPages = Math.ceil(totalResults / resultsPerPage) || 1;
    pageInfo.textContent = `${page}/${totalPages}`;
    
    prevPageBtn.disabled = (page === 1);
    nextPageBtn.disabled = (page === totalPages);
    
    adjustThumbnailSize();
    initS2THover();
    initThumbnailView();
    initVideoView();    

    return pageResults;
}

function createThumbnailElement(rec) {
    const encodedPath = encodeURIComponent(rec.frame_path);
    const s2tText = Array.isArray(rec.s2t) ? rec.s2t.join(' ') : rec.s2t;
    
    // Add frame class coloring
    const frameClass = rec.frame_class || 'unknown';
    const frameClassColors = {
        '0': 'red',
        '1': 'orange',
        '2': 'green',
        '3': 'yellow',
        'unknown': 'transparent'
    };
    
    const borderColor = frameClassColors[frameClass] || 'transparent';
    
    const tpl = document.createElement('div');
    tpl.className = 'thumbnail';
    tpl.style.border = `3px solid ${borderColor}`;
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

    // Add exclude button
    const excludeBtn = document.createElement('button');
    excludeBtn.type = 'button';
    excludeBtn.className = 'exclude-btn';
    excludeBtn.innerHTML = '&times;';
    excludeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.addExcludedFrame(rec);
        // Show filter panel
        document.querySelector('.filters-panel').style.display = 'block';        
    });
    
    const thumbDiv = tpl.querySelector('div[style="position: relative;"]');
    thumbDiv.appendChild(excludeBtn);
    
    // Add get news button (shot utility)
    const getNewsBtn = document.createElement('button');
    getNewsBtn.type = 'button';
    getNewsBtn.className = 'get-news-btn';
    getNewsBtn.innerHTML = '📰';
    getNewsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        performScrollSearch(rec, 'shot'); // Add utility_feature='shot'
    });
    thumbDiv.appendChild(getNewsBtn);

    // Add image search button (now becomes dup utility)
    const imageSearchBtn = document.createElement('button');
    imageSearchBtn.type = 'button';
    imageSearchBtn.className = 'image-search-btn';
    imageSearchBtn.innerHTML = '🖼️';
    imageSearchBtn.title = 'Find similar frames (dup)';
    imageSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        performScrollSearch(rec, 'dup'); // Changed to dup utility
    });
    thumbDiv.appendChild(imageSearchBtn);

    // Add uniqueness button
    const uniquenessBtn = document.createElement('button');
    uniquenessBtn.type = 'button';
    uniquenessBtn.className = 'uniqueness-btn';
    uniquenessBtn.title = rec.is_unique ? 'Unique frame' : 'Find unique version';
    
    // Set button style based on is_unique
    if (rec.is_unique) {
        uniquenessBtn.style.backgroundColor = 'rgba(0, 255, 0, 0.3)'; // Green transparent
        uniquenessBtn.innerHTML = '✓';
    } else {
        uniquenessBtn.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // Red transparent
        uniquenessBtn.innerHTML = '✗';
        uniquenessBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            performScrollSearch(rec, 'unique'); // unique utility
        });
    }
    
    // Style the button
    uniquenessBtn.style.position = 'absolute';
    uniquenessBtn.style.bottom = '25px';
    uniquenessBtn.style.right = '5px';
    uniquenessBtn.style.width = '20px';
    uniquenessBtn.style.height = '20px';
    uniquenessBtn.style.border = 'none';
    uniquenessBtn.style.borderRadius = '4px';
    uniquenessBtn.style.cursor = rec.is_unique ? 'default' : 'pointer';
    uniquenessBtn.style.display = 'flex';
    uniquenessBtn.style.alignItems = 'center';
    uniquenessBtn.style.justifyContent = 'center';
    uniquenessBtn.style.fontSize = '12px';
    uniquenessBtn.style.color = 'white';
    
    thumbDiv.appendChild(uniquenessBtn);

    setTimeout(() => {
        addSubmissionButtons();
    }, 0);

    return tpl;
}

function positionPaginator() {
  const sidebar = document.querySelector('.filters');
  const paginator = document.querySelector('.pagination-controls');
  if (!sidebar || !paginator) return;

  const rect = sidebar.getBoundingClientRect();

  paginator.style.position = 'fixed';
  paginator.style.left     = (
    rect.left 
    + (rect.width  - paginator.offsetWidth) / 2
  ) + 'px';
  paginator.style.top      = (
    rect.bottom 
    - paginator.offsetHeight 
    - 16
  ) + 'px';
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}