import React, { useState, useEffect } from "react";
import { FaBook } from "react-icons/fa";
import PropTypes from "prop-types";
import { getShelves } from "../../api/settings/get_shelves";

function SelectShelfLocation({
  selectedColumn = null,
  selectedRow = null,
  selectedShelfId = null,
  onLocationSelect = () => {},
  showModal = false,
  onCloseModal = () => {},
}) {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localSelectedShelfId, setLocalSelectedShelfId] = useState(selectedShelfId);
  const [localSelectedColumn, setLocalSelectedColumn] = useState(selectedColumn);
  const [localSelectedRow, setLocalSelectedRow] = useState(selectedRow);

  useEffect(() => {
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
  }, []);

  const getColumnLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  const isSelected = (shelfId, column, row) => {
    return (
      localSelectedShelfId === shelfId &&
      localSelectedColumn === getColumnLabel(column) &&
      localSelectedRow === row
    );
  };

  const handleCellClick = (shelfId, column, row) => {
    setLocalSelectedShelfId(shelfId);
    setLocalSelectedColumn(column);
    setLocalSelectedRow(row);
  };

  const handleLocationSelect = () => {
    const selectedShelf = shelves.find(s => s.id === localSelectedShelfId);

    if (selectedShelf && localSelectedColumn && localSelectedRow) {
      const selectedLocation = selectedShelf.locations.find(loc => 
        loc.shelf_column === localSelectedColumn && 
        parseInt(loc.shelf_row) === localSelectedRow
      );

      if (selectedLocation) {
        const locationData = {
          book_shelf_loc_id: selectedLocation.shelf_id,
          shelf_number: selectedLocation.shelf_number,
          shelf_column: selectedLocation.shelf_column,
          shelf_row: selectedLocation.shelf_row
        };
        onLocationSelect(locationData);
      }
    }
  };

  return (
    <>
      {showModal && (
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
                  Select Shelf Location
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={onCloseModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="shelf-location-container" style={{ fontFamily: "Arial, sans-serif" }}>
                  {loading ? (
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ minHeight: "200px" }}
                    >
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : shelves.length === 0 ? (
                    <div
                      className="text-center text-muted"
                      style={{ minHeight: "200px" }}
                    >
                      No shelves available.
                    </div>
                  ) : (
                    <>
                      <div
                        className="shelves-scroll-container d-flex flex-row gap-4"
                        style={{ overflowX: "auto", paddingBottom: "8px" }}
                      >
                        {shelves.map((shelf, index) => (
                          <div
                            key={shelf.id}
                            className="shelf-card"
                            style={{
                              minWidth: `${Math.max(
                                400,
                                shelf.columns * 60 + 120
                              )}px`,
                              backgroundColor: "#fff",
                              borderRadius: "16px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                              padding: "24px",
                              position: "relative",
                            }}
                          >
                            <div className="shelf-header mb-3">
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <h5
                                  className="fw-bold mb-0"
                                  style={{
                                    color: "#1e293b",
                                    fontSize: "18px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                                    }}
                                  ></div>
                                  {shelf.name}
                                </h5>
                                <span
                                  style={{
                                    backgroundColor: "#f1f5f9",
                                    color: "#475569",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {shelf.columns}×{shelf.rows}
                                </span>
                              </div>
                            </div>
                            <div className="shelf-grid-container d-flex align-items-center gap-3">
                              <div
                                className="shelf-grid"
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: `repeat(${shelf.columns}, 1fr)`,
                                  gap: "6px",
                                  padding: "16px",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "12px",
                                  border: "1px solid #e2e8f0",
                                  flex: 1,
                                }}
                              >
                                {Array.from({ length: shelf.rows }, (_, rowIndex) =>
                                  Array.from({ length: shelf.columns }, (_, colIndex) => {
                                    const columnLabel = getColumnLabel(colIndex);
                                    const rowLabel = rowIndex + 1;
                                    const selected = isSelected(
                                      shelf.id,
                                      colIndex,
                                      rowLabel
                                    );
                                    return (
                                      <div
                                        key={`${shelf.id}-${columnLabel}-${rowLabel}`}
                                        className={`shelf-cell ${selected ? "selected" : ""}`}
                                        onClick={() =>
                                          handleCellClick(
                                            shelf.id,
                                            columnLabel,
                                            rowLabel
                                          )
                                        }
                                        style={{
                                          gridColumn: colIndex + 1,
                                          gridRow: rowIndex + 1,
                                          width: "50px",
                                          height: "40px",
                                          backgroundColor: selected
                                            ? "#3b82f6"
                                            : "#ffffff",
                                          border: selected
                                            ? "2px solid #1d4ed8"
                                            : "1px solid #d1d5db",
                                          borderRadius: "8px",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                          transition: "all 0.2s ease",
                                          boxShadow: selected
                                            ? "0 4px 6px -1px rgba(59,130,246,0.3)"
                                            : "0 1px 2px 0 rgba(0,0,0,0.05)",
                                          color: selected ? "#ffffff" : "#64748b",
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!selected) {
                                            e.target.style.backgroundColor = "#f1f5f9";
                                            e.target.style.borderColor = "#94a3b8";
                                            e.target.style.transform = "scale(1.05)";
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!selected) {
                                            e.target.style.backgroundColor = "#ffffff";
                                            e.target.style.borderColor = "#d1d5db";
                                            e.target.style.transform = "scale(1)";
                                          }
                                        }}
                                      >
                                        <FaBook size={12} className="mb-1" />
                                        <span
                                          style={{
                                            fontSize: "10px",
                                            fontWeight: "600",
                                          }}
                                        >
                                          {columnLabel}
                                          {rowLabel}
                                        </span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {localSelectedShelfId && localSelectedColumn && localSelectedRow && (
                        <div
                          className="d-flex justify-content-center align-items-center gap-3 mb-3 mt-3"
                        >
                          <div
                            className="card shadow-sm"
                            style={{
                              height: "40px",
                              background: "#f8fafc",
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              padding: "8px 12px",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <span
                              className="fw-bold"
                              style={{ fontSize: "0.9rem", color: "#000000" }}
                            >
                              Selected Shelf Location: {shelves.find((s) => s.id === localSelectedShelfId)?.name || localSelectedShelfId},
                              Column: {localSelectedColumn}, Row: {localSelectedRow}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer py-2 d-flex justify-content-end gap-2">
                <button
                  className="btn btn-sm btn-light"
                  onClick={onCloseModal}
                >
                  <i className="bi bi-x-circle me-1"></i> Cancel
                </button>
                {localSelectedShelfId && localSelectedColumn && localSelectedRow && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleLocationSelect}
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

SelectShelfLocation.propTypes = {
  selectedColumn: PropTypes.string,
  selectedRow: PropTypes.number,
  selectedShelfId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLocationSelect: PropTypes.func,
  showModal: PropTypes.bool,
  onCloseModal: PropTypes.func,
};

export default SelectShelfLocation;
