import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch } from 'react-icons/fa';
import ToastNotification from './ToastNotification';
import { getFaqs } from '../../api/settings/get_faq';
import { addFaq } from '../../api/settings/add_faq';
import { updateFaq } from '../../api/settings/update_faq';
import { deleteFaq } from '../../api/settings/delete_faq';

function ChatbotFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', isActive: true });
  const [editingFaq, setEditingFaq] = useState({ question: '', answer: '', isActive: true });

  // Normalize FAQ object received from API so UI uses camelCase `isActive`
  const normalizeFaq = (raw) => {
    if (!raw) return raw;
    const faq = { ...raw };
    // API returns `is_active` (0/1) while UI expects `isActive` boolean
    if (faq.isActive === undefined) {
      if (faq.is_active !== undefined) {
        faq.isActive = faq.is_active === 1 || faq.is_active === true || faq.is_active === '1';
      } else {
        faq.isActive = false;
      }
    }
    return faq;
  };

  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getFaqs();
        if (!mounted) return;
        setFaqs(Array.isArray(data) ? data.map(normalizeFaq) : []);
      } catch (err) {
        console.error('Failed to load FAQs', err);
        if (mounted) setError(err.message || 'Failed to load FAQs');
        ToastNotification.error('Failed to load FAQs');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewFaq({ question: '', answer: '', isActive: true });
  };

  const handleSaveNew = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      ToastNotification.error('Please fill in both question and answer');
      return;
    }
    setIsSaving(true);
    try {
      const created = await addFaq({ question: newFaq.question.trim(), answer: newFaq.answer.trim(), is_active: newFaq.isActive ? 1 : 0, sort_order: 0 });
      setFaqs(prev => [...prev, normalizeFaq(created)]);
      setIsAddingNew(false);
      setNewFaq({ question: '', answer: '', isActive: true });
      ToastNotification.success('FAQ added successfully');
    } catch (err) {
      console.error('Add FAQ failed', err);
      ToastNotification.error('Failed to add FAQ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewFaq({ question: '', answer: '', isActive: true });
  };

  const handleEdit = (faq) => {
    setEditingId(faq.id);
    setEditingFaq({ question: faq.question, answer: faq.answer, isActive: faq.isActive });
  };

  const handleSaveEdit = () => {
    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      ToastNotification.error('Please fill in both question and answer');
      return;
    }
    (async () => {
      setIsSaving(true);
      try {
        const updated = await updateFaq(editingId, { question: editingFaq.question.trim(), answer: editingFaq.answer.trim(), is_active: editingFaq.isActive ? 1 : 0 });
        setFaqs(prev => prev.map(f => f.id === editingId ? normalizeFaq(updated) : f));
        setEditingId(null);
        setEditingFaq({ question: '', answer: '', isActive: true });
        ToastNotification.success('FAQ updated successfully');
      } catch (err) {
        console.error('Update FAQ failed', err);
        ToastNotification.error('Failed to update FAQ');
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingFaq({ question: '', answer: '', isActive: true });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    (async () => {
      setIsSaving(true);
      try {
        await deleteFaq(id);
        setFaqs(prev => prev.filter(faq => faq.id !== id));
        ToastNotification.success('FAQ deleted successfully');
      } catch (err) {
        console.error('Delete FAQ failed', err);
        ToastNotification.error('Failed to delete FAQ');
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const toggleStatus = (id) => {
    (async () => {
      setIsSaving(true);
      try {
        const faq = faqs.find(f => f.id === id);
        if (!faq) throw new Error('FAQ not found');
        const updated = await updateFaq(id, { is_active: faq.isActive ? 0 : 1 });
        setFaqs(prev => prev.map(f => f.id === id ? normalizeFaq(updated) : f));
        ToastNotification.success('FAQ status updated');
      } catch (err) {
        console.error('Toggle status failed', err);
        ToastNotification.error('Failed to update status');
      } finally {
        setIsSaving(false);
      }
    })();
  };

  return (
    <div className="row g-4">
      {/* Header Section */}
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <FaQuestionCircle className="me-2" />
              <h5 className="mb-0 fw-bold">Chatbot FAQs Management</h5>
            </div>
            <button 
              className="btn btn-light btn-sm"
              onClick={handleAddNew}
              disabled={isAddingNew}
            >
              <FaPlus className="me-2" />
              Add New FAQ
            </button>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="text-muted">
                  Total FAQs: {faqs.length} | Active: {faqs.filter(f => f.isActive).length}
                </div>
              </div>
            </div>

            {/* Add New FAQ Form */}
            {isAddingNew && (
              <div className="card border-success mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0 text-success">Add New FAQ</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Question</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Enter the frequently asked question..."
                      value={newFaq.question}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Answer</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Enter the answer to the question..."
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="newFaqActive"
                        checked={newFaq.isActive}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="newFaqActive">
                        Active (visible to users)
                      </label>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-success" onClick={handleSaveNew}>
                      <FaSave className="me-2" />
                      Save FAQ
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancelNew}>
                      <FaTimes className="me-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQs List */}
            <div className="row g-3">
              {loading ? (
                <div className="col-12 text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading FAQs...</p>
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="col-12">
                  <div className="text-center py-5">
                    <FaQuestionCircle size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">
                      {searchTerm ? 'No FAQs match your search' : 'No FAQs created yet'}
                    </h6>
                    {!searchTerm && !isAddingNew && (
                      <button className="btn btn-primary mt-3" onClick={handleAddNew}>
                        <FaPlus className="me-2" />
                        Create Your First FAQ
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="col-12">
                    {editingId === faq.id ? (
                      // Edit Mode
                      <div className="card border-warning">
                        <div className="card-header bg-light">
                          <h6 className="mb-0 text-warning">Editing FAQ #{faq.id}</h6>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label fw-bold">Question</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={editingFaq.question}
                              onChange={(e) => setEditingFaq(prev => ({ ...prev, question: e.target.value }))}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Answer</label>
                            <textarea
                              className="form-control"
                              rows="4"
                              value={editingFaq.answer}
                              onChange={(e) => setEditingFaq(prev => ({ ...prev, answer: e.target.value }))}
                            />
                          </div>
                          <div className="mb-3">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`editFaqActive${faq.id}`}
                                checked={editingFaq.isActive}
                                onChange={(e) => setEditingFaq(prev => ({ ...prev, isActive: e.target.checked }))}
                              />
                              <label className="form-check-label" htmlFor={`editFaqActive${faq.id}`}>
                                Active (visible to users)
                              </label>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-success" onClick={handleSaveEdit}>
                              <FaSave className="me-2" />
                              Save Changes
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancelEdit}>
                              <FaTimes className="me-2" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className={`card ${faq.isActive ? 'border-success' : 'border-secondary'}`}>
                        <div className="card-header d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <span className={`badge ${faq.isActive ? 'bg-success' : 'bg-secondary'} me-3`}>
                              {faq.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <h6 className="mb-0">FAQ #{faq.id}</h6>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() => toggleStatus(faq.id)}
                              title={faq.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {faq.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleEdit(faq)}
                              disabled={editingId !== null || isAddingNew}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(faq.id)}
                              disabled={editingId !== null || isAddingNew}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <h6 className="text-primary mb-2">Question:</h6>
                            <p className="mb-0">{faq.question}</p>
                          </div>
                          <div>
                            <h6 className="text-success mb-2">Answer:</h6>
                            <p className="mb-0">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotFAQs;