import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch and group book details by batch registration key.
 * @returns {Promise<Array>}
 */
export const getBookDetails = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/books`);
    const books = response.data.data;

    const groupedBooks = books.reduce((acc, book) => {
      const key = `${book.batch_registration_key}`;
      if (!acc[key]) {
        acc[key] = {
          ...book,
          quantity: 0,
          book_numbers: [],
          qr_codes: [],
          copies: [],
          status: book.status,
        };
      }
      acc[key].quantity += 1;
      acc[key].book_numbers.push(book.book_number); 
      acc[key].qr_codes.push(book.book_qr);
      acc[key].copies.push({
        id: book.book_id,
        book_number: book.book_number,
        status: book.status, 
      });
      return acc;
    }, {});

    const groupedBooksArray = Object.values(groupedBooks);
    return groupedBooksArray;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};