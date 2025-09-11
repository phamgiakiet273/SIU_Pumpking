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
 * It will translate either the main textarea (#query) or each temporal input
 * when a TEMPORAL_ model is selected.
 */
export function initTranslate() {
    const translateBtn = document.getElementById('translateBtn');
    if (!translateBtn) return;

    const textarea = document.getElementById('query');

    translateBtn.addEventListener('click', async () => {
        // Basic UI guard
        const originalText = translateBtn.textContent;
        translateBtn.textContent = '...';
        translateBtn.disabled = true;

        let anyErrors = false;
        let errorMessages = [];

        try {
            // Determine if a temporal model is selected
            const modelRadio = document.querySelector('input[name="model"]:checked');
            const modelValue = modelRadio ? modelRadio.value : '';
            const isTemporal = modelValue.startsWith('TEMPORAL_');

            if (isTemporal) {
                // Translate each temporal input individually
                const container = document.getElementById('temporal-events-container');
                if (!container) {
                    alert('Temporal events container not found.');
                    return;
                }

                const inputs = Array.from(container.querySelectorAll('input[type="text"]'));
                const nonEmptyInputs = inputs.filter(i => i && i.value && i.value.trim().length > 0);

                if (nonEmptyInputs.length === 0) {
                    alert('No temporal event text found to translate.');
                    return;
                }

                // Prepare translation promises
                const texts = nonEmptyInputs.map(i => i.value);
                const promises = texts.map(t => translateText(t).catch(err => ({ __err: err })));

                // Run translations in parallel
                const results = await Promise.all(promises);

                // Apply results back to inputs (in order)
                for (let idx = 0; idx < results.length; idx++) {
                    const res = results[idx];
                    const input = nonEmptyInputs[idx];

                    if (res && typeof res === 'string') {
                        // Use execCommand to emulate user input (helps with undo)
                        try {
                            input.focus();
                            input.select();
                            document.execCommand('insertText', false, res);
                            // Trigger input event so listeners update internal state (e.g., temporalEvents array)
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        } catch (cmdErr) {
                            // Fallback if execCommand isn't available for this element
                            input.value = res;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    } else {
                        anyErrors = true;
                        const errObj = res && res.__err ? res.__err : new Error('Unknown translation error');
                        console.error('Translation error for temporal input:', errObj);
                        errorMessages.push(errObj.message || String(errObj));
                        // leave original input value intact
                    }
                }

                if (anyErrors) {
                    alert('One or more temporal translations failed. See console for details.');
                }

            } else {
                // Non-temporal: translate the main textarea
                if (!textarea) {
                    alert('Query textarea not found.');
                    return;
                }

                const text = textarea.value.trim();
                if (!text) {
                    alert('Please enter some text to translate');
                    return;
                }

                try {
                    const translatedText = await translateText(text);

                    // Use execCommand to simulate real user input so Ctrl+Z works
                    textarea.focus();
                    textarea.select();
                    document.execCommand('insertText', false, translatedText);

                    // Trigger input event if any listeners rely on it
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                } catch (err) {
                    console.error('Translation failed:', err);
                    alert(`Translation failed: ${err.message}`);
                }
            }
        } catch (err) {
            console.error('Unexpected translation error:', err);
            alert(`Translation failed: ${err.message || String(err)}`);
        } finally {
            translateBtn.textContent = originalText;
            translateBtn.disabled = false;
        }
    });
}