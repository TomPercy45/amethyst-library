/**
 * stats.js - Logic for Amethyst Library Metrics
 */

export const getLibraryStats = (books) => {
    const readBooks = books.filter(b => (b.pagesRead / b.totalPages) >= 1);
    
    const totalPagesRead = books.reduce((acc, b) => acc + (parseInt(b.pagesRead) || 0), 0);
    const totalBooksRead = readBooks.length;
    
    // Find the longest book by totalPages
    const longestBook = books.length > 0 
        ? books.reduce((prev, current) => (prev.totalPages > current.totalPages) ? prev : current)
        : { title: "N/A", totalPages: 0 };

    return {
        totalPagesRead: totalPagesRead.toLocaleString(),
        totalBooksRead: totalBooksRead,
        longestBookTitle: longestBook.title,
        longestBookPages: longestBook.totalPages
    };
};