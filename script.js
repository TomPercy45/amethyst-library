let books = JSON.parse(localStorage.getItem('amethyst_books')) || [];
let currentTab = 'in-progress';

// DOM Elements
const bookList = document.getElementById('book-list');
const achievementsList = document.getElementById('achievements-list');
// Ensure this exists in your index.html or create it dynamically below
let statsList = document.getElementById('stats-list'); 

const bookForm = document.getElementById('book-form');
const modal = document.getElementById('modal');

// Init
render();

// --- Functions ---

function save() {
    localStorage.setItem('amethyst_books', JSON.stringify(books));
    render();
}

/**
 * Main render engine that handles switching between 
 * Books, Achievements, and Stats views.
 */
function render() {
    // 1. Clear all containers
    bookList.innerHTML = '';
    achievementsList.innerHTML = '';
    if (statsList) statsList.innerHTML = '';

    // 2. Sorting Logic (Always alphabetical)
    const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));

    // 3. Tab Logic
    if (currentTab === 'achievements') {
        renderAchievements();
        return;
    }

    if (currentTab === 'stats') {
        renderStats();
        return;
    }

    // 4. Book Rendering Logic
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
        
        // Placeholder Logic
        const coverImg = book.cover ? `<img src="${book.cover}" class="cover-art" onerror="this.style.display='none'">` : '';
        const initials = book.title.substring(0, 2).toUpperCase();

        card.innerHTML = `
            <div class="cover-art">${coverImg || initials}</div>
            <div class="book-info">
                <div>
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-meta">${book.totalPages} pages</p>
                </div>
                
                ${book.pagesRead > 1 ? `
                    <div class="progress-container">
                        <div class="progress-text">
                            <span>${percent}%</span>
                            <span>${book.pagesRead} / ${book.totalPages}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                    </div>
                ` : '<p style="color: #94a3b8; font-size: 0.75rem;">Not started yet</p>'}
                <button onclick="editBook('${book.id}')" style="margin-top:10px; background:none; border:none; color:#a855f7; font-size:0.8rem; cursor:pointer; font-weight:600; text-align:left;">EDIT PROGRESS</button>
            </div>
        `;
        bookList.appendChild(card);
    });
}

/**
 * Calculates and displays the 3 specific metrics:
 * Total Pages, Total Books Read, and Longest Book Read.
 */
function renderStats() {
    bookList.classList.add('hidden');
    achievementsList.classList.add('hidden');
    
    // Fallback if the container is missing in HTML
    if (!statsList) {
        statsList = document.createElement('section');
        statsList.id = 'stats-list';
        document.querySelector('.app-container').insertBefore(statsList, achievementsList);
    }
    statsList.classList.remove('hidden');

    // Calculations
    const totalPagesRead = books.reduce((acc, b) => acc + (parseInt(b.pagesRead) || 0), 0);
    const completedBooks = books.filter(b => (b.pagesRead / b.totalPages) >= 1);
    
    // Longest book by page count among books that have been read/completed
    const longestReadBook = completedBooks.length > 0 
        ? completedBooks.reduce((prev, curr) => (prev.totalPages > curr.totalPages) ? prev : curr)
        : null;

    const stats = [
        { label: "Total Pages Read", value: totalPagesRead.toLocaleString() },
        { label: "Total Books Read", value: completedBooks.length },
        { label: "Longest Book Finished", value: longestReadBook ? `${longestReadBook.title} (${longestReadBook.totalPages} pages)` : "None yet" }
    ];

    stats.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'achievement-card unlocked'; // Reusing existing CSS styles
        div.innerHTML = `
            <p style="color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">${stat.label}</p>
            <h3 style="color: #f8fafc; font-size: 1.2rem; margin-top: 5px;">${stat.value}</h3>
        `;
        statsList.appendChild(div);
    });
}

function renderAchievements() {
    bookList.classList.add('hidden');
    if (statsList) statsList.classList.add('hidden');
    achievementsList.classList.remove('hidden');

    const totalRead = books.filter(b => (b.pagesRead / b.totalPages) >= 1).length;
    const totalPages = books.reduce((acc, b) => acc + (parseInt(b.pagesRead) || 0), 0);

    const goals = [
        { title: "First Word", desc: "Add your first book", check: books.length > 0 },
        { title: "Finisher", desc: "Complete 1 book", check: totalRead >= 1 },
        { title: "Bookworm", desc: "Complete 5 books", check: totalRead >= 5 },
        { title: "Volume I", desc: "Read 1,000 total pages", check: totalPages >= 1000 },
        { title: "Librarian", desc: "Have 10 books in your collection", check: books.length >= 10 }
    ];

    goals.forEach(goal => {
        const div = document.createElement('div');
        div.className = `achievement-card ${goal.check ? 'unlocked' : ''}`;
        div.innerHTML = `
            <h4 style="color: ${goal.check ? '#a855f7' : '#64748b'}">${goal.title} ${goal.check ? '✅' : '🔒'}</h4>
            <p style="font-size:0.8rem; color:#94a3b8">${goal.desc}</p>
        `;
        achievementsList.appendChild(div);
    });
}

// --- Navigation & Event Handlers ---

function switchTab(tab) {
    currentTab = tab;
    
    // Update UI active states
    document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
    
    // If called via click event
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Toggle container visibilities
    if (tab === 'achievements') {
        bookList.classList.add('hidden');
        if (statsList) statsList.classList.add('hidden');
        achievementsList.classList.remove('hidden');
    } else if (tab === 'stats') {
        bookList.classList.add('hidden');
        achievementsList.classList.add('hidden');
        if (statsList) statsList.classList.remove('hidden');
    } else {
        bookList.classList.remove('hidden');
        achievementsList.classList.add('hidden');
        if (statsList) statsList.classList.add('hidden');
    }
    
    render();
}

bookForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value || Date.now().toString();
    const newBook = {
        id,
        title: document.getElementById('title').value,
        cover: document.getElementById('cover').value,
        totalPages: parseInt(document.getElementById('total-pages').value),
        pagesRead: parseInt(document.getElementById('pages-read').value)
    };

    const index = books.findIndex(b => b.id === id);
    if (index > -1) books[index] = newBook;
    else books.push(newBook);

    save();
    closeModalFunc();
};

function editBook(id) {
    const book = books.find(b => b.id === id);
    document.getElementById('modal-title').innerText = "Edit Progress";
    document.getElementById('edit-id').value = book.id;
    document.getElementById('title').value = book.title;
    document.getElementById('cover').value = book.cover;
    document.getElementById('total-pages').value = book.totalPages;
    document.getElementById('pages-read').value = book.pagesRead;
    modal.classList.remove('hidden');
}

function closeModalFunc() {
    modal.classList.add('hidden');
}

document.getElementById('open-modal').onclick = () => {
    bookForm.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('modal-title').innerText = "Add New Book";
    modal.classList.remove('hidden');
};

document.getElementById('close-modal').onclick = closeModalFunc;

// Expose switchTab and editBook to global scope for HTML onclicks
window.switchTab = switchTab;
window.editBook = editBook;