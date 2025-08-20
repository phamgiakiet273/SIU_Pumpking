// static/js/thumbnailView.js

import { fillSubmissionForm } from './submitHandler.js';

// Generate unique color for each object type
function stringToColor(str) {
    if (!str) return '#cccccc'; // Default color for empty objects
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

// Create modal structure with neighbor frame support
function createModal() {
    const modalHTML = `
    <div id="thumbnail-modal" class="modal" style="
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.9);
        overflow: auto;
    ">
        <div class="modal-content" style="
            background-color: #1a1a1a;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #40E0D0;
            width: 95%;
            max-width: 1600px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(64, 224, 208, 0.3);
        ">
            <span class="close" style="
                color: #aaa;
                float: right;
                font-size: 36px;
                font-weight: bold;
                cursor: pointer;
                transition: color 0.3s;
            ">×</span>
            
            <div class="modal-body" style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div class="image-container" style="flex: 1; min-width: 900px; position: relative;">
                    <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
                        <div style="position: relative; display: inline-block;">
                            <img id="modal-image" src="" style="max-width: 100%; max-height: 900px; display: block;">
                            <canvas id="modal-canvas" style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                pointer-events: none;
                                display: block;
                                width: 100%;
                                height: 100%;
                            "></canvas>
                            
                            <!-- Navigation arrows -->
                            <button id="prev-frame" class="nav-arrow" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); 
                                background: rgba(0,0,0,0.5); border: none; color: white; font-size: 24px; 
                                width: 40px; height: 60px; cursor: pointer; border-radius: 4px;"><</button>
                            <button id="next-frame" class="nav-arrow" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); 
                                background: rgba(0,0,0,0.5); border: none; color: white; font-size: 24px; 
                                width: 40px; height: 60px; cursor: pointer; border-radius: 4px;">></button>
                        </div>
                    </div>
                    
                    <!-- Neighbor frames preview -->
                    <div id="neighbor-frames" style="margin-top: 40px; display: none;">
                        <h3 style="color: #40E0D0; border-bottom: 1px solid #40E0D0; padding-bottom: 8px;">Neighboring Frames</h3>
                        <div id="neighbor-frames-container" style="display: flex; gap: 10px; overflow-x: auto; padding: 10px 0;"></div>
                    </div>
                </div>
                
                <div class="info-container" style="flex: 1; min-width: 300px; padding: 15px; background: #222; border-radius: 8px; display: flex; flex-direction: column;">
                    <h2 style="color: #40E0D0; border-bottom: 2px solid #40E0D0; padding-bottom: 10px; flex-shrink: 0;">Thumbnail Details</h2>
                    <div id="modal-info" style="overflow-y: auto; max-height: 500px; color: #eee; flex-grow: 1; margin-top: 15px;"></div>
                    
                    <!-- NEW: Action button container at the bottom of the info panel -->
                    <div class="modal-actions" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #333; flex-shrink: 0;">
                        <button id="modal-submit-btn" style="
                            background-color: #40E0D0;
                            color: #003b6d;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 1.1rem;
                            width: 100%;
                            transition: background-color 0.2s;
                        ">
                            Submit this Frame
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup close handler
    document.querySelector('#thumbnail-modal .close').addEventListener('click', closeModal);
    document.getElementById('thumbnail-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('thumbnail-modal')) {
            closeModal();
        }
    });
    
    // Navigation handlers
    document.getElementById('prev-frame').addEventListener('click', () => navigateFrames(-1));
    document.getElementById('next-frame').addEventListener('click', () => navigateFrames(1));

    // NEW: Add event listener for the modal's submit button
    document.getElementById('modal-submit-btn').addEventListener('click', () => {
        // 1. Get the current frame's data from the global state
        const currentFrame = window.framesList[window.currentFrameIndex];
        if (!currentFrame) {
            console.error("No current frame data available to submit.");
            alert("Could not submit frame: data not found.");
            return;
        }

        const videoName = currentFrame.video_name;
        const frameId = currentFrame.keyframe_id;
        const fps = currentFrame.fps;

        // 2. Close the modal
        closeModal();

        // 3. Call the imported function to fill the submission form.
        // This function also handles switching to the correct tab.
        fillSubmissionForm(videoName, frameId, fps);
    });
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('thumbnail-modal');
    modal.style.display = 'none';
    const canvas = document.getElementById('modal-canvas');
    if (canvas) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }
    
    document.removeEventListener('keydown', handleKeyDown);
    
    window.isModalOpen = false; 

    // Reset frame state
    window.currentFrameIndex = 0;
    window.framesList = [];
}

// Handle keyboard navigation
function handleKeyDown(e) {
    e.stopPropagation();
    e.preventDefault();

    if (e.key === 'ArrowLeft') {
        navigateFrames(-1);
    } else if (e.key === 'ArrowRight') {
        navigateFrames(1);
    } else if (e.key === 'Escape') {
        closeModal();
    }
}

// Navigate between frames
function navigateFrames(direction) {
    if (!window.framesList || window.framesList.length === 0) return;
    
    window.currentFrameIndex += direction;
    
    // Wrap around
    if (window.currentFrameIndex < 0) {
        window.currentFrameIndex = window.framesList.length - 1;
    } else if (window.currentFrameIndex >= window.framesList.length) {
        window.currentFrameIndex = 0;
    }
    
    const frame = window.framesList[window.currentFrameIndex];
    updateModalContent(frame);
    updateNeighborFramesHighlight();
}

// Update modal content for a frame
function updateModalContent(frame) {
    const image = document.getElementById('modal-image');
    const infoContainer = document.getElementById('modal-info');
    
    // Set image source
    const encodedPath = encodeURIComponent(frame.frame_path);
    image.src = `hub/send_img_original/${encodedPath}`;
    
    // Parse object data (if available)
    let objects = [];
    if (frame.object) {
        try {
            let objStr = frame.object;
            if (typeof objStr !== 'string') {
                objStr = JSON.stringify(objStr);
            }
            objStr = objStr.replace(/'/g, '"');
            objects = JSON.parse(objStr);
        } catch (e) {
            console.error('Error parsing objects:', e);
        }
    }
    
    // Remove previous load handler
    image.onload = null;
    
    // Set new load handler
    image.onload = () => {
        // Wait for image to render in DOM
        setTimeout(() => {
            drawBoundingBoxes(image, objects);
        }, 50);
    };
    
    // If image is already loaded, draw immediately
    if (image.complete) {
        image.onload();
    }
    
    // Create information HTML
    const infoHTML = `
        <table class="info-table" style="width: 100%; border-collapse: collapse; color: #eee;">
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px; font-weight: bold; width: 30%;">Video Name:</td>
                <td style="padding: 12px;">${frame.video_name || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px; font-weight: bold;">Frame ID:</td>
                <td style="padding: 12px;">${frame.keyframe_id || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px; font-weight: bold;">FPS:</td>
                <td style="padding: 12px;">${frame.fps || 'N/A'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px; font-weight: bold;">Score:</td>
                <td style="padding: 12px;">${frame.score ? parseFloat(frame.score).toFixed(4) : 'N/A'}</td>
            </tr>
            ${frame.s2t ? `
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px; font-weight: bold; vertical-align: top;">Speech to Text:</td>
                <td style="padding: 12px;">${frame.s2t}</td>
            </tr>
            ` : ''}
            ${objects.length > 0 ? `
            <tr>
                <td style="padding: 12px; font-weight: bold; vertical-align: top;">Detected Objects:</td>
                <td style="padding: 12px;">
                    <ul style="padding-left: 20px; margin: 0;">
                        ${objects.map(obj => `
                            <li style="margin-bottom: 8px;">
                                <span style="display: inline-block; width: 12px; height: 12px; 
                                    background-color: ${stringToColor(obj.object)};
                                    margin-right: 8px; border-radius: 2px;"></span>
                                ${obj.object} (${obj.conf.toFixed(2)})
                            </li>
                        `).join('')}
                    </ul>
                </td>
            </tr>
            ` : ''}
        </table>
    `;
    
    infoContainer.innerHTML = infoHTML;
}

// Draw bounding boxes on image with correct aspect ratio
function drawBoundingBoxes(image, objects) {
    const canvas = document.getElementById('modal-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get actual displayed dimensions
    const container = image.parentElement;
    const displayedWidth = container.offsetWidth;
    const displayedHeight = container.offsetHeight;

    // Set canvas internal resolution
    canvas.width = displayedWidth;
    canvas.height = displayedHeight;

    // Match CSS layout size to avoid stretching
    canvas.style.width = displayedWidth + 'px';
    canvas.style.height = displayedHeight + 'px';

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw if we have objects
    if (objects.length === 0) return;
    
    const scaleX = displayedWidth / image.naturalWidth;
    const scaleY = displayedHeight / image.naturalHeight;

    objects.forEach(obj => {
        const [x1, y1, x2, y2] = [
            obj.bbox[0] * scaleX,
            obj.bbox[1] * scaleY,
            obj.bbox[2] * scaleX,
            obj.bbox[3] * scaleY
        ];

        const width = x2 - x1;
        const height = y2 - y1;
        const color = stringToColor(obj.object);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, width, height);

        ctx.fillStyle = color + '80';
        const text = `${obj.object} (${obj.conf.toFixed(2)})`;
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(text).width;
        const textHeight = 18;
        ctx.fillRect(x1, y1 - textHeight, textWidth + 10, textHeight);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, x1 + 5, y1 - 5);
    });
}

// Fetch neighboring frames from server
async function fetchNeighboringFrames(videoName, frameNum) {
    try {

        const k = window.neighborFramesCount || 10; // Use setting or default to 10

        const formData = new FormData();
        formData.append('video_name', videoName.replace('.mp4',''));
        formData.append('frame_num', parseInt(frameNum));
        formData.append('k', k);
        
        const response = await fetch('hub/get_neighboring_frames', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching neighboring frames:', error);
        return { prev_frames: [], next_frames: [] };
    }
}

// Create neighbor frame preview
function createNeighborPreview(framePath, isCurrent = false) {
    const preview = document.createElement('div');
    preview.className = 'neighbor-preview' + (isCurrent ? ' current' : '');
    preview.style.cssText = `
        flex: 0 0 auto;
        width: 100px;
        height: 75px;
        background: #333;
        border: 2px solid ${isCurrent ? '#40E0D0' : '#555'};
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        position: relative;
        ${isCurrent ? 'box-shadow: 0 0 10px rgba(64, 224, 208, 0.7);' : ''}
    `;
    
    const img = document.createElement('img');
    img.src = `hub/send_img_original/${encodeURIComponent(framePath)}`;
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
    `;
    
    preview.appendChild(img);
    
    // Add click handler to switch to this frame
    preview.addEventListener('click', () => {
        const index = window.framesList.findIndex(f => f.frame_path === framePath);
        if (index !== -1) {
            window.currentFrameIndex = index;
            updateModalContent(window.framesList[index]);
            updateNeighborFramesHighlight();
        }
    });
    
    return preview;
}


// Center current frame in neighbor list
function centerCurrentNeighborFrame() {
    const container = document.getElementById('neighbor-frames-container');
    if (!container || container.children.length === 0) return;
    
    const currentFrameElement = container.children[window.currentFrameIndex];
    if (!currentFrameElement) return;
    
    const containerWidth = container.offsetWidth;
    const scrollLeft = container.scrollLeft;
    const elementLeft = currentFrameElement.offsetLeft;
    const elementWidth = currentFrameElement.offsetWidth;
    
    const targetScroll = elementLeft - (containerWidth / 2) + (elementWidth / 2);
    container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });
}

// Update neighbor frames highlight
function updateNeighborFramesHighlight() {
    const container = document.getElementById('neighbor-frames-container');
    if (!container) return;
    
    const previews = container.querySelectorAll('.neighbor-preview');
    previews.forEach((preview, index) => {
        const isCurrent = index === window.currentFrameIndex;
        preview.style.border = isCurrent ? '2px solid #40E0D0' : '2px solid #555';
        preview.style.boxShadow = isCurrent ? '0 0 10px rgba(64, 224, 208, 0.7)' : 'none';
    });
    
    centerCurrentNeighborFrame();
}


// Show modal with thumbnail details and fetch neighbors
async function showModal(record) {
    const modal = document.getElementById('thumbnail-modal');
    if (!modal) {
        createModal();
    }
    
    window.isModalOpen = true;

    // Initialize frame list with current record
    window.framesList = [record];
    window.currentFrameIndex = 0;
    
    // Show modal immediately with current frame
    document.getElementById('thumbnail-modal').style.display = 'block';
    updateModalContent(record);
    
    // Fetch neighboring frames
    try {
        const frameNum = record.keyframe_id.split('.')[0];
        const neighbors = await fetchNeighboringFrames(record.video_name, frameNum, 10);
        
        // Create frame objects for neighbors
        const prevFrames = neighbors.prev_frames.map(path => ({
            frame_path: path,
            video_name: record.video_name,
            keyframe_id: path.split('/').pop().replace(/\.(avif|jpg)$/,''),
            fps: record.fps,
            score: null,
            s2t: null,
            object: null
        }));
        
        const nextFrames = neighbors.next_frames.map(path => ({
            frame_path: path,
            video_name: record.video_name,
            keyframe_id: path.split('/').pop().replace(/\.(avif|jpg)$/,''),
            fps: record.fps,
            score: null,
            s2t: null,
            object: null
        }));
        
        // Combine all frames
        window.framesList = [...prevFrames, record, ...nextFrames];
        window.currentFrameIndex = prevFrames.length;
        
        // Update the main content again to reflect the correct total frame count
        updateModalContent(window.framesList[window.currentFrameIndex]);
        
        // Update UI with neighbors
        const neighborContainer = document.getElementById('neighbor-frames-container');
        neighborContainer.innerHTML = '';
        
        window.framesList.forEach((frame, index) => {
            neighborContainer.appendChild(createNeighborPreview(
                frame.frame_path, 
                index === window.currentFrameIndex
            ));
        });
        
        // Show neighbor section
        document.getElementById('neighbor-frames').style.display = 'block';
        updateNeighborFramesHighlight();
        
    } catch (error) {
        console.error('Error loading neighbor frames:', error);
        document.getElementById('neighbor-frames').style.display = 'none';
    }
    
    document.addEventListener('keydown', handleKeyDown);
}

// Initialize thumbnail view functionality
export function initThumbnailView() {
    // Create modal structure if it doesn't exist
    if (!document.getElementById('thumbnail-modal')) {
        createModal();
    }
    
    // Add click handlers to all image IDs
    document.querySelectorAll('.image_id').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const index = this.id.split('-')[1];
            
            if (window.currentVideos && window.currentVideos[index]) {
                showModal(window.currentVideos[index]);
            }
        });
    });
}