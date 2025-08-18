// Add to main.js
export function initImageQueryToggle() {
    const textSection = document.getElementById('text-query-section');
    const imageSection = document.getElementById('image-query-section');
    const queryTypeRadios = document.querySelectorAll('input[name="query-type"]');

    queryTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'text') {
                textSection.style.display = 'flex';
                imageSection.style.display = 'none';
            } else {
                textSection.style.display = 'none';
                imageSection.style.display = 'block';
            }
        });
    });
}

export function initImageUpload() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('image-file');
    const imagePreview = document.getElementById('image-preview');
    const imageUrlInput = document.getElementById('image-url');
    const uploadContainer = document.getElementById('image-upload-container');
    const previewContainer = document.getElementById('image-preview-container');

    // Drag and drop handling
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('active');
    }

    function unhighlight() {
        dropArea.classList.remove('active');
    }

    // Global drag handler
    document.addEventListener('dragover', (e) => {
        if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
        }
    });

    document.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length > 0 &&
            e.dataTransfer.files[0].type.startsWith('image/')) {
        e.preventDefault();

        // Switch to image search
        const imageRadio = document.querySelector('input[name="query-type"][value="image"]');
        if (imageRadio) {
            imageRadio.checked = true;
            const event = new Event('change');
            imageRadio.dispatchEvent(event);
        }

        // Handle dropped image
        handleFiles(e.dataTransfer.files);
        }
    });

    dropArea.addEventListener('drop', handleDrop, false);

    const closeButton = document.querySelector('.close-preview');
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            e.preventDefault();

            // Reset the image preview
            imagePreview.src = '';
            previewContainer.style.display = 'none';
            uploadContainer.style.display = 'block';

            // Clear inputs
            fileInput.value = '';
            imageUrlInput.value = '';

            // Clear stored file data
            delete imagePreview.dataset.fileName;
            delete imagePreview.dataset.fileContent;
        });
    }
    function handleDrop(e) {
        preventDefaults(e);
        unhighlight(e);

        // Check if we're getting a thumbnail drag (has image data)
        if (e.dataTransfer.types.includes('text/plain') ||
            e.dataTransfer.types.includes('image/jpeg')) {
            const imageUrl = e.dataTransfer.getData('text/plain');
            imagePreview.src = imageUrl;
            showImagePreview();
            return;
        }

        // Handle file drops
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }

    document.addEventListener('dragover', (e) => {
        if (e.dataTransfer.types.some(t => t === 'Files' || t === 'text/plain')) {
            e.preventDefault();
        }
    });

    // File input handling
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // URL handling
    imageUrlInput.addEventListener('blur', function() {
        const url = this.value.trim();
        if (url) {
            imagePreview.src = url;
            showImagePreview();
        }
    });

    // Remove paste button since we're using keyboard paste
    document.getElementById('paste-image-btn')?.remove();

    function handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

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

    function showImagePreview() {
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
}
