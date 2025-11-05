// static/js/submissionButtons.js

import { showLoadingOverlay, hideLoadingOverlay } from './loadingOverlay.js';

// Helper function to get frame info
function getFrameInfo(thumbnail) {
    const videoName = thumbnail.querySelector('.video_id')?.textContent.trim();
    const frameId = thumbnail.querySelector('.image_id')?.textContent.trim();
    const fpsText = thumbnail.querySelector('.fps')?.textContent.trim();
    
    if (!videoName || !frameId || !fpsText) return null;
    
    const fps = parseFloat(fpsText) || 1;
    const frameNumber = parseInt(frameId) || 0;
    const timeMs = Math.round((frameNumber / fps) * 1000);
    
    // Try to find the video path from currentVideos
    let videoPath = null;
    if (window.currentVideos) {
        const record = window.currentVideos.find(rec => 
            rec.video_name === videoName && rec.keyframe_id === frameId
        );
        if (record && record.video_path) {
            videoPath = record.video_path;
        }
    }
    
    return {
        videoName,
        frameId,
        fps,
        frameNumber,
        timeMs,
        videoPath  // Include this in the frameInfo
    };
}

// TKIS Submission
async function submitToTKIS(frameInfo) {
    try {
        showLoadingOverlay();
        
        const formData = new FormData();
        formData.append('mediaItemName', frameInfo.videoName);
        formData.append('start', frameInfo.timeMs.toString());
        formData.append('end', frameInfo.timeMs.toString());
        
        const response = await fetch('hub/submit_KIS', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            alert('TKIS submission successful!');
        } else {
            alert('TKIS submission failed: ' + result.message);
        }
    } catch (error) {
        console.error('TKIS submission error:', error);
        alert('TKIS submission error: ' + error.message);
    } finally {
        hideLoadingOverlay();
    }
}

// QA Submission
function openQAModal(frameInfo) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        width: 400px;
        max-width: 90vw;
        border: 2px solid #40E0D0;
        color: white;
        position: relative;
    `;
    
    modalContent.innerHTML = `
        <!-- Close button -->
        <button id="qa-close-btn" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">×</button>
        
        <h3 style="color: #40E0D0; margin-top: 0; text-align: center; padding-right: 30px;">QA Submission</h3>
        <p><strong>Video:</strong> ${frameInfo.videoName}</p>
        <p><strong>Frame:</strong> ${frameInfo.frameId}</p>
        <textarea id="qa-answer" placeholder="Enter your answer..." 
                  style="width: 100%; height: 100px; margin: 10px 0; padding: 8px; background: #444; color: white; border: 1px solid #555; border-radius: 4px;"></textarea>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="qa-cancel" type="button" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            <button id="qa-submit" type="button" style="padding: 8px 16px; background: #40E0D0; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('qa-close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('qa-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('qa-submit').addEventListener('click', async () => {
        const answer = document.getElementById('qa-answer').value.trim();
        if (!answer) {
            alert('Please enter an answer');
            return;
        }
        
        await submitToQA(answer, frameInfo);
        document.body.removeChild(modal);
    });
    
    // Close on escape
    const closeHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeHandler);
        }
    };
    document.addEventListener('keydown', closeHandler);
}

async function submitToQA(answer, frameInfo) {
    try {
        showLoadingOverlay();
        
        const formData = new FormData();
        formData.append('answer', answer);
        formData.append('video_id', frameInfo.videoName);
        formData.append('time', frameInfo.timeMs.toString());
        
        const response = await fetch('hub/submit_QA', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            alert('QA submission successful!');
        } else {
            alert('QA submission failed: ' + result.message);
        }
    } catch (error) {
        console.error('QA submission error:', error);
        alert('QA submission error: ' + error.message);
    } finally {
        hideLoadingOverlay();
    }
}

// In submissionButtons.js - update the openTrakeModal function

