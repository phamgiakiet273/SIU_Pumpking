let managedResults = [];
let selectedFrames = new Set();
let thumbnailSize = 200; // Default size
let sortableInstance = null;
let lastSelectedIndex = null; // Track last selected index for range selection


// TRAKE mode variables
let isTrakeMode = false;
let markedTimestamps = [];
let videoFps = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upload-csv').addEventListener('change', handleCsvUpload);
    document.getElementById('download-adjusted-csv').addEventListener('click', downloadAdjustedCsv);
    

    // TRAKE mode toggle
    document.getElementById('toggle-trake-mode').addEventListener('click', toggleTrakeMode);
    
    // Manual TRAKE entry
    document.getElementById('add-manual-trake').addEventListener('click', addManualTrake);
    
    // TRAKE actions
    document.getElementById('download-trake-csv').addEventListener('click', downloadTrakeCsv);
    document.getElementById('clear-trake-list').addEventListener('click', clearTrakeList);
    
    // Keyboard event for marking timestamps
    document.addEventListener('keydown', handleTrakeKeypress);    

    // New event listeners for range and advanced VQA
    document.getElementById('add-range-btn').addEventListener('click', openRangeModal);
    document.getElementById('vqa-advanced').addEventListener('change', toggleVqaAdvanced);
    
    // Range modal buttons
    document.getElementById('add-range-start').addEventListener('click', () => addFrameRange('start'));
    document.getElementById('add-range-end').addEventListener('click', () => addFrameRange('end'));
    document.getElementById('add-range-custom').addEventListener('click', () => addFrameRange('custom'));
    
    // Close range modal
    document.querySelector('.close-range-modal').addEventListener('click', closeRangeModal);

    // Manual entry button handlers
    document.getElementById('add-to-start-btn').addEventListener('click', () => addManualEntry('start'));
    document.getElementById('add-to-end-btn').addEventListener('click', () => addManualEntry('end'));
    document.getElementById('add-at-position-btn').addEventListener('click', () => addManualEntry('custom'));
    
    // Position option handlers
    document.querySelectorAll('input[name="upload-position"]').forEach(radio => {
        radio.addEventListener('change', toggleUploadPositionInput);
    });
    
    // Selection controls
    document.getElementById('select-all-btn').addEventListener('click', selectAllFrames);
    document.getElementById('deselect-all-btn').addEventListener('click', deselectAllFrames);
    document.getElementById('delete-selected-btn').addEventListener('click', deleteSelectedFrames);
    
    // Thumbnail size control
    const sizeSlider = document.getElementById('thumbnail-size');
    const sizeValue = document.getElementById('size-value');
    sizeSlider.addEventListener('input', () => {
        thumbnailSize = parseInt(sizeSlider.value);
        sizeValue.textContent = `${thumbnailSize}px`;
        updateThumbnailSize();
    });
    
    // Video modal
    const modal = document.getElementById('video-modal');
    const span = document.getElementsByClassName('close')[0];
    
    span.onclick = function() {
        modal.style.display = "none";
        const video = document.getElementById('modal-video');
        video.pause();
        video.src = "";
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            const video = document.getElementById('modal-video');
            video.pause();
            video.src = "";
        }
    }
});

function toggleUploadPositionInput() {
    const customInput = document.getElementById('upload-position-index');
    customInput.disabled = document.querySelector('input[name="upload-position"]:checked').value !== 'custom';
}

function handleCsvUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        parseAndDisplayCsv(String(e.target.result || ''));
    };
    reader.readAsText(file);
}

function parseAndDisplayCsv(csvContent) {
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    const newResults = [];

    lines.forEach(line => {
        const parts = line.split(',').map(p => p ? p.trim() : '');
        const [videoName, frameId, thirdColumn] = parts;
        if (videoName && frameId) {
            newResults.push({
                video_name: videoName,
                keyframe_id: frameId,
                third_column: thirdColumn || '',
            });
        }
    });

    if (newResults.length === 0) return;

    // Determine insertion position
    const positionOption = document.querySelector('input[name="upload-position"]:checked').value;
    let insertIndex = 0;
    
    if (positionOption === 'end') {
        insertIndex = managedResults.length;
    } else if (positionOption === 'custom') {
        insertIndex = parseInt(document.getElementById('upload-position-index').value) - 1;
        insertIndex = Math.max(0, Math.min(insertIndex, managedResults.length));
    }
    
    // Insert new results
    managedResults.splice(insertIndex, 0, ...newResults);
    
    displayManagedResults();
    
    // Reset file input
    document.getElementById('upload-csv').value = '';
}

