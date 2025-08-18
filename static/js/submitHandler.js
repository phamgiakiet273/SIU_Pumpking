import { createLoadingOverlay, showLoadingOverlay, hideLoadingOverlay } from './loadingOverlay.js';

// submitHandler.js
export function initSubmitHandler() {
    const tabButtons = document.querySelectorAll('.tab-button');
    if (!tabButtons.length) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const tabId = this.dataset.tab;
            const tabContent = document.getElementById(tabId);

            if (!tabContent) {
                console.error(`Tab content not found: ${tabId}`);
                return;
            }

            // Remove active class from all tabs
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

            // Add active class to current tab
            this.classList.add('active');
            tabContent.classList.add('active');
        });
    });

    // Function to fetch and fill session and eval IDs
    async function fetchAndFillIDs() {
        try {
            const response = await fetch('hub/get_session_and_eval_id');
            const data = await response.json();
            if (data.status === 200) {
                const sessionInput = document.getElementById('session-id');
                const evalInput = document.getElementById('eval-id');
                if (!sessionInput.value) sessionInput.value = data.data.session_id;
                if (!evalInput.value) evalInput.value = data.data.eval_id;
            } else {
                console.warn('Failed to get IDs on init:', data.message);
            }
        } catch (error) {
            console.error('Error fetching IDs on init:', error);
        }
    }

    // Get session/eval IDs on button click
    const getSessionBtn = document.getElementById('get-session-btn');
    if (getSessionBtn) {
        getSessionBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('hub/get_session_and_eval_id');
                const data = await response.json();
                if (data.status === 200) {
                    document.getElementById('session-id').value = data.data.session_id;
                    document.getElementById('eval-id').value = data.data.eval_id;
                } else {
                    alert('Failed to get IDs: ' + data.message);
                }
            } catch (error) {
                console.error('Session ID error:', error);
                alert('Failed to get session IDs');
            }
        });
    }

    // Automatically fetch IDs on init if empty
    const sessionInput = document.getElementById('session-id');
    const evalInput = document.getElementById('eval-id');
    if (sessionInput && evalInput && (!sessionInput.value || !evalInput.value)) {
        fetchAndFillIDs().catch(err => {
            console.error('Failed to fetch IDs on init:', err);
        });
    }

    // DRES submission
    const submitBtn = document.getElementById('submit-dres-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const sessionId = document.getElementById('session-id').value;
            const evalId = document.getElementById('eval-id').value;
            const mediaItem = document.getElementById('media-item').value;
            const start = document.getElementById('start-time').value;
            const end = document.getElementById('end-time').value;

            if (!sessionId || !evalId || !mediaItem || !start || !end) {
                alert('Please fill all fields');
                return;
            }

            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('eval_id', evalId);
            formData.append('mediaItemName', mediaItem);
            formData.append('start', start);
            formData.append('end', end);

            showLoadingOverlay();

            try {
                const response = await fetch('hub/submitDRES', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                const statusDiv = document.getElementById('submission-status');

                if (result.status === 200) {
                    statusDiv.textContent = result.data.description;
                    statusDiv.className = result.data.submission === 'CORRECT' ?
                        'submission-success' : 'submission-error';
                } else {
                    statusDiv.textContent = 'Submission failed: ' + result.message;
                    statusDiv.className = 'submission-error';
                }

            }
            catch (error)
            {
                console.error('Submission error:', error);
                document.getElementById('submission-status').textContent = 'Submission error: ' + error.message;
            }
            finally{
                hideLoadingOverlay();
            }
        });
    }
}

// Function to fill submission form from thumbnail click
export function fillSubmissionForm(videoName, frameId, fps = null) { // MODIFIED: Added optional fps parameter
    // Switch to the submission tab
    const submissionTabBtn = document.querySelector('[data-tab="tab-submission-content"]');
    const submissionTab    = document.getElementById('tab-submission-content');
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    submissionTabBtn.classList.add('active');
    submissionTab.classList.add('active');

    let fpsValue = 1; // Default FPS

    // MODIFIED: Logic to determine FPS
    if (fps !== null) {
        // If FPS is provided directly (from video modal), use it.
        fpsValue = parseFloat(fps) || 1;
    } else {
        // Otherwise, find it the old way from the thumbnail's hidden data.
        const thumb = Array.from(document.querySelectorAll('.thumbnail')).find(t => {
            const vid = t.querySelector('.video_id')?.textContent.trim();
            const frm = t.querySelector('.image_id')?.textContent.trim();
            return vid === videoName && frm === frameId;
        });

        if (thumb) {
            const fpsText = thumb.querySelector('.fps')?.textContent.trim() || '1';
            fpsValue = parseFloat(fpsText) || 1;
        } else {
            console.error('Thumbnail not found for', videoName, frameId, 'and no FPS was provided.');
            // We can still proceed with a default FPS of 1, but it might be inaccurate.
        }
    }

    // Compute time in ms: frameIndex / fps * 1000
    const frameNum = parseInt(frameId, 10) || 0;
    const timeMs   = Math.round((frameNum / fpsValue) * 1000);

    // Fill the form
    const mediaItem = document.getElementById('media-item');
    const startTime = document.getElementById('start-time');
    const endTime   = document.getElementById('end-time');
    mediaItem.value = videoName;
    startTime.value = timeMs;
    endTime.value   = timeMs;

    // Focus the submit button so Enter will submit
    const submitBtn = document.getElementById('submit-dres-btn');
    if (submitBtn) {
        submitBtn.focus();
        submitBtn.classList.add('focus-visible');
    }
}

// Initialize thumbnail selection functionality
export function initThumbnailSelection() {
    // This function does not need changes as it's not directly involved in tab switching.
    // ... (rest of the function is unchanged)
    // Add selection button to all thumbnails
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        // Check if button already exists
        if (!thumb.querySelector('.select-btn')) {
            const videoName = thumb.querySelector('.video_id')?.textContent.trim();
            const frameId = thumb.querySelector('.image_id')?.textContent.trim();

            if (videoName && frameId) {
                const selectBtn = document.createElement('button');
                selectBtn.className = 'select-btn';
                selectBtn.type = 'button';
                selectBtn.dataset.video = videoName;
                selectBtn.dataset.frame = frameId;
                selectBtn.innerHTML = '✓';

                thumb.querySelector('div[style*="position: relative"]').appendChild(selectBtn);
            }
        }
    });

    // Add event listeners to selection buttons
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const video = this.dataset.video;
            const frame = this.dataset.frame;

            // Mark as selected visually
            document.querySelectorAll('.select-btn').forEach(b => {
                b.classList.remove('selected');
                b.style.opacity = 0;
            });
            this.classList.add('selected');
            this.style.opacity = 1;

            // Fill submission form and focus submit button
            fillSubmissionForm(video, frame);
        });
    });

    // Add hover effect to thumbnails
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('mouseenter', function() {
            const btn = this.querySelector('.select-btn');
            if (btn && !btn.classList.contains('selected')) {
                btn.style.opacity = 0.7;
            }
        });

        thumb.addEventListener('mouseleave', function() {
            const btn = this.querySelector('.select-btn');
            if (btn && !btn.classList.contains('selected')) {
                btn.style.opacity = 0;
            }
        });
    });
}
