import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to upload book cover first
async function uploadBookCover(coverFile, batchRegistrationKey) {
  if (!coverFile) return null;

  // Convert base64 data URL to File object if needed
  let fileToUpload = coverFile;
  if (typeof coverFile === 'string' && coverFile.startsWith('data:')) {
    const base64Data = coverFile.split(',')[1];
    const mimeType = coverFile.split(';')[0].split(':')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    fileToUpload = new File([byteArray], 'book-cover.jpg', { type: mimeType });
  }

  const formData = new FormData();
  formData.append('file', fileToUpload); // Changed from 'bookCover' to 'file'
  formData.append('batch_registration_key', batchRegistrationKey);

  const response = await fetch(`${API_URL}/api/uploads/book-cover`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload book cover: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.file.name; // Returns the filename that was saved
}

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
    // Check if book_cover is being updated
    const hasBookCover = updatedFields.book_cover;
    
    // Prepare the update data
    let updateData = { ...updatedFields };
    let uploadedCoverFilename = null;
    
    if (hasBookCover) {
      console.log('Uploading updated book cover for batch:', batchRegistrationKey);
      
      // First upload the book cover
      uploadedCoverFilename = await uploadBookCover(updatedFields.book_cover, batchRegistrationKey);
      console.log('Book cover uploaded successfully:', uploadedCoverFilename);
      
      // Replace the book_cover field with the filename
      updateData = {
        ...updatedFields,
        book_cover: uploadedCoverFilename // Send filename instead of file
      };
      delete updateData.book_cover; // Remove the file, we'll use bookCoverFilename
      updateData.bookCoverFilename = uploadedCoverFilename;
    }

    // Add copy management parameters
    updateData.copiesToRemove = copiesToRemove;
    updateData.copiesToAdd = copiesToAdd;

    console.log('Sending book update data:', updateData);

    // Send JSON update request
    const response = await axios.put(
      `${API_URL}/api/books/${batchRegistrationKey}`,
      updateData
    );

    if (response.status !== 200) {
      throw new Error(`Failed to update books: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error updating books:', error);
    throw error;
  }
};