function addFrameRange(positionOption) {
    const videoName = document.getElementById('range-video-name').value.trim();
    const startFrame = document.getElementById('range-start-frame').value.trim();
    const endFrame = document.getElementById('range-end-frame').value.trim();
    const interval = parseInt(document.getElementById('range-interval').value) || 1;

    if (!videoName || !startFrame || !endFrame) {
        alert('Please enter video name, start frame, and end frame');
        return;
    }

    // Validate frame format (5-digit numbers)
    const frameRegex = /^\d{5}$/;
    if (!frameRegex.test(startFrame) || !frameRegex.test(endFrame)) {
        alert('Start and end frames must be 5-digit numbers (e.g., 00001)');
        return;
    }

    const startNum = parseInt(startFrame);
    const endNum = parseInt(endFrame);

    if (startNum > endNum) {
        alert('Start frame must be less than or equal to end frame');
        return;
    }

    if (interval < 1) {
        alert('Interval must be at least 1');
        return;
    }

    let insertIndex = 0;
    
    if (positionOption === 'end') {
        insertIndex = managedResults.length;
    } else if (positionOption === 'custom') {
        // Prompt for position
        const maxPosition = managedResults.length + 1;
        let position = parseInt(prompt(`Enter position (1 to ${maxPosition}):`, "1"));
        
        // Validate input
        if (isNaN(position) || position < 1 || position > maxPosition) {
            alert(`Please enter a valid position between 1 and ${maxPosition}`);
            return;
        }
        
        insertIndex = position - 1;
    }

    // Generate frame entries
    const newEntries = [];
    for (let frameNum = startNum; frameNum <= endNum; frameNum += interval) {
        const frameId = frameNum.toString().padStart(5, '0') + '.jpg';
        newEntries.push({
            video_name: videoName,
            keyframe_id: frameId,
            third_column: '',
        });
    }

    if (newEntries.length === 0) {
        alert('No frames to add. Check your range and interval values.');
        return;
    }

    // Insert new entries
    managedResults.splice(insertIndex, 0, ...newEntries);
    
    // Adjust selections for items that moved
    const newSelected = new Set();
    selectedFrames.forEach(oldIndex => {
        if (oldIndex >= insertIndex) {
            newSelected.add(oldIndex + newEntries.length);
        } else {
            newSelected.add(oldIndex);
        }
    });
    selectedFrames = newSelected;
    
    // Adjust lastSelectedIndex if needed
    if (lastSelectedIndex !== null && lastSelectedIndex >= insertIndex) {
        lastSelectedIndex += newEntries.length;
    }
    
    displayManagedResults();
    closeRangeModal();
    
    // Show confirmation
    alert(`Added ${newEntries.length} frames from ${startFrame} to ${endFrame} with interval ${interval}`);
}

function displayManagedResults() {
    const container = document.getElementById('results-container');
    container.innerHTML = '';
    
    // Apply thumbnail size
    container.style.gridTemplateColumns = `repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))`;

    managedResults.forEach((result, index) => {
        const thumb = createManagedThumbnail(result, index);
        container.appendChild(thumb);
    });

    initDragAndDrop();
    updateSelectionControls();
}

