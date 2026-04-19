/**
 * AMETHYST LIBRARY - CORE ENGINE
 * Features: LocalStorage, Alphabetical Sorting, Achievement Logic
 */

// --- Initial State ---
let books = JSON.parse(localStorage.getItem('amethyst_books')) || [];
let currentTab = 'in-progress'; // Default view

// --- DOM Elements ---
const bookList = document.getElementById('book-list');
const achievementsList = document.getElementById('achievements-list');
const bookForm = document.getElementById('book-form');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    render();
    setupEventListeners();
});

function setupEventListeners() {
    // Handle Form Submission (Add & Edit)
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveBook();
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.getElementById('close-modal').onclick = closeModal;
}

// --- Data Operations ---

function saveToStorage() {
    localStorage.setItem('amethyst_books', JSON.stringify(books));
    render();
}

function saveBook() {
    const id = document.getElementById('edit-id').value || Date.now().toString();
    const title = document.getElementById('title').value;
    const cover = document.getElementById('cover').value;
    const totalPages = parseInt(document.getElementById('total-pages').value);
    const pagesRead = parseInt(document.getElementById('pages-read').value);

    const bookData = { id, title, cover, totalPages, pagesRead };

    const index = books.findIndex(b => b.id === id);
    if (index > -1) {
        books[index] = bookData; // Update existing
    } else {
        books.push(bookData); // Add new
    }

    saveToStorage();
    closeModal();
}

function deleteBook(id) {
    if (confirm('Remove this book from your library?')) {
        books = books.filter(b => b.id !== id);
        saveToStorage();
    }
}

// --- UI Logic ---

function switchTab(tab) {
    currentTab = tab;
    
    // Update active state in bottom nav
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    render();
}

function openModal(id = null) {
    bookForm.reset();
    document.getElementById('edit-id').value = '';
    
    if (id) {
        const book = books.find(b => b.id === id);
        modalTitle.innerText = "Edit Book";
        document.getElementById('edit-id').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('cover').value = book.cover;
        document.getElementById('total-pages').value = book.totalPages;
        document.getElementById('pages-read').value = book.pagesRead;
    } else {
        modalTitle.innerText = "Add New Book";
    }
    
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

// --- Rendering Engine ---

function render() {
    bookList.innerHTML = '';
    achievementsList.innerHTML = '';

    if (currentTab === 'achievements') {
        bookList.classList.add('hidden');
        achievementsList.classList.remove('hidden');
        renderAchievements();
        return;
    }

    bookList.classList.remove('hidden');
    achievementsList.classList.add('hidden');

    // 1. Sort Alphabetically
    const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));

    // 2. Filter based on status
    const filtered = sortedBooks.filter(book => {
        const progress = (book.pagesRead / book.totalPages) * 100;
        if (currentTab === 'read') return progress >= 100;
        if (currentTab === 'in-progress') return progress > 0 && progress < 100;
        if (currentTab === 'unread') return progress === 0;
    });

    if (filtered.length === 0) {
        bookList.innerHTML = `<div class="empty-state">No books in ${currentTab}</div>`;
        return;
    }

    // 3. Create Book Cards
    filtered.forEach(book => {
        const percent = Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100));
        const hasReadPages = book.pagesRead > 1;
        
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="cover-art">
                ${book.cover ? `<img src="${book.cover}" class="cover-art" onerror="this.src=''; this.parentElement.innerText='${book.title[0]}'">` : book.title[0]}
            </div>
            <div class="book-info">
                <div>
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-meta">${book.totalPages} pages</p>
                </div>
                
                ${hasReadPages ? `
                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-percentage">${percent}%</span>
                        <span class="progress-pages">${book.pagesRead} / ${book.totalPages}</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
                ` : `<p class="progress-pages">Not started</p>`}

                <div style="display:flex; gap: 10px; margin-top: 10px;">
                    <button onclick="openModal('${book.id}')" style="background:none; border:none; color:var(--amethyst); font-size:12px; cursor:pointer; font-weight:600;">EDIT</button>
                    <button onclick="deleteBook('${book.id}')" style="background:none; border:none; color:var(--text-muted); font-size:12px; cursor:pointer;">REMOVE</button>
                </div>
            </div>
        `;
        bookList.appendChild(card);
    });
}

// --- Achievement Logic ---

function renderAchievements() {
    const totalRead = books.filter(b => (b.pagesRead / b.totalPages) >= 1).length;
    const totalPagesRead = books.reduce((acc, b) => acc + (parseInt(b.pagesRead) || 0), 0);

    const milestones = [
        { title: "The Spark", desc: "Read your first 100 pages", check: totalPagesRead >= 100 },
        { title: "Volume I", desc: "Read 1,000 total pages", check: totalPagesRead >= 1000 },
        { title: "Volume II", desc: "Read 5,000 total pages", check: totalPagesRead >= 5000 },
        { title: "Novice", desc: "Finish 1 book", check: totalRead >= 1 },
        { title: "Collector", desc: "Have 10 books in your library", check: books.length >= 10 },
        { title: "Scholar", desc: "Finish 5 books", check: totalRead >= 5 }
    ];

    milestones.forEach(m => {
        const div = document.createElement('div');
        div.className = `achievement-card ${m.check ? 'unlocked' : ''}`;
        div.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">${m.check ? '💎' : '🔒'}</div>
            <h4 style="margin-bottom:4px; color: ${m.check ? 'var(--amethyst-light)' : 'var(--text-muted)'}">${m.title}</h4>
            <p style="font-size: 11px; color: var(--text-secondary)">${m.desc}</p>
        `;
        achievementsList.appendChild(div);
    });
}

// Expose functions to global window for HTML onclick attributes
window.switchTab = switchTab;
window.openModal = openModal;
window.editBook = openModal;
window.deleteBook = deleteBook;