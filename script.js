import { getLibraryStats } from './stats.js';
import { achievements } from './achievementsData.js';

let books = JSON.parse(localStorage.getItem('amethyst_books')) || [];
let currentTab = 'in-progress';

// DOM Elements
const bookList = document.getElementById('book-list');
const achievementsList = document.getElementById('achievements-list');
const statsView = document.getElementById('stats-view');
const statsContent = document.getElementById('stats-content');
const bookForm = document.getElementById('book-form');
const modal = document.getElementById('modal');

render();

// --- Core Functions ---

function save() {
    localStorage.setItem('amethyst_books', JSON.stringify(books));
    render();
}

function render() {
    // Clear all views
    bookList.innerHTML = '';
    achievementsList.innerHTML = '';
    statsContent.innerHTML = '';
    
    // Toggle Visibility
    bookList.classList.add('hidden');
    statsView.classList.add('hidden');
    achievementsList.classList.add('hidden');

    if (currentTab === 'stats') {
        statsView.classList.remove('hidden');
        renderStats();
    } else if (currentTab === 'achievements') {
        achievementsList.classList.remove('hidden');
        renderAchievements();
    } else {
        bookList.classList.remove('hidden');
        renderBooks();
    }
}

function renderBooks() {
    const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));
    const filtered = sortedBooks.filter(book => {
        const percent = (book.pagesRead / book.totalPages) * 100;
        if (currentTab === 'read') return percent >= 100;
        if (currentTab === 'in-progress') return percent > 0 && percent < 100;
        if (currentTab === 'unread') return percent === 0;
    });

    filtered.forEach(book => {
        const percent = Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100));
        const card = document.createElement('div');
        card.className = 'book-card';
        const initials = book.title.substring(0, 2).toUpperCase();

        card.innerHTML = `
            <div class="cover-art">${book.cover ? `<img src="${book.cover}" onerror="this.parentElement.innerText='${initials}'">` : initials}</div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-meta">${book.totalPages} pages</p>
                ${book.pagesRead > 1 ? `
                    <div class="progress-container">
                        <div class="progress-text"><span>${percent}%</span><span>${book.pagesRead}/${book.totalPages}</span></div>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>
                    </div>
                ` : '<p class="text-muted" style="font-size:0.75rem">Not started</p>'}
                <button onclick="editBook('${book.id}')" class="edit-btn">Edit Progress</button>
            </div>
        `;
        bookList.appendChild(card);
    });
}

function renderStats() {
    const data = getLibraryStats(books);
    statsContent.innerHTML = `
        <div class="stat-item"><span>Total Pages Read</span><strong>${data.totalPagesRead}</strong></div>
        <div class="stat-item"><span>Total Books Read</span><strong>${data.totalBooksRead}</strong></div>
        <div class="stat-item"><span>Longest Book</span><strong>${data.longestBookTitle} (${data.longestBookPages}pg)</strong></div>
    `;
}

function renderAchievements() {
    const totalRead = books.filter(b => (b.pagesRead / b.totalPages) >= 1).length;
    const totalPages = books.reduce((acc, b) => acc + (parseInt(b.pagesRead) || 0), 0);
    const longest = books.length > 0 ? Math.max(...books.map(b => b.totalPages)) : 0;

    achievements.forEach(goal => {
        let isUnlocked = false;
        if (goal.type === 'books') isUnlocked = totalRead >= goal.value;
        if (goal.type === 'pages') isUnlocked = totalPages >= goal.value;
        if (goal.type === 'longest') isUnlocked = longest >= goal.value;
        if (goal.type === 'total') isUnlocked = books.length >= goal.value;

        const div = document.createElement('div');
        div.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <div class="ach-icon">${isUnlocked ? '💎' : '🔒'}</div>
            <h4>${goal.title}</h4>
            <p>${goal.desc}</p>
        `;
        achievementsList.appendChild(div);
    });
}

// --- Navigation & Modals ---

window.switchTab = (tab) => {
    currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    render();
};

window.editBook = (id) => {
    const book = books.find(b => b.id === id);
    document.getElementById('modal-title').innerText = "Edit Progress";
    document.getElementById('edit-id').value = book.id;
    document.getElementById('title').value = book.title;
    document.getElementById('cover').value = book.cover;
    document.getElementById('total-pages').value = book.totalPages;
    document.getElementById('pages-read').value = book.pagesRead;
    modal.classList.remove('hidden');
};

bookForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value || Date.now().toString();
    const bookData = {
        id,
        title: document.getElementById('title').value,
        cover: document.getElementById('cover').value,
        totalPages: parseInt(document.getElementById('total-pages').value),
        pagesRead: parseInt(document.getElementById('pages-read').value)
    };

    const index = books.findIndex(b => b.id === id);
    if (index > -1) books[index] = bookData;
    else books.push(bookData);

    save();
    modal.classList.add('hidden');
};

document.getElementById('open-modal').onclick = () => {
    bookForm.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('modal-title').innerText = "Add New Book";
    modal.classList.remove('hidden');
};

document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');