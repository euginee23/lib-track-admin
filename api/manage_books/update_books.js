const API_URL = import.meta.env.VITE_API_URL;

/**
 * Update book details by batch registration key.
 * Only updates the provided fields.
 * @param {string} batchRegistrationKey - The batch registration key of the books to update.
 * @param {Object} updatedFields - The fields to update.
 * @param {Array} copiesToRemove - Array of book IDs to mark as removed.
 * @param {number} copiesToAdd - Number of new copies to add.
 * @returns {Promise<Object>} - The response from the server.
 */
export const updateBooks = async (batchRegistrationKey, updatedFields, copiesToRemove = [], copiesToAdd = 0) => {
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

  try {
    // Check if book_cover is being updated (it will be a File object)
    const hasBookCover = updatedFields.book_cover && updatedFields.book_cover instanceof File;
    
    // Create FormData to send all data including the file
    const formData = new FormData();
    
    // Add all updated fields to FormData
    if (updatedFields.book_title !== undefined) {
      formData.append('book_title', updatedFields.book_title);
    }
    if (hasBookCover) {
      formData.append('bookCover', updatedFields.book_cover); // Send the actual file
      console.log('Including book cover file in update:', {
        fileName: updatedFields.book_cover?.name,
        fileSize: updatedFields.book_cover?.size,
        fileType: updatedFields.book_cover?.type
      });
    }
    if (updatedFields.book_edition !== undefined) {
      formData.append('book_edition', updatedFields.book_edition);
    }
    if (updatedFields.book_year !== undefined) {
      formData.append('book_year', updatedFields.book_year);
    }
    if (updatedFields.book_price !== undefined) {
      formData.append('book_price', updatedFields.book_price);
    }
    if (updatedFields.book_donor !== undefined) {
      formData.append('book_donor', updatedFields.book_donor);
    }
    if (updatedFields.genre !== undefined) {
      formData.append('genre', updatedFields.genre);
    }
    if (updatedFields.department !== undefined) {
      formData.append('department', updatedFields.department);
    }
    if (updatedFields.useDepartmentInstead !== undefined) {
      formData.append('useDepartmentInstead', updatedFields.useDepartmentInstead);
    }
    if (updatedFields.publisher !== undefined) {
      formData.append('publisher', updatedFields.publisher);
    }
    if (updatedFields.author !== undefined) {
      formData.append('author', updatedFields.author);
    }
    if (updatedFields.book_shelf_loc_id !== undefined) {
      formData.append('book_shelf_loc_id', updatedFields.book_shelf_loc_id);
    }

    // Add copy management parameters
    formData.append('copiesToRemove', JSON.stringify(copiesToRemove));
    formData.append('copiesToAdd', copiesToAdd);

    console.log('Sending book update data with FormData for batch:', batchRegistrationKey);

    // Send FormData with file directly to the update endpoint
    const response = await fetch(`${API_URL}/api/books/${batchRegistrationKey}`, {
      method: 'PUT',
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
        throw new Error(`Failed to update books: ${response.status} ${response.statusText}`);
      }
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again with a smaller image.');
    }
    
    console.error('Error updating books:', error);
    throw error;
  }
};