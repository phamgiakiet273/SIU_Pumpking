function showImagePreview() {
    const uploadContainer = document.getElementById('image-upload-container');
    const previewContainer = document.getElementById('image-preview-container');

    uploadContainer.style.display = 'none';
    previewContainer.style.display = 'block';

    // Set fixed height for the section to prevent layout shift
    const section = document.getElementById('image-query-section');
    section.style.height = 'auto';
    const height = section.offsetHeight + 'px';
    section.style.height = '0';

    // Animate height change
    setTimeout(() => {
        section.style.height = height;
        setTimeout(() => {
            section.style.height = 'auto';
        }, 300);
    }, 10);
}


function handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
    }

    const imagePreview = document.getElementById('image-preview');

    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        showImagePreview();

        // Store file reference for upload
        imagePreview.dataset.fileName = file.name;
        imagePreview.dataset.fileContent = e.target.result.split(',')[1];
    };
    reader.readAsDataURL(file);
}

export function initPasteHandler(){
    // Add global paste handler
    document.addEventListener('paste', async (e) => {

        const activeTab = document.querySelector('.tab-button.active');
        const searchTabActive = activeTab?.dataset.tab === 'tab-search-content';

        if (!searchTabActive) return; // Do nothing if not in Search tab

        const items = e.clipboardData.items;

        // Check if clipboard contains image
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = items[i].getAsFile();

                // Switch to image search
                document.querySelector('input[name="query-type"][value="image"]').checked = true;
                const event = new Event('change');
                document.querySelector('input[name="query-type"][value="image"]').dispatchEvent(event);

                // Handle the image
                handleFiles([blob]);
                return;
            }
        }

        // Check if clipboard contains text
        const text = e.clipboardData.getData('text/plain');
        if (text && !(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            // Switch to text search
            e.preventDefault();
            document.querySelector('input[name="query-type"][value="text"]').checked = true;
            const event = new Event('change');
            document.querySelector('input[name="query-type"][value="text"]').dispatchEvent(event);

            // Set text in search box
            document.getElementById('query').value = text;
            document.getElementById('query').focus();
        }
    });
};