function createManagedThumbnail(result, index) {
    const thumb = document.createElement('div');
    thumb.className = 'thumbnail managed-thumbnail';
    thumb.dataset.video = result.video_name;
    thumb.dataset.frame = result.keyframe_id;
    thumb.dataset.index = index;
    
    if (selectedFrames.has(index)) {
        thumb.classList.add('selected');
    }

    const base = result.keyframe_id.split('.').shift();

    // Build URLs (encode each path segment)
    const avifUrl = `/siu_pumpking_2/result_manager/send_img/${encodeURIComponent(result.video_name)}/${encodeURIComponent(base + '.avif')}`;
    const jpgUrl = `/siu_pumpking_2/result_manager/send_img_original/${encodeURIComponent(result.video_name)}/${encodeURIComponent(base + '.jpg')}`;

    // Inline SVG placeholder
    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4ODgiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';

    // Build inner DOM elements
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';

    const img = document.createElement('img');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    // Set a simple attribute to guard against infinite onerror loops
    img._triedFallback = false;

    // First try avif
    img.src = avifUrl;

    // onerror -> try jpg once, otherwise placeholder
    img.onerror = function () {
        if (!this._triedFallback) {
            this._triedFallback = true;
            this.src = jpgUrl;
            return;
        }
        this.onerror = null;
        this.src = placeholder;
    };

    // Loading indicator
    const loading = document.createElement('div');
    loading.className = 'thumb-loading';
    loading.textContent = 'Loading...';
    loading.style.position = 'absolute';
    loading.style.left = '6px';
    loading.style.top = '6px';
    loading.style.padding = '2px 6px';
    loading.style.background = 'rgba(0,0,0,0.5)';
    loading.style.color = 'white';
    loading.style.fontSize = '12px';
    loading.style.borderRadius = '4px';
    wrapper.appendChild(loading);

    img.onload = function () {
        if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
    };
    img.onerror = function () {
        if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
    };

    // Index indicator
    const indexIndicator = document.createElement('div');
    indexIndicator.className = 'thumb-index';
    indexIndicator.textContent = index + 1;
    indexIndicator.title = `Position: ${index + 1}`;

    // Selection checkbox
    const selectCheckbox = document.createElement('input');
    selectCheckbox.type = 'checkbox';
    selectCheckbox.className = 'thumb-checkbox';
    selectCheckbox.checked = selectedFrames.has(index);
    selectCheckbox.addEventListener('click', (e) => {
        e.stopPropagation();
        handleFrameSelection(e, index);
    });

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-thumbnail';
    delBtn.title = 'Remove';
    delBtn.textContent = '×';
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteThumbnail(result.video_name, result.keyframe_id);
    });

    // Video button
    const videoBtn = document.createElement('button');
    videoBtn.className = 'video-thumbnail';
    videoBtn.title = 'Play Video at Frame';
    videoBtn.innerHTML = '▶';
    videoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openVideoViewer(result.video_name, result.keyframe_id);
    });

    // Assemble
    wrapper.appendChild(img);
    wrapper.appendChild(indexIndicator);
    wrapper.appendChild(selectCheckbox);
    wrapper.appendChild(delBtn);
    wrapper.appendChild(videoBtn);

    const info = document.createElement('div');
    info.className = 'thumb-info';
    info.innerHTML = `<span>${escapeHtml(result.video_name)}</span>, <span>${escapeHtml(result.keyframe_id)}</span>`;

    thumb.appendChild(wrapper);
    thumb.appendChild(info);

    // Click to select
    thumb.addEventListener('click', (e) => {
        if (e.target === delBtn || e.target === videoBtn || e.target.tagName === 'INPUT') return;
        
        handleFrameSelection(e, index);
    });

    return thumb;
}

function handleFrameSelection(event, index) {
    const isSelected = selectedFrames.has(index);
    
    // Handle multi-select with Ctrl/Cmd key
    if (event.ctrlKey || event.metaKey) {
        // Toggle selection of this item
        toggleFrameSelection(index, !isSelected);
        lastSelectedIndex = index;
    } 
    // Handle range selection with Shift key
    else if (event.shiftKey && lastSelectedIndex !== null) {
        // Select all items between lastSelectedIndex and current index
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        
        for (let i = start; i <= end; i++) {
            toggleFrameSelection(i, true);
        }
    } 
    // Regular click - toggle selection of this item only
    else {
        // If this frame is already selected, deselect it
        if (isSelected) {
            toggleFrameSelection(index, false);
            lastSelectedIndex = null;
        } else {
            // Clear all selections and select current item
            selectedFrames.forEach(selectedIndex => {
                toggleFrameSelection(selectedIndex, false);
            });
            
            toggleFrameSelection(index, true);
            lastSelectedIndex = index;
        }
    }
    
    updateSelectionControls();
}

