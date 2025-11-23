import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaArrowUp, FaArrowDown, FaTimes, FaCheckCircle } from "react-icons/fa";
import { getRules } from "../../api/settings/get_rules";
import { addRules } from "../../api/settings/add_rules";
import { updateRule, reorderRule } from "../../api/settings/update_rules";
import { deleteRule } from "../../api/settings/delete_rules";

function RulesAndRegulations() {
  const [rules, setRules] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [heading, setHeading] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newRows, setNewRows] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRules();
      // Flatten the data structure to match existing component structure
      const flattenedRules = [];
      data.forEach((header) => {
        header.rules.forEach((rule) => {
          flattenedRules.push({
            id: rule.id,
            header_id: rule.header_id,
            heading: header.heading,
            title: rule.title,
            content: rule.content,
            sort_order: rule.sort_order,
          });
        });
      });
      setRules(flattenedRules);
    } catch (err) {
      console.error("Error fetching rules:", err);
      setError("Failed to load rules and regulations");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Add a single row locally (used by the + button). Rows are committed together.
  const addRow = () => {
    setNewRows((prev) => [...prev, { id: Date.now(), title: "", content: "" }]);
  };

  const updateRowField = (index, field, value) => {
    setNewRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const removeRow = (index) => {
    setNewRows((prev) => prev.filter((_, i) => i !== index));
  };

  const commitRows = async () => {
    const h = heading.trim() || "General";
    const rowsToAdd = newRows
      .map((r) => ({ title: (r.title || "").trim(), content: (r.content || "").trim() }))
      .filter((r) => r.title && r.content);
    
    if (rowsToAdd.length === 0) return;

    try {
      setLoading(true);
      await addRules(h, rowsToAdd);
      showSuccess("Rules added successfully!");
      await fetchRules(); // Refresh the list
      setNewRows([]);
      setHeading("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding rules:", err);
      setError("Failed to add rules");
    } finally {
      setLoading(false);
    }
  };

  const cancelAddForm = () => {
    setNewRows([]);
    setHeading("");
    setShowAddForm(false);
  };

  const addMoreToHeading = (headingName) => {
    setHeading(headingName);
    setShowAddForm(true);
    setNewRows([]);
    setEditingIndex(-1);
  };

  const saveEdit = async (index) => {
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) return;

    const rule = rules[index];
    try {
      setLoading(true);
      await updateRule(rule.id, {
        title: t,
        content: c,
        heading: heading.trim() || "General",
      });
      showSuccess("Rule updated successfully!");
      await fetchRules();
      setEditingIndex(-1);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error updating rule:", err);
      setError("Failed to update rule");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setTitle(rules[index].title);
    setContent(rules[index].content);
    setHeading(rules[index].heading || 'General');
  };

  const removeRule = async (index) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;

    const rule = rules[index];
    try {
      setLoading(true);
      await deleteRule(rule.id);
      showSuccess("Rule deleted successfully!");
      await fetchRules();
      setEditingIndex(-1);
    } catch (err) {
      console.error("Error deleting rule:", err);
      setError("Failed to delete rule");
    } finally {
      setLoading(false);
    }
  };

  const moveUp = async (index) => {
    if (index <= 0) return;

    const rule = rules[index];
    try {
      setLoading(true);
      await reorderRule(rule.id, "up");
      await fetchRules();
    } catch (err) {
      console.error("Error moving rule:", err);
      setError("Failed to move rule");
    } finally {
      setLoading(false);
    }
  };

  const moveDown = async (index) => {
    if (index >= rules.length - 1) return;

    const rule = rules[index];
    try {
      setLoading(true);
      await reorderRule(rule.id, "down");
      await fetchRules();
    } catch (err) {
      console.error("Error moving rule:", err);
      setError("Failed to move rule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row g-4">
      {/* Success Message */}
      {successMessage && (
        <div className="col-12">
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <FaCheckCircle className="me-2" />
            {successMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMessage(null)}
            ></button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="col-12">
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="col-12">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel - Add/Edit Rules */}
      <div className="col-lg-4">
        <div className="card shadow-sm h-100">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0 fw-bold">
              <FaPlus className="me-2" />
              {editingIndex >= 0 ? 'Edit Rule' : 'Add New Rules'}
            </h6>
          </div>
          <div className="card-body">
            {editingIndex >= 0 ? (
              /* Edit existing rule form */
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">HEADING</label>
                  <input
                    className="form-control"
                    placeholder="e.g., Borrowing Policy, Conduct Rules"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">RULE TITLE</label>
                  <input
                    className="form-control"
                    placeholder="Enter rule title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">DESCRIPTION</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Enter detailed description"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm flex-grow-1"
                    onClick={() => saveEdit(editingIndex)}
                    disabled={!title.trim() || !content.trim()}
                  >
                    <FaSave className="me-1" /> Save Changes
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => { setEditingIndex(-1); setTitle(""); setContent(""); setHeading(""); }}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </>
            ) : showAddForm ? (
              /* Add new rules form */
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">HEADING</label>
                  <input
                    className="form-control"
                    placeholder="e.g., Borrowing Policy, Conduct Rules"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                  />
                  <small className="text-muted">Group related rules under a common heading</small>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-semibold text-muted mb-0">RULES</label>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={addRow}
                    disabled={!heading.trim()}
                  >
                    <FaPlus className="me-1" /> Add Rule
                  </button>
                </div>

                {!heading.trim() && newRows.length === 0 && (
                  <div className="alert alert-info small py-2">
                    Enter a heading first, then click "Add Rule" to add rules under it.
                  </div>
                )}

                <div className="mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {newRows.map((r, idx) => (
                    <div key={r.id} className="card mb-2 border">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-secondary">Rule {idx + 1}</span>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeRow(idx)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <input
                          className="form-control form-control-sm mb-2"
                          placeholder="Rule title"
                          value={r.title}
                          onChange={(e) => updateRowField(idx, 'title', e.target.value)}
                        />
                        <textarea
                          className="form-control form-control-sm"
                          placeholder="Description"
                          rows={2}
                          value={r.content}
                          onChange={(e) => updateRowField(idx, 'content', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {newRows.length > 0 && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm flex-grow-1"
                      onClick={commitRows}
                      disabled={newRows.every(n => !n.title.trim() || !n.content.trim())}
                    >
                      <FaCheckCircle className="me-1" /> Save All Rules
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={cancelAddForm}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Initial state - show add button */
              <div className="text-center py-5">
                <div className="mb-3">
                  <FaPlus size={48} className="text-muted" />
                </div>
                <p className="text-muted mb-3">No rules in progress</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(true)}
                >
                  <FaPlus className="me-2" />
                  Start Adding Rules
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Rules List */}
      <div className="col-lg-8">

        <div className="card shadow-sm h-100">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold text-dark">Current Rules & Regulations</h6>
            <span className="badge bg-primary">{rules.length} {rules.length === 1 ? 'Rule' : 'Rules'}</span>
          </div>
          <div className="card-body" style={{ maxHeight: '700px', overflowY: 'auto' }}>
            {rules.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3">
                  <FaEdit size={48} className="text-muted" />
                </div>
                <h6 className="text-muted">No Rules Added Yet</h6>
                <p className="text-muted small">Start by adding rules using the form on the left</p>
              </div>
            ) : (
              <div>
                {(() => {
                  const grouped = rules.reduce((acc, r, i) => {
                    const key = r.heading || 'General';
                    if (!acc.order.includes(key)) acc.order.push(key);
                    if (!acc.map[key]) acc.map[key] = [];
                    acc.map[key].push({ rule: r, index: i });
                    return acc;
                  }, { order: [], map: {} });

                  return grouped.order.map((headingKey, groupIdx) => (
                    <div key={headingKey} className="mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="flex-grow-1">
                          <h5 className="mb-0 text-primary fw-bold">{headingKey}</h5>
                          <div style={{ height: '2px', backgroundColor: '#0d6efd', width: '60px', marginTop: '4px' }}></div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          title="Add more rules to this heading"
                          onClick={() => addMoreToHeading(headingKey)}
                        >
                          <FaPlus size={12} className="me-1" /> Add More
                        </button>
                        <span className="badge bg-light text-dark">
                          {grouped.map[headingKey].length} {grouped.map[headingKey].length === 1 ? 'rule' : 'rules'}
                        </span>
                      </div>
                      <div className="row g-3">
                        {grouped.map[headingKey].map(({ rule: r, index: idx }) => (
                          <div key={r.id} className="col-12">
                            <div className="card border shadow-sm h-100">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div className="d-flex align-items-start flex-grow-1">
                                    <span className="badge bg-secondary me-2" style={{ marginTop: '2px' }}>
                                      {idx + 1}
                                    </span>
                                    <h6 className="mb-1 fw-bold">{r.title}</h6>
                                  </div>
                                  <div className="btn-group btn-group-sm" role="group">
                                    <button
                                      className="btn btn-outline-secondary"
                                      title="Move up"
                                      onClick={() => moveUp(idx)}
                                      disabled={idx === 0}
                                    >
                                      <FaArrowUp size={10} />
                                    </button>
                                    <button
                                      className="btn btn-outline-secondary"
                                      title="Move down"
                                      onClick={() => moveDown(idx)}
                                      disabled={idx === rules.length - 1}
                                    >
                                      <FaArrowDown size={10} />
                                    </button>
                                    <button
                                      className="btn btn-outline-primary"
                                      title="Edit"
                                      onClick={() => startEdit(idx)}
                                    >
                                      <FaEdit size={10} />
                                    </button>
                                    <button
                                      className="btn btn-outline-danger"
                                      title="Delete"
                                      onClick={() => removeRule(idx)}
                                    >
                                      <FaTrash size={10} />
                                    </button>
                                  </div>
                                </div>
                                <p className="mb-0 text-muted small" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                  {r.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RulesAndRegulations;
