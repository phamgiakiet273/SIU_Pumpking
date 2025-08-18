export function initCharCounter() {
    const textarea = document.getElementById('query');
    const charCountDiv = document.getElementById('charCount');
    const maxWords = 64;

    function countWords(text) {
        return text.trim().split(/\s+/).filter(Boolean).length;
    }

    function updateWordCount() {
        const currentWordCount = countWords(textarea.value);
        charCountDiv.textContent = `${currentWordCount}/${maxWords}`;
        charCountDiv.classList.toggle('warning', currentWordCount > maxWords);
    }

    textarea.addEventListener('input', updateWordCount);
}


export function initTextAutoGrow(){
    document.querySelectorAll('textarea.autogrow').forEach(textarea => {
        const adjustHeight = () => {
            textarea.style.height = 'auto';                   // reset height
            textarea.style.height = textarea.scrollHeight + 'px';  // set to fit content
        };

        // on page load, size it to any pre-filled content
        window.addEventListener('load', adjustHeight);

        // when the user types or pastes
        textarea.addEventListener('input', adjustHeight);
    });
}
