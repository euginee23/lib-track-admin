import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchBooksAndResearch = async () => {
  try {
    const booksResponse = await axios.get(`${API_URL}/api/books`);
    const researchResponse = await axios.get(`${API_URL}/api/research-papers`);

    const books = booksResponse.data.data.map((book) => ({
      ...book,
      type: 'Book',
    }));

    const groupedBooks = books.reduce((acc, book) => {
      const key = `${book.batch_registration_key}`;
      if (!acc[key]) {
        acc[key] = {
          ...book,
          quantity: 0, 
        };
      }
      if (book.status !== 'Removed') {
        acc[key].quantity += 1;
      }
      return acc;
    }, {});

    const groupedBooksArray = Object.values(groupedBooks);

    const researchPapers = researchResponse.data.data.map((research) => ({
      ...research,
      type: 'Research Paper',
    }));

    const mergedData = [...groupedBooksArray, ...researchPapers];

    mergedData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return mergedData;
  } catch (error) {
    console.error('Error fetching books and research papers:', error);
    throw error;
  }
};