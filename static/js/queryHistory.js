// static/js/queryHistory.js

import { loadSearchContext } from "./searchHandler.js";

export function initQueryHistory() {
    const prevQueryLink = document.getElementById('previous-query');
    const dropdown = document.getElementById('query-dropdown');
    const textarea = document.getElementById('query');

    function updateDropdown(history) {
        dropdown.innerHTML = history.map((item, idx) => {
            const date = item?.timestamp
                ? new Date(item.timestamp).toLocaleTimeString()
                : 'Unknown time';

            const model = typeof item?.model === 'string'
                ? item.model.replace('TEMPORAL_', 'T-')
                : 'Unknown model';

            // Handle scroll searches differently
            let displayText;
            if (item.queryType === 'scroll') {
                const video = item.filters?.video_filter || 'unknown video';
                const timeIn = item.filters?.time_in || '?';
                const timeOut = item.filters?.time_out || '?';
                displayText = `[Scroll] ${video} (${timeIn}-${timeOut})`;
            } else {
                displayText = truncateQuery(item?.query || '');
            }

            return `<option value="${idx}">
                [${date}] ${displayText} (${model})
            </option>`;
        }).join('');
    }

    function truncateQuery(query) {
        return query.length > 40
            ? `${query.slice(0,15)}...${query.slice(-20)}`
            : query;
    }

    // Load history from sessionStorage
    const storedHistory = sessionStorage.getItem('searchHistory');
    let history = storedHistory ? JSON.parse(storedHistory) : [];
    updateDropdown(history);

    prevQueryLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (history.length > 0) {
            const lastSearch = history[0];
            loadSearchContext(lastSearch);
        }
    });

    dropdown.addEventListener('change', () => {
        const idx = parseInt(dropdown.value);
        if (!isNaN(idx) && history[idx]) {
            loadSearchContext(history[idx]);
        }
    });

    document.getElementById('clear-history').addEventListener('click', () => {
        sessionStorage.removeItem('searchHistory');
        history = [];
        updateDropdown(history);
        prevQueryLink.textContent = '';
    });

    // Update session storage with full search context
    window.updateQueryHistory = (searchContext) => {
        // Add to beginning of history
        history = [searchContext, ...history].slice(0, 20);
        sessionStorage.setItem('searchHistory', JSON.stringify(history));
        updateDropdown(history);
        prevQueryLink.textContent = truncateQuery(searchContext.query);
    };
}
