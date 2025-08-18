// static/js/api.js

// --- CONFIGURATION ---
// Set the global API prefix here. Leave as an empty string for no prefix.
// Example: 'siu_pumpking_2'
const API_PREFIX = '';

/**
 * A wrapper around the native fetch function that automatically prepends the API_PREFIX.
 * @param {string} url - The API endpoint (e.g., 'hub/siglip_v2_text_search').
 * @param {RequestInit} [options] - The options for the fetch request (e.g., method, body).
 * @returns {Promise<Response>} A promise that resolves to the response of the request.
 */
export async function prefixedFetch(url, options) {
    const fullUrl = API_PREFIX ? `/${API_PREFIX}${url}` : url;
    return fetch(fullUrl, options);
}
