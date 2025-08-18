// static/js/paginationTemporal.js

// --- State Variables ---
let currentPage = 1;
let resultsPerPage = 50; // This will be updated from the slider
let totalRows = 0;
let allTableRows = []; // This will hold the <tr> elements from the table

// --- DOM Elements ---
let videosContainer;
let pageInfo;
let prevPageBtn;
let nextPageBtn;

// --- Event Handlers (to be attached/detached) ---
const eventHandlers = {
    prev: () => goToPrevPage(),
    next: () => goToNextPage(),
    key: (e) => handleKeyDown(e)
};

/**
 * Initializes the module by grabbing DOM elements.
 * Called once on page load.
 */
export function initTemporalPagination() {
    videosContainer = document.getElementById('videos');
    pageInfo = document.getElementById('page-info');
    prevPageBtn = document.getElementById('prev-page');
    nextPageBtn = document.getElementById('next-page');

    // Initialize resultsPerPage from the slider's default value
    resultsPerPage = parseInt(document.getElementById('results-per-page-slider').value, 10);
}

/**
 * Activates temporal pagination for a given table.
 * This function is the main entry point from searchHandler.js.
 * It sets up the state and attaches the correct event listeners for the buttons.
 * @param {HTMLTableElement} table - The table element containing temporal results.
 */
export function setTemporalResults(table) {
    if (!table) return;

    // Grab all data rows (skip the header row `tr:first-of-type`)
    allTableRows = Array.from(table.querySelectorAll('tr:not(:first-of-type)'));
    totalRows = allTableRows.length;
    currentPage = 1;

    // Attach our specific event handlers
    attachEventListeners();

    // Display the first page
    displayTemporalPage(currentPage);
}

/**
 * Updates the number of rows per page and refreshes the view.
 * Called by the slider control.
 * @param {number} newSize - The new number of results per page.
 */
export function setTemporalResultsPerPage(newSize) {
    // This function should only run if we are in temporal view mode.
    if (!videosContainer.classList.contains('table-view')) {
        return;
    }

    resultsPerPage = newSize;
    const totalPages = Math.ceil(totalRows / resultsPerPage) || 1;

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    displayTemporalPage(currentPage);
}

/**
 * Shows/hides table rows based on the current page number.
 * @param {number} page - The page number to display.
 */
function displayTemporalPage(page) {
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;

    allTableRows.forEach((row, index) => {
        if (index >= startIndex && index < endIndex) {
            row.style.display = 'table-row'; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    });

    // Update pagination UI
    const totalPages = Math.ceil(totalRows / resultsPerPage) || 1;
    pageInfo.textContent = `${page}/${totalPages}`;
    prevPageBtn.disabled = (page === 1);
    nextPageBtn.disabled = (page === totalPages);
}

// --- Internal Navigation Functions ---

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTemporalPage(currentPage);
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(totalRows / resultsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTemporalPage(currentPage);
    }
}

function handleKeyDown(event) {
    if (window.isModalOpen) {
        return;
    }

    const isInputFocused = document.activeElement.tagName === 'INPUT' ||
                          document.activeElement.tagName === 'TEXTAREA';
    if (isInputFocused) return;

    if (!videosContainer.classList.contains('table-view')) return;

    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            goToPrevPage();
            break;
        case 'ArrowRight':
            event.preventDefault();
            goToNextPage();
            break;
    }
}

/**
 * Attaches the event listeners for temporal pagination.
 */
function attachEventListeners() {
    prevPageBtn.onclick = eventHandlers.prev;
    nextPageBtn.onclick = eventHandlers.next;
    document.removeEventListener('keydown', handleKeyDown); // Avoid duplicates
    document.addEventListener('keydown', eventHandlers.key);
}
