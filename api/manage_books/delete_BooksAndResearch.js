import { deleteBooks } from './delete_books';
import { deleteResearch } from './delete_research';

/**
 * Delete both books and research papers.
 * @param {Object} params - The parameters for deletion.
 * @param {string} [params.batchRegistrationKey] - The batch registration key for books.
 * @param {string|number} [params.researchPaperId] - The ID of the research paper.
 * @returns {Promise<Object>} - The combined response from the server.
 */
export const deleteBooksAndResearch = async ({ batchRegistrationKey, researchPaperId }) => {
  const results = {};

  if (batchRegistrationKey) {
    try {
      results.books = await deleteBooks(batchRegistrationKey);
    } catch (error) {
      console.error('Error deleting books:', error);
      results.books = { success: false, error: error.message };
    }
  }

  if (researchPaperId) {
    try {
      results.research = await deleteResearch(researchPaperId);
    } catch (error) {
      console.error('Error deleting research paper:', error);
      results.research = { success: false, error: error.message };
    }
  }

  return results;
};