// TRAKE Interface
function openTrakeModal(frameInfo) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #333;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        border: 2px solid #40E0D0;
        color: white;
    `;
    
    modalContent.innerHTML = `
        <h3 style="color: #40E0D0; margin-top: 0; text-align: center;">TRAKE Interface - ${frameInfo.videoName}</h3>
        <!-- Close button -->
        <button id="trake-close-x" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        ">×</button>
        <!-- Video Player Section -->
        <div style="margin-bottom: 20px; text-align: center;">
            <div class="video-container" style="position: relative; padding-top: 56.25%; background: #000;">
                <video id="trake-video" controls style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                ">
                    Your browser does not support the video tag.
                </video>
                <div id="trake-spinner" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 24px;
                    display: none;
                ">Loading video...</div>
            </div>
            <div style="margin-top: 10px;">
                <button id="trake-mark-btn" type="button" style="padding: 8px 16px; background: #40E0D0; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">Mark Current Frame (M)</button>
                <button id="trake-play-pause" type="button" style="padding: 8px 16px; background: #003b6d; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">Pause</button>
            </div>
            <div id="trake-current-time" style="margin-top: 10px; font-size: 1rem; color: #40E0D0;"></div>
        </div>

        <!-- Progress Bar -->
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Progress</span>
                <span id="trake-hover-time" style="color: #40E0D0;"></span>
            </div>
            <div id="trake-progress-bar" style="width: 100%; height: 20px; background: #555; border-radius: 10px; position: relative; cursor: pointer;">
                <div id="trake-progress" style="height: 100%; background: #40E0D0; border-radius: 10px; width: 0%;"></div>
                <div id="trake-marker-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
            </div>
        </div>

        <!-- Controls -->
        <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
            <button id="trake-clear-btn" type="button" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear All</button>
            <button id="trake-submit-btn" type="button" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit TRAKE</button>
            <button id="trake-close-btn" type="button" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
        
        <!-- Marked Frames List -->
        <div style="border: 1px solid #555; padding: 15px; border-radius: 5px; background: #222;">
            <h4 style="color: #40E0D0; margin-top: 0;">Marked Frames <span id="trake-count">(0)</span></h4>
            <div id="trake-frames-list" style="max-height: 200px; overflow-y: auto;">
                <p style="text-align: center; color: #888; margin: 0;">No frames marked yet. Press 'M' key or click 'Mark Frame' to add frames.</p>
            </div>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // TRAKE state
    const markedFrames = new Set();
    let videoFps = frameInfo.fps;
    
    // Initialize video player - FIXED: Use same approach as videoView.js
    const video = document.getElementById('trake-video');
    const spinner = document.getElementById('trake-spinner');
    
    // Calculate start time
    const frameNum = parseInt(frameInfo.frameId);
    const startTime = frameNum / videoFps;
    
    // Get the correct video path - FIXED: Use same method as working video modal
    let videoPath = constructVideoPathFromName(frameInfo.videoName);
    console.log("Video path:", videoPath);
    
    // Use the same video source format as videoView.js
    const videoSrc = `hub/send_video/${encodeURIComponent(videoPath.replace(".mp4.mp4",".mp4"))}#t=${startTime}`;
    console.log("Final video source:", videoSrc);
    
    spinner.style.display = 'block';
    video.src = videoSrc;
    
    // Video event listeners
    video.onloadedmetadata = () => {
        spinner.style.display = 'none';
        video.currentTime = startTime;
        updateProgress();
    };

    // Close button in top-right
    const closeX = document.getElementById('trake-close-x');
    if (closeX) {
        closeX.addEventListener('click', () => {
            video.pause();
            video.removeAttribute('src');
            video.load();
            document.body.removeChild(modal);
            document.removeEventListener('keydown', keyHandler);
        });
    }    
    
    video.onerror = () => {
        spinner.style.display = 'none';
        alert('Error loading video: ' + videoSrc);
        console.error('Video loading error for:', videoSrc);
        
        // Try fallback batch numbers if 404
        if (videoSrc.includes('/0/')) {
            const fallbackPath = videoPath.replace('/0/', '/1/');
            const fallbackSrc = `hub/send_video/${encodeURIComponent(fallbackPath)}#t=${startTime}`;
            console.log("Trying fallback video source:", fallbackSrc);
            video.src = fallbackSrc;
            spinner.style.display = 'block';
        }
    };
    
    video.oncanplay = () => {
        video.play().catch(e => console.log('Autoplay prevented:', e));
    };
    
    // Add current frame initially
    markFrame(frameInfo.frameId, startTime);
    
    // Video event listeners for progress updates
    video.addEventListener('timeupdate', updateProgress);
    
    // Progress bar interaction
    const progressBar = document.getElementById('trake-progress-bar');
    const hoverTime = document.getElementById('trake-hover-time');
    
    if (progressBar && hoverTime) {
        progressBar.addEventListener('mousemove', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const time = percent * video.duration;
            hoverTime.textContent = formatTime(time);
        });
        
        progressBar.addEventListener('mouseleave', () => {
            hoverTime.textContent = '';
        });
        
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            video.currentTime = percent * video.duration;
        });
    }
    
    // Play/Pause button
    const playPauseBtn = document.getElementById('trake-play-pause');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playPauseBtn.textContent = 'Pause';
            } else {
                video.pause();
                playPauseBtn.textContent = 'Play';
            }
        });
    }
    
    // Video state changes
    video.addEventListener('play', () => {
        if (playPauseBtn) playPauseBtn.textContent = 'Pause';
    });
    
    video.addEventListener('pause', () => {
        if (playPauseBtn) playPauseBtn.textContent = 'Play';
    });
    
    // Event listeners
    const markBtn = document.getElementById('trake-mark-btn');
    if (markBtn) {
        markBtn.addEventListener('click', () => {
            markCurrentFrame();
        });
    }
    
    const clearBtn = document.getElementById('trake-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (markedFrames.size === 0) return;
            if (confirm('Clear all marked frames?')) {
                markedFrames.clear();
                updateTrakeDisplay();
                updateProgressMarkers();
            }
        });
    }
    
    const submitBtn = document.getElementById('trake-submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            if (markedFrames.size === 0) {
                alert('Please mark at least one frame');
                return;
            }
            
            await submitToTrake(frameInfo.videoName, Array.from(markedFrames));
        });
    }
    
    const closeBtn = document.getElementById('trake-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            video.pause();
            video.removeAttribute('src');
            video.load();
            document.body.removeChild(modal);
            document.removeEventListener('keydown', keyHandler);
        });
    }
    
    // Keyboard handler
    const keyHandler = (e) => {
        if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            markCurrentFrame();
        } else if (e.key === 'Escape') {
            video.pause();
            video.removeAttribute('src');
            video.load();
            document.body.removeChild(modal);
            document.removeEventListener('keydown', keyHandler);
        }
    };
    document.addEventListener('keydown', keyHandler);
    
    function markCurrentFrame() {
        const currentTime = video.currentTime;
        const frameNumber = Math.floor(currentTime * videoFps);
        // Remove the .jpg extension - just use the numeric frame number
        const frameId = frameNumber.toString(); //.padStart(5, '0') + '.jpg'; // REMOVE THIS LINE
        markFrame(frameId, currentTime);
    }
    
    function markFrame(frameId, timestamp) {
        // Ensure frameId doesn't have extension
        const cleanFrameId = frameId.replace('.jpg', '').replace('.jpeg', '').replace('.avif', '');
        
        if (markedFrames.has(cleanFrameId)) {
            return;
        }
        markedFrames.add(cleanFrameId);
        updateTrakeDisplay();
        updateProgressMarkers();
    }
    
    function updateProgress() {
        const progress = document.getElementById('trake-progress');
        const currentTimeElem = document.getElementById('trake-current-time');
        
        // FIX: Check if elements exist before updating
        if (!progress || !currentTimeElem) return;
        
        if (video.duration && !isNaN(video.duration)) {
            const percent = (video.currentTime / video.duration) * 100;
            progress.style.width = percent + '%';
            currentTimeElem.textContent = `Current Time: ${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        } else {
            currentTimeElem.textContent = `Current Time: ${formatTime(video.currentTime)}`;
        }
    }
    
    function updateProgressMarkers() {
        const markerContainer = document.getElementById('trake-marker-container');
        if (!markerContainer) return;
        
        markerContainer.innerHTML = '';
        
        markedFrames.forEach(frameId => {
            const frameNumber = parseInt(frameId);
            const timestamp = frameNumber / videoFps;
            
            if (video.duration && !isNaN(video.duration)) {
                const percent = (timestamp / video.duration) * 100;
                
                const marker = document.createElement('div');
                marker.style.cssText = `
                    position: absolute;
                    left: ${percent}%;
                    top: 0;
                    width: 4px;
                    height: 100%;
                    background: #FFD700;
                    transform: translateX(-50%);
                    border-radius: 2px;
                `;
                marker.title = `Frame: ${frameId}\nTime: ${formatTime(timestamp)}`;
                markerContainer.appendChild(marker);
            }
        });
    }
    
    function updateTrakeDisplay() {
        const list = document.getElementById('trake-frames-list');
        const count = document.getElementById('trake-count');
        
        if (!list || !count) return;
        
        count.textContent = `(${markedFrames.size})`;
        
        if (markedFrames.size === 0) {
            list.innerHTML = '<p style="text-align: center; color: #888; margin: 0;">No frames marked yet. Press \'M\' key or click \'Mark Frame\' to add frames.</p>';
        } else {
            list.innerHTML = Array.from(markedFrames).map(frameId => {
                const frameNumber = parseInt(frameId);
                const timestamp = frameNumber / videoFps;
                return `
                    <div style="padding: 8px; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #FFD700;">${frameId}</strong>
                            <div style="font-size: 0.8rem; color: #ccc;">Time: ${formatTime(timestamp)}</div>
                        </div>
                        <div>
                            <button type="button" onclick="removeTrakeFrame('${frameId}')" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">Remove</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Add removeFrame to global scope for the onclick handler
        window.removeTrakeFrame = (frameId) => {
            markedFrames.delete(frameId);
            updateTrakeDisplay();
            updateProgressMarkers();
        };
    }
    
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // NEW: Function to construct video path with correct batch detection
    function constructVideoPathFromName(videoName) {
        // Extract video series (K02, L22, etc.)
        const series = videoName.substring(0, 3); // Get first 3 chars like "K02"
        
        // Determine batch
        let batch = series.startsWith('K') ? '1' : '0';
        
        // Simple path: batch/videos/Videos_series/video/videoName.mp4
        return `${batch}/videos/Videos_${series}/video/${videoName}.mp4`;
    }
    
    // Initial display
    updateTrakeDisplay();
}

