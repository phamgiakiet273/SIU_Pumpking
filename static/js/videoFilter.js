export function initVideoFilter() {
    const videoFilter = document.getElementById('video_filter');

    videoFilter.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase();

        if (e.inputType !== 'deleteContentBackward') {
            if (!value.startsWith('L')) value = 'L' + value;
            if (/^L\d{2}$/.test(value)) value += '_V';
            if (value.length > 4 && !value.includes('_V')) value = value.slice(0,4) + '_V';
        }

        e.target.value = value;
    });
}
