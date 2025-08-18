// static/js/filterPanel.js

let excludedFrames = [];

export function initFilterPanel() {
    const panelContainer = document.querySelector('.filters-panel-container');
    const trigger = document.querySelector('.filters-trigger');
    const panel = document.querySelector('.filters-panel');

    trigger.addEventListener('mouseenter', () => {
        panel.style.display = 'block';
    });

    panelContainer.addEventListener('mouseleave', () => {
        panel.style.display = 'none';
    });

    // Fetch video names
    document.getElementById('fetch-video-names').addEventListener('click', fetchVideoNames);

    // Reset filters
    document.getElementById('reset-filters').addEventListener('click', resetFilters);

    // Enter upon submit
    document.querySelector('.filters-panel').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('form').submit();
        }
    });

    // Video search functionality
    const videoSearch = document.getElementById('video-search');
    const videoDropdown = document.getElementById('video-names-dropdown');

    if (videoSearch) {
        videoSearch.addEventListener('input', () => {
            const searchTerm = videoSearch.value.toLowerCase();
            const options = videoDropdown.querySelectorAll('option');

            options.forEach(option => {
                const text = option.textContent.toLowerCase();
                option.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }


    // Batch selection change handling
    const batchCheckboxes = document.querySelectorAll('input[name="batch"]');
    batchCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', fetchVideoNames);
    });

    // Fetch videos on initial load
    fetchVideoNames();

    // Reset filters
    document.getElementById('reset-filters')?.addEventListener('click', resetFilters);
}

export async function fetchVideoNames() {
    const batches = Array.from(document.querySelectorAll('input[name="batch"]:checked'))
        .map(cb => parseInt(cb.value));

    try {
        const formData = new FormData();
        formData.append('batch_id', JSON.stringify(batches));  // batches = [0, 1]

        const response = await fetch(buildUrl('hub/get_video_names_of_batch'), {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to fetch video names');
        }

        const data = await response.json();
        const dropdown = document.getElementById('video-names-dropdown');

        dropdown.innerHTML = '';
        data.data.forEach(video => {
            const option = document.createElement('option');
            option.value = video;
            option.textContent = video;
            dropdown.appendChild(option);
        });
    } catch (error) {
        alert(`Error fetching video names: ${error.message}`);
    }
}

export function addExcludedFrame(frameRecord) {
    const { video_name, keyframe_id, related_start_frame, related_end_frame } = frameRecord;
    const frameName = keyframe_id; // Alias for clarity

    let video_name_adjusted = video_name.replace('.mp4','');

    // Check for existing exclusion
    const isAlreadyExcluded = excludedFrames.some(f =>
        f.video_name === video_name_adjusted && f.frame_name === frameName
    );

    if (!isAlreadyExcluded) {
        excludedFrames.push({
            video_name: video_name_adjusted,
            frame_name: frameName,
            related_start_frame,
            related_end_frame
        });
        updateExcludedList();
    }
}

export function updateExcludedList() {
    const list = document.getElementById('excluded-frames-list');
    list.innerHTML = '';

    excludedFrames.forEach((frame, index) => {
        const li = document.createElement('li');
        li.textContent = `${frame.video_name} - ${frame.frame_name}`;
        li.style.padding = '5px';
        li.style.borderBottom = '1px solid #444';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.classList.add('remove-btn');

        removeBtn.addEventListener('click', () => {
        excludedFrames.splice(index, 1);
        updateExcludedList();
        });

        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

function resetFilters() {
    excludedFrames = [];
    document.getElementById('s2t_filter').value = '';
    document.getElementById('time_in').value = '';
    document.getElementById('time_out').value = '';
    document.getElementById('video-names-dropdown').innerHTML = '';
    updateExcludedList();
}

export function getFilters() {
    const videoFilter = Array.from(document.getElementById('video-names-dropdown').selectedOptions)
        .map(opt => opt.value);

    return {
        video_filter: videoFilter.join(', '),
        s2t_filter: document.getElementById('s2t_filter').value,
        time_in: document.getElementById('time_in').value,
        time_out: document.getElementById('time_out').value,
        skip_frames: JSON.stringify(excludedFrames)
    };
}