async function submitToTrake(videoName, frameIds) {
    try {
        showLoadingOverlay();
        
        const formData = new FormData();
        formData.append('video_id', videoName);
        formData.append('frame_ids', frameIds.join(','));
        
        const response = await fetch('hub/submit_TRAKE', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            alert(`TRAKE submission successful! Submitted ${frameIds.length} frames.`);
            // Close modal
            const modal = document.querySelector('div[style*="z-index: 10000"]');
            if (modal) document.body.removeChild(modal);
        } else {
            alert('TRAKE submission failed: ' + result.message);
        }
    } catch (error) {
        console.error('TRAKE submission error:', error);
        alert('TRAKE submission error: ' + error.message);
    } finally {
        hideLoadingOverlay();
    }
}

// Add buttons to thumbnails
export function addSubmissionButtons() {
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        const frameInfo = getFrameInfo(thumb);
        if (!frameInfo) return;
        
        // Check if buttons already exist
        if (thumb.querySelector('.submission-buttons')) return;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'submission-buttons';
        buttonContainer.style.cssText = `
            position: absolute;
            top: 35px;
            left: 0px;
            display: flex;
            flex-direction: column;
            margin: 0;
            z-index: 50;
        `;
        
        // TKIS Button
        const tkisBtn = createButton('T', '#003b6d', () => submitToTKIS(frameInfo));
        // QA Button  
        const qaBtn = createButton('Q', '#28a745', () => openQAModal(frameInfo));
        // TRAKE Button
        const trakeBtn = createButton('R', '#dc3545', () => openTrakeModal(frameInfo));
        
        buttonContainer.appendChild(tkisBtn);
        buttonContainer.appendChild(qaBtn);
        buttonContainer.appendChild(trakeBtn);
        
        const thumbDiv = thumb.querySelector('div[style*="position: relative"]');
        if (thumbDiv) {
            thumbDiv.appendChild(buttonContainer);
        }
    });
}

function createButton(text, color, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.className = 'submission-button'
    button.style.cssText = `
        background: ${color};
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.opacity = '1';
        button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.opacity = '0.8';
        button.style.transform = 'scale(1)';
    });
    
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    
    return button;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add buttons to existing thumbnails
    addSubmissionButtons();
    
    // Re-add buttons when new thumbnails are loaded (for pagination)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('thumbnail')) {
                        setTimeout(addSubmissionButtons, 0);
                    }
                });
            }
        });
    });
    
    observer.observe(document.getElementById('videos'), {
        childList: true,
        subtree: true
    });
});


export {
    submitToTKIS,
    openQAModal,
    openTrakeModal,
    submitToQA,
    submitToTrake
};