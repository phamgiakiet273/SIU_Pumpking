// videoView.js

// Import the function we want to call
import { fillSubmissionForm } from './submitHandler.js';

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

            <div class="modal-actions" style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
                <button id="choose-frame-btn" style="
                    padding: 10px 20px;
                    font-size: 16px;
                    font-weight: bold;
                    color: white;
                    background-color: #40E0D0; /* Same as search button */
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                ">Choose this frame</button>
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

    // ================== THIS IS THE CORRECTED PART ==================
    // Add event listener for our new button
    document.getElementById('choose-frame-btn').addEventListener('click', function() {
        // Get the video element to read its CURRENT state
        const video = document.getElementById('modal-video');
        const currentTime = video.currentTime; // Get current time in seconds

        // Get the static data that doesn't change from the button's dataset
        const videoName = this.dataset.videoName;
        const fps = parseFloat(this.dataset.fps);

        if (videoName && !isNaN(fps)) {
            // Calculate the current frame ID based on the video's current time
            const currentFrameId = Math.round(currentTime * fps);

            // Call the imported function with the NEW, DYNAMIC data
            // We pass the FPS so fillSubmissionForm can correctly calculate the time in milliseconds
            fillSubmissionForm(videoName, currentFrameId.toString(), fps);

            // Close the modal after selection
            closeVideoModal();
        } else {
            console.error("Could not submit from video modal: data missing or invalid FPS.");
        }
    });
    // =================================================================
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
    const chooseBtn = document.getElementById('choose-frame-btn');

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

    // Store the necessary data on the button itself.
    // Note we no longer need to store frameId here, but it doesn't hurt.
    chooseBtn.dataset.videoName = record.video_name;
    chooseBtn.dataset.fps = fps;
    // We are removing the frameId from the dataset to avoid confusion, as it's no longer used.
    // chooseBtn.dataset.frameId = record.keyframe_id; // This is no longer needed

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
