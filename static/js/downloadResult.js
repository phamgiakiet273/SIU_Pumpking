export function initDownloadResult(){

    const downloadBtn = document.getElementById('download-results-btn');
    const filenameInput = document.getElementById('download-filename');
    const downloadLimitSlider = document.getElementById('download-limit-slider');
    const downloadLimitValue = document.getElementById('download-limit-value');
    
    console.log(downloadBtn);

    // Sync download limit slider and value
    if (downloadLimitSlider && downloadLimitValue) {
        downloadLimitSlider.addEventListener('input', function() {
            downloadLimitValue.value = this.value;
        });
        
        downloadLimitValue.addEventListener('input', function() {
            let val = parseInt(this.value);
            if (isNaN(val)) val = downloadLimitSlider.min;
            val = Math.max(parseInt(downloadLimitSlider.min), 
                            Math.min(parseInt(downloadLimitSlider.max), val));
            this.value = val;
            downloadLimitSlider.value = val;
        });
    }
    
    // Add event listener to download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (!window.currentVideos || window.currentVideos.length === 0) {
                alert('No results to download. Please perform a search first.');
                return;
            }
            
            const limit = parseInt(downloadLimitValue.value) || 100;
            const results = window.currentVideos.slice(0, limit);
            const filename = filenameInput.value || 'result.csv';
            
            // Generate CSV content
            let csvContent = '';
            results.forEach(result => {
                csvContent += `${result.video_name.replace('.mp4', '')},${result.keyframe_id}\n`;
            });
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
}