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
        formData.append('mediaItemName', frameInfo.videoName.replace(".mp4",""));
        formData.append('start', frameInfo.timeMs.toString());
        formData.append('end', frameInfo.timeMs.toString());
        
        const response = await fetch('hub/submit_KIS', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Enhanced response handling
        let message = 'Submission completed';
        
        if (result.detail) {
            // Handle Type 1 response: {"detail": "{\"status\":false,\"description\":\"...\"}"}
            try {
                const detailObj = JSON.parse(result.detail);
                message = `TKIS: ${detailObj.description || result.detail}`;
            } catch (e) {
                message = `TKIS: ${result.detail}`;
            }
        } else if (result.data) {
            // Handle Type 2/3 responses with data field
            message = `TKIS: ${result.data.description || result.data.message || 'Unknown response'}`;
            
            // Add submission result if available
            if (result.data.submission) {
                message = `TKIS Submission: ${result.data.submission}\n${result.data.description}`;
            }
        } else if (result.message) {
            // Handle other message formats
            message = `TKIS: ${result.message}`;
        } else if (result.status === 200) {
            message = 'TKIS submission successful!';
        } else {
            message = `TKIS: ${JSON.stringify(result)}`;
        }
        
        alert(message);
        
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
        // document.body.removeChild(modal);
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

// QA Submission
async function submitToQA(answer, frameInfo) {
    try {
        showLoadingOverlay();
        
        const formData = new FormData();
        formData.append('answer', answer);
        formData.append('video_id', frameInfo.videoName.replace(".mp4",""));
        formData.append('time', frameInfo.timeMs.toString());
        
        const response = await fetch('hub/submit_QA', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Enhanced response handling for QA
        let message = 'QA submission completed';
        
        if (result.detail) {
            // Handle Type 1 response
            try {
                const detailObj = JSON.parse(result.detail);
                message = `QA: ${detailObj.description || result.detail}`;
            } catch (e) {
                message = `QA: ${result.detail}`;
            }
        } else if (result.data) {
            // Handle Type 2/3 responses with data field
            message = `QA: ${result.data.description || result.data.message || 'Unknown response'}`;
            
            // Add submission result if available
            if (result.data.submission) {
                const statusIcon = result.data.submission === 'CORRECT' ? '✅' : '❌';
                message = `${statusIcon} QA Submission: ${result.data.submission}\n${result.data.description}`;
            }
        } else if (result.message) {
            message = `QA: ${result.message}`;
        } else if (result.status === 200) {
            message = 'QA submission successful!';
        } else {
            message = `QA: ${JSON.stringify(result)}`;
        }
        
        alert(message);
        
    } catch (error) {
        console.error('QA submission error:', error);
        alert('QA submission error: ' + error.message);
    } finally {
        hideLoadingOverlay();
    }
}

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
    
    // Make modal focusable and focus it immediately
    modal.tabIndex = -1;
    
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
            
            <!-- Current Frame and Navigation Info -->
            <div id="trake-frame-info" style="margin: 10px 0; font-size: 1rem; color: #40E0D0; display: flex; justify-content: center; align-items: center; gap: 15px;">
                <span><strong>Current Frame:</strong> <span id="trake-current-frame">${frameInfo.frameId}</span></span>
                <span style="color: #ccc;">|</span>
                <span>Use <strong>← →</strong> arrows to navigate 1 second</span>
                <span style="color: #ccc;">|</span>
                <span><strong>Space</strong> to play/pause</span>
            </div>
            
            <div style="margin-top: 10px;">
                <button id="trake-mark-btn" type="button" style="padding: 8px 16px; background: #40E0D0; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">Mark Current Frame (M)</button>
                <button id="trake-play-pause" type="button" style="padding: 8px 16px; background: #003b6d; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">Play</button>
                <button id="trake-prev-second" type="button" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">← 1s</button>
                <button id="trake-next-second" type="button" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">→ 1s</button>
            </div>
            <div id="trake-current-time" style="margin-top: 10px; font-size: 1rem; color: #40E0D0;"></div>
        </div>

        <!-- Manual Frame/Time Input Section -->
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #555; border-radius: 5px; background: #222;">
            <h4 style="color: #40E0D0; margin-top: 0; margin-bottom: 10px;">Jump to Frame or Time</h4>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <label style="color: #ccc;">Frame:</label>
                    <input type="number" id="trake-frame-input" placeholder="Frame number" 
                           style="padding: 5px; background: #444; color: white; border: 1px solid #555; border-radius: 3px; width: 100px;">
                </div>
                <span style="color: #ccc;">or</span>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <label style="color: #ccc;">Time:</label>
                    <input type="text" id="trake-time-input" placeholder="mm:ss" 
                           style="padding: 5px; background: #444; color: white; border: 1px solid #555; border-radius: 3px; width: 80px;">
                </div>
                <button id="trake-jump-btn" type="button" 
                        style="padding: 5px 10px; background: #40E0D0; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Jump
                </button>
                <button id="trake-mark-manual-btn" type="button" 
                        style="padding: 5px 10px; background: #FFD700; color: black; border: none; border-radius: 3px; cursor: pointer;">
                    Mark This Frame
                </button>
            </div>
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
    
    // Focus the modal to capture keyboard events
    modal.focus();
    
    // TRAKE state
    const markedFrames = new Set();
    let videoFps = frameInfo.fps;
    
    // Initialize video player
    const video = document.getElementById('trake-video');
    const spinner = document.getElementById('trake-spinner');
    
    // Calculate start time
    const frameNum = parseInt(frameInfo.frameId);
    const startTime = frameNum / videoFps;
    
    // Get the correct video path
    let videoPath = constructVideoPathFromName(frameInfo.videoName);
    console.log("Video path:", videoPath);
    
    // Use the same video source format as videoView.js
    const videoSrc = `hub/send_video/${encodeURIComponent(videoPath.replace(".mp4.mp4",".mp4"))}#t=${startTime}`;
    console.log("Final video source:", videoSrc);
    
    spinner.style.display = 'block';
    video.src = videoSrc;
    
    // PAUSE VIDEO IMMEDIATELY - remove autoplay
    video.autoplay = false;
    
    // Disable video controls temporarily to prevent default keyboard behavior
    video.controls = false;
    
    // Video event listeners
    video.onloadedmetadata = () => {
        spinner.style.display = 'none';
        video.currentTime = startTime;
        // Ensure video is paused initially
        video.pause();
        updateProgress();
        updateCurrentFrameDisplay();
        
        // Re-enable controls after a brief delay
        setTimeout(() => {
            video.controls = true;
        }, 1000);
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
    
    // Remove autoplay from canplay event
    video.oncanplay = () => {
        // Don't autoplay - keep it paused
        console.log('Video can play, but keeping it paused');
    };
    
    // Add current frame initially
    markFrame(frameInfo.frameId, startTime);
    
    // Video event listeners for progress updates
    video.addEventListener('timeupdate', () => {
        updateProgress();
        updateCurrentFrameDisplay();
    });
    
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
            // Pause video when clicking progress bar
            video.pause();
            if (playPauseBtn) playPauseBtn.textContent = 'Play';
            
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            video.currentTime = percent * video.duration;
            updateCurrentFrameDisplay();
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
    
    // 1-second navigation buttons
    const prevSecondBtn = document.getElementById('trake-prev-second');
    const nextSecondBtn = document.getElementById('trake-next-second');
    
    if (prevSecondBtn) {
        prevSecondBtn.addEventListener('click', () => {
            video.pause();
            if (playPauseBtn) playPauseBtn.textContent = 'Play';
            navigateBySeconds(-1);
        });
    }
    
    if (nextSecondBtn) {
        nextSecondBtn.addEventListener('click', () => {
            video.pause();
            if (playPauseBtn) playPauseBtn.textContent = 'Play';
            navigateBySeconds(1);
        });
    }
    
    // Manual frame/time input
    const frameInput = document.getElementById('trake-frame-input');
    const timeInput = document.getElementById('trake-time-input');
    const jumpBtn = document.getElementById('trake-jump-btn');
    const markManualBtn = document.getElementById('trake-mark-manual-btn');
    
    if (jumpBtn) {
        jumpBtn.addEventListener('click', () => {
            video.pause();
            if (playPauseBtn) playPauseBtn.textContent = 'Play';
            jumpToInput();
        });
    }
    
    if (markManualBtn) {
        markManualBtn.addEventListener('click', () => {
            video.pause();
            if (playPauseBtn) playPauseBtn.textContent = 'Play';
            markFromInput();
        });
    }
    
    // Allow Enter key in input fields
    if (frameInput) {
        frameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                video.pause();
                if (playPauseBtn) playPauseBtn.textContent = 'Play';
                jumpToInput();
            }
        });
    }
    
    if (timeInput) {
        timeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                video.pause();
                if (playPauseBtn) playPauseBtn.textContent = 'Play';
                jumpToInput();
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
    
    // ENHANCED Keyboard handler - attach to modal instead of document
    const keyHandler = (e) => {
        // Prevent all default behavior for these keys
        if ([' ', 'ArrowLeft', 'ArrowRight', 'm', 'M', 'Escape'].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
        
        if (e.key === 'm' || e.key === 'M') {
            markCurrentFrame();
        } else if (e.key === 'ArrowLeft') {
            video.pause();
            if (playPauseBtn) playPauseBtn.textContent = 'Play';
            navigateBySeconds(-1);
        } else if (e.key === 'ArrowRight') {
            video.pause();
            if (playPauseBtn) playPauseBtn.textContent = 'Play';
            navigateBySeconds(1);
        } else if (e.key === ' ') {
            // Space bar for play/pause
            if (video.paused) {
                video.play();
                if (playPauseBtn) playPauseBtn.textContent = 'Pause';
            } else {
                video.pause();
                if (playPauseBtn) playPauseBtn.textContent = 'Play';
            }
        } else if (e.key === 'Escape') {
            video.pause();
            video.removeAttribute('src');
            video.load();
            document.body.removeChild(modal);
            modal.removeEventListener('keydown', keyHandler);
        }
    };
    
    // Attach to modal instead of document for better isolation
    modal.addEventListener('keydown', keyHandler, true); // Use capture phase
    
    // NEW: Function to navigate by seconds
    function navigateBySeconds(seconds) {
        const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
        video.currentTime = newTime;
        updateCurrentFrameDisplay();
    }
    
    // NEW: Function to update current frame display
    function updateCurrentFrameDisplay() {
        const currentFrameElem = document.getElementById('trake-current-frame');
        if (!currentFrameElem) return;
        
        const currentFrame = Math.floor(video.currentTime * videoFps);
        currentFrameElem.textContent = currentFrame.toString();
    }
    
    // NEW: Function to jump to input frame or time
    function jumpToInput() {
        let targetTime = null;
        
        // Check frame input first
        if (frameInput && frameInput.value.trim() !== '') {
            const frameNumber = parseInt(frameInput.value.trim());
            if (!isNaN(frameNumber) && frameNumber >= 0) {
                targetTime = frameNumber / videoFps;
            } else {
                alert('Please enter a valid frame number');
                return;
            }
        }
        // Check time input if frame input is empty
        else if (timeInput && timeInput.value.trim() !== '') {
            const timeString = timeInput.value.trim();
            const timeRegex = /^(\d+):([0-5]?\d)$/; // mm:ss format
            const match = timeString.match(timeRegex);
            
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                targetTime = minutes * 60 + seconds;
            } else {
                alert('Please enter time in mm:ss format (e.g., 1:23)');
                return;
            }
        } else {
            alert('Please enter either a frame number or time');
            return;
        }
        
        // Set the video time
        if (targetTime !== null) {
            video.currentTime = Math.max(0, Math.min(video.duration, targetTime));
            updateCurrentFrameDisplay();
            
            // Clear inputs
            if (frameInput) frameInput.value = '';
            if (timeInput) timeInput.value = '';
        }
    }
    
    // NEW: Function to mark frame from manual input
    function markFromInput() {
        let targetFrame = null;
        
        // Check frame input first
        if (frameInput && frameInput.value.trim() !== '') {
            const frameNumber = parseInt(frameInput.value.trim());
            if (!isNaN(frameNumber) && frameNumber >= 0) {
                targetFrame = frameNumber.toString();
            } else {
                alert('Please enter a valid frame number');
                return;
            }
        }
        // Check time input if frame input is empty
        else if (timeInput && timeInput.value.trim() !== '') {
            const timeString = timeInput.value.trim();
            const timeRegex = /^(\d+):([0-5]?\d)$/; // mm:ss format
            const match = timeString.match(timeRegex);
            
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const targetTime = minutes * 60 + seconds;
                targetFrame = Math.floor(targetTime * videoFps).toString();
            } else {
                alert('Please enter time in mm:ss format (e.g., 1:23)');
                return;
            }
        } else {
            // If no input, use current frame
            targetFrame = Math.floor(video.currentTime * videoFps).toString();
        }
        
        if (targetFrame) {
            markFrame(targetFrame, parseInt(targetFrame) / videoFps);
            
            // Clear inputs
            if (frameInput) frameInput.value = '';
            if (timeInput) timeInput.value = '';
        }
    }
    
    function markCurrentFrame() {
        const currentTime = video.currentTime;
        const frameNumber = Math.floor(currentTime * videoFps);
        const frameId = frameNumber.toString();
        markFrame(frameId, currentTime);
    }
    
    function markFrame(frameId, timestamp) {
        // Ensure frameId doesn't have extension
        const cleanFrameId = frameId.replace('.jpg', '').replace('.jpeg', '').replace('.avif', '');
        
        if (markedFrames.has(cleanFrameId)) {
            alert(`Frame ${cleanFrameId} is already marked!`);
            return;
        }
        markedFrames.add(cleanFrameId);
        updateTrakeDisplay();
        updateProgressMarkers();
    }
    
    function updateProgress() {
        const progress = document.getElementById('trake-progress');
        const currentTimeElem = document.getElementById('trake-current-time');
        
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
            list.innerHTML = Array.from(markedFrames).sort((a, b) => parseInt(a) - parseInt(b)).map(frameId => {
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
    
    // Function to construct video path with correct batch detection
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
    updateCurrentFrameDisplay();
}

// TRAKE Submission
async function submitToTrake(videoName, frameIds) {
    try {
        showLoadingOverlay();
        
        const formData = new FormData();
        formData.append('video_id', videoName.replace(".mp4",""));
        formData.append('frame_ids', frameIds.join(','));
        
        const response = await fetch('hub/submit_TRAKE', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Enhanced response handling for TRAKE
        let message = `TRAKE submission completed for ${frameIds.length} frames`;
        
        if (result.detail) {
            // Handle Type 1 response
            try {
                const detailObj = JSON.parse(result.detail);
                message = `TRAKE: ${detailObj.description || result.detail}`;
            } catch (e) {
                message = `TRAKE: ${result.detail}`;
            }
        } else if (result.data) {
            // Handle Type 2/3 responses with data field
            message = `TRAKE: ${result.data.description || result.data.message || 'Unknown response'}`;
            
            // Add submission result if available
            if (result.data.submission) {
                const statusIcon = result.data.submission === 'CORRECT' ? '✅' : '❌';
                message = `${statusIcon} TRAKE Submission: ${result.data.submission}\n${result.data.description}`;
            }
        } else if (result.message) {
            message = `TRAKE: ${result.message}`;
        } else if (result.status === 200) {
            message = `TRAKE submission successful! Submitted ${frameIds.length} frames.`;
        } else {
            message = `TRAKE: ${JSON.stringify(result)}`;
        }
        
        alert(message);
        
        // // Close modal only on successful submission
        // if (result.status === 200 || (result.data && result.data.status)) {
        //     const modal = document.querySelector('div[style*="z-index: 10000"]');
        //     if (modal) document.body.removeChild(modal);
        // }
        
    } catch (error) {
        console.error('TRAKE submission error:', error);
        alert('TRAKE submission error: ' + error.message);
    } finally {
        hideLoadingOverlay();
    }
}

// Add buttons to thumbnails
export function addSubmissionButtons() {
    // No submission service deployed -> don't decorate thumbnails with T/Q/R
    // buttons that would POST to routes the hub does not register.
    if (window.SUBMISSION_ENABLED === false) return;

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