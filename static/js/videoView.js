// videoView.js

// Import the function we want to call
import { submitToTKIS, openQAModal, openTrakeModal } from './submissionButtons.js';

// Create video modal structure
function createVideoModal() {
    const modalHTML = `
    <div id="video-modal" class="modal" style="
        display: none;
        font-size:0.75vw;
        position: fixed;
        z-index: 1001;  /* Higher than thumbnail modal */
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.9);
        overflow: auto;
    ">
        <div class="modal-content" style="
            background-color: #111;
            margin: 2% auto;
            padding: 20px;
            border: 1px solid #444;
            width: 90%;
            max-width: 1200px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        ">
            <span class="video-close" style="
                color: #fff;
                float: right;
                font-size: 40px;
                font-weight: bold;
                cursor: pointer;
                text-shadow: 0 0 5px rgba(0,0,0,0.5);
                z-index: 1002;
                position: relative;
            ">×</span>
            
            <div class="video-container" style="position: relative; padding-top: 56.25%; /* 16:9 Aspect Ratio */">
                <video id="modal-video" controls style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                ">
                    Your browser does not support the video tag.
                </video>
                <div id="video-spinner" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 24px;
                    display: none;
                ">Loading video...</div>
            </div>
            
            <div class="video-info" style="
                color: white;
                padding: 15px 0;
                font-size: 18px;
                display: flex;
                justify-content: space-between;
            ">
                <span id="video-filename"></span>
                <span id="video-timestamp"></span>
            </div>

            <!-- UPDATED: Only three submission buttons -->
            <div class="modal-actions" style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="video-tkis-btn" style="
                        padding: 10px 20px;
                        font-size: 16px;
                        font-weight: bold;
                        color: white;
                        background-color: #003b6d;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: opacity 0.3s;
                        flex: 1;
                    ">Submit to TV</button>
                    
                    <button id="video-qa-btn" style="
                        padding: 10px 20px;
                        font-size: 16px;
                        font-weight: bold;
                        color: white;
                        background-color: #28a745;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: opacity 0.3s;
                        flex: 1;
                    ">Submit to QA</button>
                    
                    <button id="video-trake-btn" style="
                        padding: 10px 20px;
                        font-size: 16px;
                        font-weight: bold;
                        color: white;
                        background-color: #dc3545;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: opacity 0.3s;
                        flex: 1;
                    ">Submit to TR</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup close handlers
    document.querySelector('#video-modal .video-close').addEventListener('click', closeVideoModal);
    document.getElementById('video-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('video-modal')) {
            closeVideoModal();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('video-modal').style.display === 'block') {
            closeVideoModal();
        }
    });

    // Event listeners for submission buttons
    document.getElementById('video-tkis-btn').addEventListener('click', function() {
        const video = document.getElementById('modal-video');
        const currentTime = video.currentTime;
        const videoName = this.dataset.videoName;
        const fps = parseFloat(this.dataset.fps);

        if (videoName && !isNaN(fps)) {
            const currentFrameId = Math.round(currentTime * fps);
            const frameInfo = {
                videoName: videoName,
                frameId: currentFrameId.toString().padStart(5, '0') + '.jpg',
                fps: fps,
                frameNumber: currentFrameId,
                timeMs: Math.round(currentTime * 1000)
            };
            
            closeVideoModal();
            submitToTKIS(frameInfo);
        }
    });

    document.getElementById('video-qa-btn').addEventListener('click', function() {
        const video = document.getElementById('modal-video');
        const currentTime = video.currentTime;
        const videoName = this.dataset.videoName;
        const fps = parseFloat(this.dataset.fps);

        if (videoName && !isNaN(fps)) {
            const currentFrameId = Math.round(currentTime * fps);
            const frameInfo = {
                videoName: videoName,
                frameId: currentFrameId.toString().padStart(5, '0') + '.jpg',
                fps: fps,
                frameNumber: currentFrameId,
                timeMs: Math.round(currentTime * 1000)
            };
            
            closeVideoModal();
            openQAModal(frameInfo);
        }
    });

    document.getElementById('video-trake-btn').addEventListener('click', function() {
        const video = document.getElementById('modal-video');
        const currentTime = video.currentTime;
        const videoName = this.dataset.videoName;
        const fps = parseFloat(this.dataset.fps);

        if (videoName && !isNaN(fps)) {
            const currentFrameId = Math.round(currentTime * fps);
            const frameInfo = {
                videoName: videoName,
                frameId: currentFrameId.toString().padStart(5, '0') + '.jpg',
                fps: fps,
                frameNumber: currentFrameId,
                timeMs: Math.round(currentTime * 1000)
            };
            
            closeVideoModal();
            openTrakeModal(frameInfo);
        }
    });
}

// Close video modal and stop playback
function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    
    if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
    }
    
    modal.style.display = 'none';
    document.getElementById('video-spinner').style.display = 'none';
}

// Show video in modal
function showVideoModal(record) {
    if (!document.getElementById('video-modal')) {
        createVideoModal();
    }
    
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    const spinner = document.getElementById('video-spinner');
    const filename = document.getElementById('video-filename');
    const timestamp = document.getElementById('video-timestamp');
    const tkisBtn = document.getElementById('video-tkis-btn');
    const qaBtn = document.getElementById('video-qa-btn');
    const trakeBtn = document.getElementById('video-trake-btn');

    spinner.style.display = 'block';
    modal.style.display = 'block';
    
    filename.textContent = record.video_name;
    
    const frameNum = parseInt(record.keyframe_id);
    const fps = parseFloat(record.fps) || 25;
    const startTime = frameNum / fps;
    
    const formatTime = (seconds) => {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substring(11, 19);
    };
    
    timestamp.textContent = `Start: ${formatTime(startTime)}`;
    
    // Store the necessary data on all buttons
    tkisBtn.dataset.videoName = record.video_name;
    tkisBtn.dataset.fps = fps;
    qaBtn.dataset.videoName = record.video_name;
    qaBtn.dataset.fps = fps;
    trakeBtn.dataset.videoName = record.video_name;
    trakeBtn.dataset.fps = fps;

    const relativePath = record.video_path;
    const videoSrc = `hub/send_video/${encodeURIComponent(relativePath)}#t=${startTime}`;
    
    video.src = videoSrc;
    
    video.onloadedmetadata = () => {
        spinner.style.display = 'none';
        video.currentTime = startTime;
    };
    
    video.onerror = () => {
        spinner.style.display = 'none';
        alert('Error loading video');
        closeVideoModal();
    };
    
    video.oncanplay = () => {
        video.play().catch(e => console.log('Autoplay prevented:', e));
    };
}

// Initialize video view functionality
export function initVideoView() {
    if (!document.getElementById('video-modal')) {
        createVideoModal();
    }
    
    document.querySelectorAll('.video_id').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const index = this.getAttribute('target');
            
            if (window.currentVideos && window.currentVideos[index]) {
                showVideoModal(window.currentVideos[index]);
            }
        });
    });
}