function toggleFrameSelection(index, selected) {
    if (selected) {
        selectedFrames.add(index);
    } else {
        selectedFrames.delete(index);
    }
    
    // Update visual selection state
    const thumb = document.querySelector(`.managed-thumbnail[data-index="${index}"]`);
    if (thumb) {
        thumb.classList.toggle('selected', selected);
        const checkbox = thumb.querySelector('.thumb-checkbox');
        if (checkbox) {
            checkbox.checked = selected;
        }
    }
}

function updateSelectionControls() {
    const deleteBtn = document.getElementById('delete-selected-btn');
    deleteBtn.disabled = selectedFrames.size === 0;
}

function selectAllFrames() {
    // Select all
    managedResults.forEach((_, index) => selectedFrames.add(index));
    lastSelectedIndex = managedResults.length - 1;
    
    // Update checkboxes and visual state
    document.querySelectorAll('.thumb-checkbox').forEach((checkbox, index) => {
        checkbox.checked = selectedFrames.has(index);
    });
    
    document.querySelectorAll('.managed-thumbnail').forEach((thumb, index) => {
        thumb.classList.toggle('selected', selectedFrames.has(index));
    });
    
    updateSelectionControls();
}

function deselectAllFrames() {
    // Deselect all
    selectedFrames.clear();
    lastSelectedIndex = null;
    
    // Update checkboxes and visual state
    document.querySelectorAll('.thumb-checkbox').forEach((checkbox, index) => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('.managed-thumbnail').forEach((thumb, index) => {
        thumb.classList.remove('selected');
    });
    
    updateSelectionControls();
}

function deleteSelectedFrames() {
    if (selectedFrames.size === 0) return;
    
    // Convert to array and sort in descending order for safe deletion
    const indicesToDelete = Array.from(selectedFrames).sort((a, b) => b - a);
    
    indicesToDelete.forEach(index => {
        managedResults.splice(index, 1);
    });
    
    selectedFrames.clear();
    lastSelectedIndex = null;
    displayManagedResults();
}

function initDragAndDrop() {
    const container = document.getElementById('results-container');
    if (typeof Sortable !== 'undefined') {
        // Destroy previous instance if it exists
        if (sortableInstance) {
            sortableInstance.destroy();
        }
        
        sortableInstance = new Sortable(container, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            filter: '.thumb-checkbox, .delete-thumbnail, .video-thumbnail',
            preventOnFilter: true,
            onStart: function(evt) {
                // Clear selection when starting to drag
                selectedFrames.clear();
                lastSelectedIndex = null;
                updateSelectionControls();
            },
            onEnd: function(evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;
                if (oldIndex == null || newIndex == null) return;
                
                // Update our data array
                const movedItem = managedResults.splice(oldIndex, 1)[0];
                managedResults.splice(newIndex, 0, movedItem);
                
                displayManagedResults();
            }
        });
    }
}

function deleteThumbnail(videoName, frameId) {
    const index = managedResults.findIndex(r =>
        r.video_name === videoName && r.keyframe_id === frameId
    );

    if (index !== -1) {
        managedResults.splice(index, 1);
        selectedFrames.delete(index);
        
        if (lastSelectedIndex === index) {
            lastSelectedIndex = null;
        }
        
        // Adjust remaining selections
        const newSelected = new Set();
        selectedFrames.forEach(oldIndex => {
            if (oldIndex > index) {
                newSelected.add(oldIndex - 1);
            } else if (oldIndex < index) {
                newSelected.add(oldIndex);
            }
        });
        selectedFrames = newSelected;
        
        // Adjust lastSelectedIndex if needed
        if (lastSelectedIndex !== null && lastSelectedIndex > index) {
            lastSelectedIndex--;
        }
        
        displayManagedResults();
    }
}

