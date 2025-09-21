const API_URL = import.meta.env.VITE_API_URL;

export async function addBook(book) {
  const formData = new FormData();
  formData.append('bookTitle', book.title);
  formData.append('bookCover', book.cover);
  formData.append('bookEdition', book.edition);
  formData.append('bookYear', book.year);
  formData.append('bookPrice', book.price);
  formData.append('bookDonor', book.donor);
  formData.append('genre', book.genre);
  formData.append('publisher', book.publisher);
  formData.append('author', book.author);
  formData.append('bookShelfLocId', book.shelfLocationId);
  formData.append('quantity', book.quantity);

  const response = await fetch(`${API_URL}/api/books/add`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`Failed to add book: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
