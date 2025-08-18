// s2tFilter.js
export function initS2TFilter() {
    const s2tFilter = document.getElementById('s2t_filter');

    // Optional: Add input formatting or validation if needed
    s2tFilter.addEventListener('input', (e) => {
        // Example: Convert to lowercase for case-insensitive search
        e.target.value = e.target.value.toLowerCase();
    });
}
