import axios from 'axios';

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
  try {
    // Check if book_cover is being updated (it would be a base64 data URL or File)
    const hasBookCover = updatedFields.book_cover;
    
    let response;
    
    if (hasBookCover) {
      // Use FormData for file upload
      const formData = new FormData();
      
      // Add all other fields to FormData
      Object.keys(updatedFields).forEach(key => {
        if (key === 'book_cover') {
          // Convert base64 data URL back to File object
          if (typeof updatedFields[key] === 'string' && updatedFields[key].startsWith('data:')) {
            const base64Data = updatedFields[key].split(',')[1];
            const mimeType = updatedFields[key].split(';')[0].split(':')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const file = new File([byteArray], 'book-cover.jpg', { type: mimeType });
            formData.append('bookCover', file);
          } else {
            formData.append('bookCover', updatedFields[key]);
          }
        } else {
          formData.append(key, updatedFields[key]);
        }
      });
      
      // Add additional parameters
      if (copiesToRemove.length > 0) {
        formData.append('copiesToRemove', JSON.stringify(copiesToRemove));
      }
      if (copiesToAdd > 0) {
        formData.append('copiesToAdd', copiesToAdd);
      }
      
      response = await fetch(`${API_URL}/api/books/${batchRegistrationKey}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to update books: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } else {
      // Use JSON payload for regular updates without file upload
      const payload = {
        ...updatedFields,
        copiesToRemove,
        copiesToAdd,
      };

      response = await axios.put(
        `${API_URL}/api/books/${batchRegistrationKey}`,
        payload
      );

      if (response.status !== 200) {
        throw new Error(`Failed to update books: ${response.status} ${response.statusText}`);
      }

      return response.data;
    }
  } catch (error) {
    console.error('Error updating books:', error);
    throw error;
  }
};