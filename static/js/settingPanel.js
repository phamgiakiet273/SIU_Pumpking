

export function initSettingsPanel() {
    // Ensure panel closes when mouse leaves
    const panelContainer = document.querySelector('.settings-panel-container');
    const trigger = document.querySelector('.settings-trigger');

    // Show the panel when the trigger is clicked
    trigger.addEventListener('mouseenter', () => {
        const panel = document.querySelector('.settings-panel')
        panel.style.display = 'block';
    });

    panelContainer.addEventListener('mouseleave', () => {
        const panel = document.querySelector('.settings-panel');
        panel.style.display = 'none';
    });

    const neighborFramesCountSlider = document.getElementById('neighbor-frames-count-slider');
    const neighborFramesCountValue = document.getElementById('neighbor-frames-count-value');

    if (neighborFramesCountSlider && neighborFramesCountValue) {
        // Initial sync
        neighborFramesCountValue.value = neighborFramesCountSlider.value;
        window.neighborFramesCount = parseInt(neighborFramesCountSlider.value);

        // Slider → Textbox
        neighborFramesCountSlider.addEventListener('input', function () {
            neighborFramesCountValue.value = this.value;
            window.neighborFramesCount = parseInt(this.value);
        });

        // Textbox → Slider
        neighborFramesCountValue.addEventListener('input', function () {
            let val = parseInt(this.value);

            // Clamp to slider's min/max
            if (isNaN(val)) val = neighborFramesCountSlider.min;
            val = Math.max(parseInt(neighborFramesCountSlider.min),
                           Math.min(parseInt(neighborFramesCountSlider.max), val));

            this.value = val; // Correct invalid input
            neighborFramesCountSlider.value = val;
            window.neighborFramesCount = val;
        });
    }
}
