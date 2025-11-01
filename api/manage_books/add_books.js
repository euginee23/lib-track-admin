const API_URL = import.meta.env.VITE_API_URL;

export async function addBook(book) {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

  try {
    // Generate a batch registration key matching the original format: 0x + random string
    const tempBatchKey = `0x${Math.random().toString(36).substring(2, 10)}`;

    // Create FormData and send book cover file directly to books API
    const formData = new FormData();
    formData.append('bookTitle', book.title);
    formData.append('bookCover', book.cover); // Send the actual file
    formData.append('bookEdition', book.edition || '');
    formData.append('bookYear', book.year || '');
    formData.append('bookPrice', book.price || '');
    formData.append('bookDonor', book.donor || '');
    formData.append('genre', book.genre || '');
    formData.append('department', book.department || '');
    formData.append('useDepartmentInstead', book.useDepartmentInstead);
    formData.append('publisher', book.publisher);
    formData.append('publishers', JSON.stringify(book.publishers || []));
    formData.append('author', book.author);
    formData.append('authors', JSON.stringify(book.authors || []));
    formData.append('bookShelfLocId', book.shelfLocationId);
    formData.append('quantity', book.quantity);
    formData.append('batchRegistrationKey', tempBatchKey);

    console.log('Sending book data with file to server:', {
      fileName: book.cover?.name,
      fileSize: book.cover?.size,
      fileType: book.cover?.type,
      batchKey: tempBatchKey
    });

    const response = await fetch(`${API_URL}/api/books/add`, {
      method: 'POST',
      body: formData, // Send FormData with file
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unknown server error';
      }
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      if (response.status === 413) {
        throw new Error('Image file is too large. Please use a smaller image.');
      } else if (response.status === 500) {
        throw new Error('Server error occurred. Please try again.');
      } else {
        throw new Error(`Failed to add book: ${response.status} ${response.statusText}`);
      }
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again with a smaller image.');
    }
    
    console.error('Network Error:', error);
    throw error;
  }
}