function addManualEntry(positionOption) {
    const videoName = document.getElementById('manual-video-name').value.trim();
    const frameId = document.getElementById('manual-frame-id').value.trim();

    if (!videoName || !frameId) {
        alert('Please enter both video name and frame ID');
        return;
    }

    const newEntry = {
        video_name: videoName,
        keyframe_id: frameId,
        third_column: '',
    };

    let insertIndex = 0;
    
    if (positionOption === 'end') {
        insertIndex = managedResults.length;
    } else if (positionOption === 'custom') {
        // Prompt for position
        const maxPosition = managedResults.length + 1;
        let position = parseInt(prompt(`Enter position (1 to ${maxPosition}):`, "1"));
        
        // Validate input
        if (isNaN(position) || position < 1 || position > maxPosition) {
            alert(`Please enter a valid position between 1 and ${maxPosition}`);
            return;
        }
        
        insertIndex = position - 1;
    }
    
    // Insert new entry
    managedResults.splice(insertIndex, 0, newEntry);
    
    // Adjust selections for items that moved
    const newSelected = new Set();
    selectedFrames.forEach(oldIndex => {
        if (oldIndex >= insertIndex) {
            newSelected.add(oldIndex + 1);
        } else {
            newSelected.add(oldIndex);
        }
    });
    selectedFrames = newSelected;
    
    // Adjust lastSelectedIndex if needed
    if (lastSelectedIndex !== null && lastSelectedIndex >= insertIndex) {
        lastSelectedIndex++;
    }
    
    displayManagedResults();

    // Clear inputs
    document.getElementById('manual-video-name').value = '';
    document.getElementById('manual-frame-id').value = '';
}

function toggleVqaAdvanced() {
    const advancedChecked = document.getElementById('vqa-advanced').checked;
    document.getElementById('vqa-basic').style.display = advancedChecked ? 'none' : 'block';
    document.getElementById('vqa-advanced-options').style.display = advancedChecked ? 'block' : 'none';
}

function openRangeModal() {
    document.getElementById('range-modal').style.display = 'block';
}

function closeRangeModal() {
    document.getElementById('range-modal').style.display = 'none';
}

