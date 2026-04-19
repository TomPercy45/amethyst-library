let books = JSON.parse(localStorage.getItem('amethyst_books')) || [];
let currentTab = 'in-progress';

// DOM Elements
const bookList = document.getElementById('book-list');
const achievementsList = document.getElementById('achievements-list');
const bookForm = document.getElementById('book-form');
const modal = document.getElementById('modal');

// Init
render();

// --- Functions ---

function save() {
    localStorage.setItem('amethyst_books', JSON.stringify(books));
    render();
}

function render() {
    bookList.innerHTML = '';
    achievementsList.innerHTML = '';
    
    // Sort Alphabetically
    const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));

    if (currentTab === 'achievements') {
        renderAchievements();
        return;
    }

    const filtered = sortedBooks.filter(book => {
        const percent = (book.pagesRead / book.totalPages) * 100;
        if (currentTab === 'read') return percent >= 100;
        if (currentTab === 'in-progress') return percent > 0 && percent < 100;
        if (currentTab === 'unread') return percent === 0;
    });

    filtered.forEach(book => {
        const percent = Math.round((book.pagesRead / book.totalPages) * 100);
        const card = document.createElement('div');
        card.className = 'book-card';
        
        // Placeholder Logic
        const coverImg = book.cover ? `<img src="${book.cover}" class="cover-art" onerror="this.style.display='none'">` : '';
        const initials = book.title.substring(0, 2).toUpperCase();

        card.innerHTML = `
            <div class="cover-art">${coverImg || initials}</div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-meta">${book.totalPages} pages</p>
                ${book.pagesRead > 1 ? `
                    <div class="progress-container">
                        <div class="progress-text">
                            <span>${percent}%</span>
                            <span>${book.pagesRead}/${book.totalPages}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                    </div>
                ` : '<p class="text-muted" style="font-size:0.7rem">Not started yet</p>'}
                <button onclick="editBook('${book.id}')" style="margin-top:10px; background:none; border:none; color:#a855f7; font-size:0.8rem; cursor:pointer;">Edit Progress</button>
            </div>
        `;
        bookList.appendChild(card);
    });
}

function renderAchievements() {
    bookList.classList.add('hidden');
    achievementsList.classList.remove('hidden');

    const totalRead = books.filter(b => (b.pagesRead / b.totalPages) >= 1).length;
    const totalPages = books.reduce((acc, b) => acc + parseInt(b.pagesRead), 0);

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

// Event Listeners
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

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if(tab !== 'achievements') {
        bookList.classList.remove('hidden');
        achievementsList.classList.add('hidden');
    }
    render();
}

document.getElementById('open-modal').onclick = () => {
    bookForm.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('modal-title').innerText = "Add New Book";
    modal.classList.remove('hidden');
};

const closeModalFunc = () => modal.classList.add('hidden');
document.getElementById('close-modal').onclick = closeModalFunc;