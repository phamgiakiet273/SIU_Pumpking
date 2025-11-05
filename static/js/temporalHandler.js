// static/js/temporalHandler.js

import { performScrollSearch, performImageSearch } from './searchHandler.js'
import { addSubmissionButtons } from './submissionButtons.js';

export function displayTemporalResults(videoRowsList) {
    const videosContainer = document.getElementById('videos');
    videosContainer.innerHTML = '';
    videosContainer.classList.add('table-view');

    // Check for empty results
    if (!videoRowsList || videoRowsList.length === 0 || videoRowsList.every(row => row.every(cell => !cell))) {
        videosContainer.innerHTML = '<p>No temporal results found.</p>';
        return { flattenedResults: [], tableElement: null };
    }

    // The number of scenes is the number of columns
    const sceneCount = videoRowsList[0].length;

    const table = document.createElement('table');
    table.className = 'temporal-results';

    // Create table header
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')).innerHTML = `<span> Video </span>`;
    for (let i = 0; i < sceneCount; i++) {
        const sceneHeader = document.createElement('th');
        sceneHeader.innerHTML = `<span> SCENE ${i + 1} </span>`;
        headerRow.appendChild(sceneHeader);
    }
    table.appendChild(headerRow);

    let uniqueIndex = 0;
    const flattenedResultsWithUniqueIndex = [];

    // Iterate over the pre-sorted rows
    videoRowsList.forEach(videoScenes => {
        const firstValidScene = videoScenes.find(scene => scene !== null && scene !== undefined);
        if (!firstValidScene) return;

        const videoName = firstValidScene.video_name;
        const row = document.createElement('tr');

        // Add video name cell
        const videoCell = document.createElement('td');
        videoCell.textContent = videoName.replace(/\.mp4$/, '');
        row.appendChild(videoCell);

        // Add a cell for each scene
        videoScenes.forEach(scene => {
            const sceneCell = document.createElement('td');
            sceneCell.className = 'temporal-thumbnail';

            if (scene) {
                scene.index = uniqueIndex;
                flattenedResultsWithUniqueIndex.push(scene);

                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail';

                const encodedPath = encodeURIComponent(scene.frame_path);
                
                thumbnail.innerHTML = `
                    <div style="position: relative;">
                        <a class="fps" style="display: none;">${scene.fps||''}</a>
                        <div class="half previous" id="previous-${scene.index}"></div>
                        <div class="half after"    id="after-${scene.index}"></div>
                        <a class="video_id text-overlay-top"
                        data-imageid="${scene.video_name}"
                        target="${scene.index}">${scene.video_name.replace(/\.mp4$/, '')}</a>
                        <img src="hub/send_img/${encodedPath}"
                            id="${scene.index}"
                            class="lazy-image"
                            loading="lazy"
                            style="width: var(--thumbnail-width);
                                height: var(--thumbnail-height);" />
                        <a class="image_id text-overlay-bottom"
                        style="left: 0; bottom: 1.5rem;"
                        id="frame_name-${scene.index}"
                        target="${scene.index}">${scene.keyframe_id}</a>
                    </div>
                    <div style="align-items: center; display: flex; justify-content: center;">
                        <div style="position: absolute; bottom: 0; width: 40px; height: 1.5rem; z-index: 100; justify-self: center;"
                            class="description-hover"></div>
                        <p class="description">${scene.s2t}</p>
                    </div>
                `;

                // Add exclude button
                const excludeBtn = document.createElement('button');
                excludeBtn.type = 'button';
                excludeBtn.className = 'exclude-btn';
                excludeBtn.innerHTML = '&times;';
                excludeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.addExcludedFrame(scene);
                    // Show filter panel
                    document.querySelector('.filters-panel').style.display = 'block';                    
                });
                
                const thumbDiv = thumbnail.querySelector('div[style="position: relative;"]');
                thumbDiv.appendChild(excludeBtn);

                // Add get news button (shot utility)
                const getNewsBtn = document.createElement('button');
                getNewsBtn.type = 'button';
                getNewsBtn.className = 'get-news-btn';
                getNewsBtn.innerHTML = '📰';
                getNewsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    performScrollSearch(scene, 'shot'); // Add utility_feature='shot'
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
                    performScrollSearch(scene, 'dup'); // Changed to dup utility
                });
                thumbDiv.appendChild(imageSearchBtn);

                // Add uniqueness button
                const uniquenessBtn = document.createElement('button');
                uniquenessBtn.type = 'button';
                uniquenessBtn.className = 'uniqueness-btn';
                uniquenessBtn.title = scene.is_unique ? 'Unique frame' : 'Find unique version';
                
                // Set button style based on is_unique
                if (scene.is_unique) {
                    uniquenessBtn.style.backgroundColor = 'rgba(0, 255, 0, 0.3)'; // Green transparent
                    uniquenessBtn.innerHTML = '✓';
                } else {
                    uniquenessBtn.style.backgroundColor = 'rgba(255, 0, 0, 0.3)'; // Red transparent
                    uniquenessBtn.innerHTML = '✗';
                    uniquenessBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        performScrollSearch(scene, 'unique'); // unique utility
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
                uniquenessBtn.style.cursor = scene.is_unique ? 'default' : 'pointer';
                uniquenessBtn.style.display = 'flex';
                uniquenessBtn.style.alignItems = 'center';
                uniquenessBtn.style.justifyContent = 'center';
                uniquenessBtn.style.fontSize = '12px';
                uniquenessBtn.style.color = 'white';
                
                thumbDiv.appendChild(uniquenessBtn);

                setTimeout(() => {
                    addSubmissionButtons();
                }, 0);

                sceneCell.appendChild(thumbnail);
                uniqueIndex++;
            } else {
                sceneCell.classList.add('empty');
            }
            row.appendChild(sceneCell);
        });

        table.appendChild(row);
    });

    videosContainer.appendChild(table);

    return {
        flattenedResults: flattenedResultsWithUniqueIndex,
        tableElement: table
    };
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}