function downloadAdjustedCsv() {
    if (managedResults.length === 0) {
        alert('No results to download');
        return;
    }

    const isAdvanced = document.getElementById('vqa-advanced').checked;
    let csvContent = '';

    if (isAdvanced) {
        // Get VQA values for different ranges
        const vqaRow1 = document.getElementById('vqa-row1').value.trim();
        const vqaRow2_5 = document.getElementById('vqa-row2-5').value.trim();
        const vqaRow6_20 = document.getElementById('vqa-row6-20').value.trim();
        const vqaRow21_50 = document.getElementById('vqa-row21-50').value.trim();
        const vqaRow51_end = document.getElementById('vqa-row51-end').value.trim();

        managedResults.forEach((result, index) => {
            let vqaValue = '';
            
            if (index === 0 && vqaRow1) {
                vqaValue = vqaRow1;
            } else if (index >= 1 && index < 5 && vqaRow2_5) {
                vqaValue = vqaRow2_5;
            } else if (index >= 5 && index < 20 && vqaRow6_20) {
                vqaValue = vqaRow6_20;
            } else if (index >= 20 && index < 50 && vqaRow21_50) {
                vqaValue = vqaRow21_50;
            } else if (index >= 50 && vqaRow51_end) {
                vqaValue = vqaRow51_end;
            }
            
            csvContent += `${result.video_name},${result.keyframe_id},"${vqaValue}"\n`;
        });
    } else {
        const thirdColumnValue = document.getElementById('third-column-value').value.trim();
        
        managedResults.forEach(result => {
            if (thirdColumnValue) {
                csvContent += `${result.video_name},${result.keyframe_id},"${thirdColumnValue}"\n`;
            } else {
                csvContent += `${result.video_name},${result.keyframe_id}\n`;
            }
        });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adjusted_result.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function openVideoViewer(videoName, frameId) {
    try {
        // Get FPS for the video
        const fpsResponse = await fetch(`/siu_pumpking_2/result_manager/get_fps/${encodeURIComponent(videoName)}`);
        const fpsData = await fpsResponse.json();
        const fps = fpsData.data;

        // Store FPS for later use
        const modal = document.getElementById('video-modal');
        videoFps = fps;
        modal.dataset.videoName = videoName;
        modal.dataset.fps = fps;
        
        // Extract frame number from frame ID (assuming format like "03867.jpg")
        const frameNumber = parseInt(frameId.split('.')[0]);
        
        // Calculate timestamp
        const timestamp = frameNumber / fps;
        
        // Format timestamp as HH:MM:SS.mmm
        const hours = Math.floor(timestamp / 3600);
        const minutes = Math.floor((timestamp % 3600) / 60);
        const seconds = Math.floor(timestamp % 60);
        const milliseconds = Math.floor((timestamp % 1) * 1000);
        
        const timestampStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        
        // Get video URL
        const videoUrl = `/siu_pumpking_2/result_manager/send_video/${encodeURIComponent(videoName)}`;
        
        // Show modal with video
        const video = document.getElementById('modal-video');
        const videoTitle = document.getElementById('video-title');
        const videoTimestamp = document.getElementById('video-timestamp');
        
        videoTitle.textContent = `Video: ${videoName}`;
        videoTimestamp.textContent = `Starts at: ${timestampStr} (Frame: ${frameNumber})`;
        
        video.src = videoUrl;
        video.currentTime = timestamp;
        
        modal.style.display = "block";
        
        // Add event listener for pause event
        video.addEventListener('pause', handleVideoPause);
        
        // Add event listeners for the new buttons
        document.getElementById('add-paused-start').addEventListener('click', () => addPausedFrame('start'));
        document.getElementById('add-paused-end').addEventListener('click', () => addPausedFrame('end'));
        document.getElementById('add-paused-custom').addEventListener('click', () => addPausedFrame('custom'));
        
    } catch (error) {
        console.error('Error opening video:', error);
        alert('Could not open video. Please check the console for details.');
    }
}

function handleVideoPause() {
    const video = document.getElementById('modal-video');
    const modal = document.getElementById('video-modal');
    const fps = parseFloat(modal.dataset.fps);
    const videoName = modal.dataset.videoName;
    
    // Calculate frame number from current time
    const currentTime = video.currentTime;
    const frameNumber = Math.floor(currentTime * fps);
    const frameId = frameNumber.toString().padStart(5, '0') + '.jpg';
    
    // Format time for display
    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor((currentTime % 3600) / 60);
    const seconds = Math.floor(currentTime % 60);
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    
    // Update pause info display
    document.getElementById('paused-time').textContent = `Time: ${timeString}`;
    document.getElementById('paused-frame').textContent = `Frame: ${frameId}`;
    document.getElementById('pause-info').style.display = 'block';
    
    // Store the current frame info for later use
    modal.dataset.pausedTime = currentTime;
    modal.dataset.pausedFrame = frameId;
}

function addPausedFrame(positionOption) {
    const modal = document.getElementById('video-modal');
    const videoName = modal.dataset.videoName;
    const frameId = modal.dataset.pausedFrame;
    
    if (!frameId) {
        alert('No frame information available. Please pause the video first.');
        return;
    }
    
    const newEntry = {
        video_name: videoName,
        keyframe_id: frameId,
        third_column: '',
    };

    let insertIndex = 0;
    
    if (positionOption === 'end') {
        insertIndex = managedResults.length;
    } else if (positionOption === 'custom') {
        // Prompt for position
        const maxPosition = managedResults.length + 1;
        let position = parseInt(prompt(`Enter position (1 to ${maxPosition}):`, "1"));
        
        // Validate input
        if (isNaN(position) || position < 1 || position > maxPosition) {
            alert(`Please enter a valid position between 1 and ${maxPosition}`);
            return;
        }
        
        insertIndex = position - 1;
    }
    
    // Insert new entry
    managedResults.splice(insertIndex, 0, newEntry);
    
    // Adjust selections for items that moved
    const newSelected = new Set();
    selectedFrames.forEach(oldIndex => {
        if (oldIndex >= insertIndex) {
            newSelected.add(oldIndex + 1);
        } else {
            newSelected.add(oldIndex);
        }
    });
    selectedFrames = newSelected;
    
    // Adjust lastSelectedIndex if needed
    if (lastSelectedIndex !== null && lastSelectedIndex >= insertIndex) {
        lastSelectedIndex++;
    }
    
    displayManagedResults();
    
    // Show confirmation
    alert(`Frame ${frameId} added to position ${insertIndex + 1}`);
}

function updateThumbnailSize() {
    displayManagedResults();
}

function toggleTrakeMode() {
    isTrakeMode = !isTrakeMode;
    const trakeBtn = document.getElementById('toggle-trake-mode');
    const trakePanel = document.getElementById('trake-panel');
    
    if (isTrakeMode) {
        trakeBtn.textContent = 'Disable TRAKE Mode';
        trakeBtn.classList.add('active');
        trakePanel.style.display = 'block';
        initTrakeMode();
    } else {
        trakeBtn.textContent = 'Enable TRAKE Mode';
        trakeBtn.classList.remove('active');
        trakePanel.style.display = 'none';
    }
}

function initTrakeMode() {
    // Initialize TRAKE mode functionality
    markedTimestamps = [];
    updateTrakeList();
    
    // Setup progress bar hover events
    const progressBar = document.querySelector('.progress-bar');
    const hoverTime = document.querySelector('.hover-time');
    const video = document.getElementById('modal-video');
    
    if (progressBar && video) {
        progressBar.addEventListener('mousemove', (e) => {
            if (!isTrakeMode) return;
            
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const time = percent * video.duration;
            
            // Position hover time indicator
            hoverTime.style.left = `${percent * 100}%`;
            hoverTime.textContent = formatTime(time);
            hoverTime.style.display = 'block';
        });
        
        progressBar.addEventListener('mouseleave', () => {
            hoverTime.style.display = 'none';
        });
    }
}

function handleTrakeKeypress(e) {
    if (!isTrakeMode || e.key !== 'e' && e.key !== 'E') return;
    
    const video = document.getElementById('modal-video');
    if (video) {
        markTimestamp(video.currentTime);
    }
}

function markTimestamp(time) {
    const video = document.getElementById('modal-video');
    const modal = document.getElementById('video-modal');
    const fps = parseFloat(modal.dataset.fps);
    
    if (!video || !fps) return;
    
    const frame = Math.floor(time * fps);
    const frameId = frame.toString().padStart(5, '0') + '.jpg';
    
    // Check if this timestamp already exists
    const exists = markedTimestamps.some(ts => 
        Math.abs(ts.time - time) < 0.1 // Within 0.1 seconds
    );
    
    if (exists) {
        alert('Timestamp already marked!');
        return;
    }
    
    markedTimestamps.push({
        time: time,
        frame: frame,
        frameId: frameId,
        formattedTime: formatTime(time)
    });
    
    // Sort by time
    markedTimestamps.sort((a, b) => a.time - b.time);
    
    updateTrakeList();
}

function addManualTrake() {
    const timeInput = document.getElementById('trake-time-input').value.trim();
    const frameInput = document.getElementById('trake-frame-input').value.trim();
    const modal = document.getElementById('video-modal');
    const fps = parseFloat(modal.dataset.fps);
    
    if (!fps) {
        alert('Video information not loaded. Please try again.');
        return;
    }
    
    let time = 0;
    
    if (timeInput) {
        // Parse time in MM:SS format
        const parts = timeInput.split(':');
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
            alert('Please enter time in MM:SS format');
            return;
        }
        
        const minutes = parseInt(parts[0]);
        const seconds = parseInt(parts[1]);
        
        if (minutes < 0 || seconds < 0 || seconds >= 60) {
            alert('Invalid time format. Use MM:SS where SS is between 00-59');
            return;
        }
        
        time = minutes * 60 + seconds;
    } else if (frameInput) {
        // Parse frame input (expecting format like 00123.jpg or just 123)
        let frameNum;
        if (frameInput.includes('.')) {
            // Extract numbers from frame ID
            const base = frameInput.split('.')[0];
            frameNum = parseInt(base);
        } else {
            frameNum = parseInt(frameInput);
        }
        
        if (isNaN(frameNum) || frameNum < 0) {
            alert('Please enter a valid frame number');
            return;
        }
        
        time = frameNum / fps;
    } else {
        alert('Please enter either a time or frame number');
        return;
    }
    
    markTimestamp(time);
    
    // Clear inputs
    document.getElementById('trake-time-input').value = '';
    document.getElementById('trake-frame-input').value = '';
}

function updateTrakeList() {
    const listContainer = document.getElementById('trake-list');
    const countElement = document.getElementById('trake-count');
    
    listContainer.innerHTML = '';
    countElement.textContent = `(${markedTimestamps.length})`;
    
    if (markedTimestamps.length === 0) {
        listContainer.innerHTML = '<p class="no-timestamps">No timestamps marked yet</p>';
        return;
    }
    
    markedTimestamps.forEach((timestamp, index) => {
        const item = document.createElement('div');
        item.className = 'trake-item';
        item.dataset.index = index;
        
        item.innerHTML = `
            <div class="trake-item-content">
                <span class="trake-time">${timestamp.formattedTime}</span>
                <span class="trake-frame">Frame: ${timestamp.frameId}</span>
            </div>
            <div class="trake-item-actions">
                <button class="trake-jump-btn" title="Jump to this time">
                    <i class="fas fa-play"></i>
                </button>
                <button class="trake-edit-btn" title="Edit timestamp">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="trake-delete-btn" title="Delete timestamp">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const jumpBtn = item.querySelector('.trake-jump-btn');
        const editBtn = item.querySelector('.trake-edit-btn');
        const deleteBtn = item.querySelector('.trake-delete-btn');
        
        jumpBtn.addEventListener('click', () => jumpToTimestamp(timestamp.time));
        editBtn.addEventListener('click', () => editTimestamp(index));
        deleteBtn.addEventListener('click', () => deleteTimestamp(index));
        
        listContainer.appendChild(item);
    });
}

function jumpToTimestamp(time) {
    const video = document.getElementById('modal-video');
    if (video) {
        video.currentTime = time;
        // video.play();
        video.pause();
    }
}

function editTimestamp(index) {
    const timestamp = markedTimestamps[index];
    const newTime = prompt('Edit time (MM:SS):', timestamp.formattedTime);
    
    if (!newTime) return;
    
    // Parse new time
    const parts = newTime.split(':');
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        alert('Please enter time in MM:SS format');
        return;
    }
    
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);
    
    if (minutes < 0 || seconds < 0 || seconds >= 60) {
        alert('Invalid time format. Use MM:SS where SS is between 00-59');
        return;
    }
    
    const newTimeInSeconds = minutes * 60 + seconds;
    const modal = document.getElementById('video-modal');
    const fps = parseFloat(modal.dataset.fps);
    
    // Update timestamp
    markedTimestamps[index].time = newTimeInSeconds;
    markedTimestamps[index].frame = Math.floor(newTimeInSeconds * fps);
    markedTimestamps[index].frameId = markedTimestamps[index].frame.toString().padStart(5, '0') + '.jpg';
    markedTimestamps[index].formattedTime = formatTime(newTimeInSeconds);
    
    // Re-sort
    markedTimestamps.sort((a, b) => a.time - b.time);
    
    updateTrakeList();
}

function deleteTimestamp(index) {
    if (confirm('Are you sure you want to delete this timestamp?')) {
        markedTimestamps.splice(index, 1);
        updateTrakeList();
    }
}

function clearTrakeList() {
    if (markedTimestamps.length === 0) return;
    
    if (confirm('Are you sure you want to clear all marked timestamps?')) {
        markedTimestamps = [];
        updateTrakeList();
    }
}

function downloadTrakeCsv() {
    if (markedTimestamps.length === 0) {
        alert('No timestamps to download');
        return;
    }
    
    const modal = document.getElementById('video-modal');
    const videoName = modal.dataset.videoName;
    
    // Limit to 100 records
    const recordsToExport = markedTimestamps.slice(0, 100);
    
    // Create CSV content with video name in first column and frames in subsequent columns
    let csvContent = `"${videoName}"`;
    
    recordsToExport.forEach(timestamp => {
        csvContent += `,"${timestamp.frameId.replace(".jpg","").replace(".avif","")}"`;
    });
    
    // Complete the row
    csvContent += '\n';
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trake_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function escapeHtml(unsafe) {
    return (unsafe || '')
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}