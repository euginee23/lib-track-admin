import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getShelves } from "../../../api/settings/get_shelves";

function FilterByShelfLocation({ show, onClose, onSelectShelf, selectedShelfId }) {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localSelectedShelfId, setLocalSelectedShelfId] = useState(selectedShelfId || null);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    const fetchShelves = async () => {
      try {
        const shelvesData = await getShelves();
        const groupedShelves = shelvesData.reduce((acc, location) => {
          const shelfNumber = location.shelf_number;
          if (!acc[shelfNumber]) {
            acc[shelfNumber] = {
              id: shelfNumber,
              name: `Shelf ${shelfNumber}`,
              shelf_number: shelfNumber,
              shelf_id: location.shelf_id,
              locations: [],
              columns: 0,
              rows: 0,
            };
          }
          acc[shelfNumber].locations.push(location);
          return acc;
        }, {});
        Object.values(groupedShelves).forEach((shelf) => {
          const locations = shelf.locations;
          const uniqueColumns = [
            ...new Set(locations.map((loc) => loc.shelf_column)),
          ];
          const uniqueRows = [
            ...new Set(locations.map((loc) => parseInt(loc.shelf_row))),
          ];
          shelf.columns = uniqueColumns.length;
          shelf.rows = Math.max(...uniqueRows);
        });
        setShelves(Object.values(groupedShelves));
      } catch (error) {
        console.error("Error fetching shelves:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShelves();
  }, [show]);

  const handleShelfClick = (shelfId) => {
    setLocalSelectedShelfId(shelfId);
  };

  const handleContinue = () => {
    if (localSelectedShelfId) {
      const selectedShelf = shelves.find(s => s.id === localSelectedShelfId);
      if (selectedShelf) {
        onSelectShelf(selectedShelf);
      }
    }
  };

  return (
    show ? (
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow border-0">
            <div className="modal-header py-2 wmsu-bg-primary text-white">
              <h6 className="modal-title fw-semibold mb-0">
                <i className="bi bi-grid-3x3-gap me-2"></i>
                Filter by Shelf Location
              </h6>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="shelf-location-container" style={{ fontFamily: "Arial, sans-serif" }}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : shelves.length === 0 ? (
                  <div className="text-center text-muted" style={{ minHeight: "200px" }}>
                    No shelves available.
                  </div>
                ) : (
                  <div className="shelves-scroll-container d-flex flex-row gap-4" style={{ overflowX: "auto", paddingBottom: "8px" }}>
                    {shelves.map((shelf, index) => (
                      <div
                        key={shelf.id}
                        className={`shelf-card${localSelectedShelfId === shelf.id ? " selected" : ""}`}
                        style={{
                          minWidth: `${Math.max(300, shelf.columns * 60 + 120)}px`,
                          backgroundColor: localSelectedShelfId === shelf.id ? "#3b82f6" : "#fff",
                          borderRadius: "16px",
                          border: localSelectedShelfId === shelf.id ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
                          boxShadow: localSelectedShelfId === shelf.id ? "0 4px 12px -1px rgba(59,130,246,0.2)" : "0 4px 6px -1px rgba(0,0,0,0.1)",
                          padding: "24px",
                          position: "relative",
                          cursor: "pointer",
                          color: localSelectedShelfId === shelf.id ? "#fff" : "#1e293b",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => handleShelfClick(shelf.id)}
                      >
                        <div className="shelf-header mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h5 className="fw-bold mb-0" style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}></div>
                              {shelf.name}
                            </h5>
                            <span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "500" }}>
                              {shelf.columns}×{shelf.rows}
                            </span>
                          </div>
                        </div>
                        <div className="shelf-details">
                          <span style={{ fontSize: "13px" }}>
                            Shelf ID: {shelf.shelf_id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer py-2 d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-light" onClick={onClose}>
                <i className="bi bi-x-circle me-1"></i> Cancel
              </button>
              {localSelectedShelfId && (
                <button className="btn btn-sm btn-success" onClick={handleContinue}>
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
}

FilterByShelfLocation.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectShelf: PropTypes.func.isRequired,
  selectedShelfId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FilterByShelfLocation;
