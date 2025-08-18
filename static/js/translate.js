// static/js/translate.js

/**
 * A reusable function to translate text via the API.
 * @param {string} text - The text to translate.
 * @returns {Promise<string>} - A promise that resolves to the translated text.
 * @throws {Error} - Throws an error if translation fails or the response is invalid.
 */
export async function translateText(text) {
    if (!text) {
        throw new Error("No text was provided for translation.");
    }

    const formData = new FormData();
    formData.append('text', text);

    const response = await fetch('hub/translate', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Translation API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (result.data && typeof result.data === 'string' && result.data.length > 0) {
        return result.data; // Return the translated string
    } else {
        throw new Error('Unexpected translation response format.');
    }
}


/**
 * Initializes the manual translate button ('T').
 * This function now uses the reusable translateText function.
 */
export function initTranslate() {
    const translateBtn = document.getElementById('translateBtn');
    const textarea = document.getElementById('query');

    translateBtn.addEventListener('click', async () => {
        const text = textarea.value.trim();
        if (!text) {
            alert('Please enter some text to translate');
            return;
        }

        try {
            translateBtn.textContent = '...';
            translateBtn.disabled = true;

            // Call our new, reusable function
            const translatedText = await translateText(text);

            // Use execCommand to simulate real user input so Ctrl+Z works
            textarea.focus();
            textarea.select();
            document.execCommand('insertText', false, translatedText);

        } catch (error) {
            console.error('Translation failed:', error);
            alert(`Translation failed: ${error.message}`);
        } finally {
            translateBtn.textContent = 'T';
            translateBtn.disabled = false;
        }
    });
}
