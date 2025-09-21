import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaBook } from "react-icons/fa";
import PropTypes from "prop-types";
import { addShelf as addShelfAPI } from "../../api/settings/add_shelves";
import { getShelves } from "../../api/settings/get_shelves";
import { deleteShelf } from "../../api/settings/delete_shelf";
import { addRows } from "../../api/settings/add_rows";
import { addColumns } from "../../api/settings/add_columns";
import { removeRows } from "../../api/settings/remove_rows";
import { removeColumns } from "../../api/settings/remove_columns";

function ManageShelfLocation({
  selectedColumn = null,
  selectedRow = null,
  selectedShelfId = null,
  onLocationSelect = () => {},
  predefinedShelves = [],
}) {
  const [shelves, setShelves] = useState(predefinedShelves);
  const [deletionMode, setDeletionMode] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [editingShelf, setEditingShelf] = useState(null);
  const [tempShelfData, setTempShelfData] = useState(null);

  useEffect(() => {
    setLoading(true); // Show spinner while fetching shelves
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    setLoading(true);
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

      const uniqueShelves = Object.values(groupedShelves);

      setShelves(uniqueShelves);
    } catch (error) {
      console.error("Error fetching shelves:", error);
    } finally {
      setLoading(false); // Hide spinner after fetching shelves
    }
  };

  const addShelf = async () => {
    setLoading(true); // Show spinner while adding shelf
    // Find the highest shelf number and add 1
    const maxShelfNumber =
      shelves.length > 0
        ? Math.max(...shelves.map((shelf) => shelf.shelf_number))
        : 0;

    const newShelf = {
      shelf_number: maxShelfNumber + 1,
      shelf_column: "A",
      shelf_row: 1,
    };

    try {
      const data = await addShelfAPI(newShelf);

      if (data.success) {
        fetchShelves();
      } else {
        console.error("Failed to add shelf:", data.message);
      }
    } catch (error) {
      console.error("Error adding shelf:", error);
    } finally {
      setLoading(false); // Hide spinner after adding shelf
    }
  };

  const removeShelf = async (shelfId) => {
    setLoading(true); // Show spinner while removing shelf
    try {
      const shelf = shelves.find((s) => s.id === shelfId); 
      if (!shelf) {
        console.error("Shelf not found with ID:", shelfId);
        return;
      }

      await deleteShelf(shelf.shelf_number);
      setShelves((prev) => prev.filter((s) => s.id !== shelfId));
      setDeletionMode(false);
    } catch (error) {
      console.error("Error deleting shelf:", error);
    } finally {
      setLoading(false); // Hide spinner after removing shelf
    }
  };

  const toggleDeletionMode = () => {
    setDeletionMode(!deletionMode);
  };

  const startEditing = (shelf) => {
    setEditingShelf(shelf.id);
    setTempShelfData({ ...shelf });
  };

  const cancelEditing = () => {
    setEditingShelf(null);
    setTempShelfData(null);
  };

  const saveChanges = () => {
    if (tempShelfData) {
      setShelves((prev) =>
        prev.map((shelf) =>
          shelf.id === tempShelfData.id ? tempShelfData : shelf
        )
      );
      setEditingShelf(null);
      setTempShelfData(null);
    }
  };

  const handleCellClick = (shelfId, column, row) => {
    onLocationSelect(shelfId, column, row);
  };

  const addRow = async (shelfId) => {
    setLoading(true); // Show spinner while adding row
    try {
      const shelf = shelves.find((s) => s.id === shelfId);
      if (!shelf) {
        console.error("Shelf not found with ID:", shelfId);
        return;
      }

      const updatedRows = shelf.rows + 1;
      await addRows(shelf.shelf_id, updatedRows);
      fetchShelves();
    } catch (error) {
      console.error("Error adding row:", error);
    } finally {
      setLoading(false); // Hide spinner after adding row
    }
  };

  const removeRow = async (shelfId) => {
    setLoading(true); // Show spinner while removing row
    try {
      const shelf = shelves.find((s) => s.id === shelfId);
      if (!shelf || shelf.rows <= 1) {
        console.error("Cannot remove row. Shelf not found or minimum rows reached.");
        return;
      }

      const updatedRows = shelf.rows - 1;
      await removeRows(shelf.shelf_id, updatedRows);
      fetchShelves();
    } catch (error) {
      console.error("Error removing row:", error);
    } finally {
      setLoading(false); // Hide spinner after removing row
    }
  };

  const addColumn = async (shelfId) => {
    setLoading(true); // Show spinner while adding column
    try {
      const shelf = shelves.find((s) => s.id === shelfId);
      if (!shelf) {
        console.error("Shelf not found with ID:", shelfId);
        return;
      }

      const updatedColumns = shelf.columns + 1;
      await addColumns(shelf.shelf_id, updatedColumns);
      fetchShelves();
    } catch (error) {
      console.error("Error adding column:", error);
    } finally {
      setLoading(false); // Hide spinner after adding column
    }
  };

  const removeColumn = async (shelfId) => {
    setLoading(true); // Show spinner while removing column
    try {
      const shelf = shelves.find((s) => s.id === shelfId);
      if (!shelf || shelf.columns <= 1) {
        console.error("Cannot remove column. Shelf not found or minimum columns reached.");
        return;
      }

      const updatedColumns = shelf.columns - 1;
      await removeColumns(shelf.shelf_id, updatedColumns);
      fetchShelves();
    } catch (error) {
      console.error("Error removing column:", error);
    } finally {
      setLoading(false); // Hide spinner after removing column
    }
  };

  const getColumnLabel = (index) => {
    return String.fromCharCode(65 + index);
  };

  const isSelected = (shelfId, column, row) => {
    return (
      selectedShelfId === shelfId &&
      selectedColumn === getColumnLabel(column) &&
      selectedRow === row
    );
  };

  return (
    <div
      className="shelf-location-container"
      style={{ fontFamily: "Inter, Arial, sans-serif", maxWidth: "100%" }}
    >
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "300px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : shelves.length === 0 ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "300px" }}
        >
          <div
            className="add-shelf-placeholder"
            style={{
              width: "280px",
              height: "200px",
              border: "3px dashed #cbd5e1",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              color: "#64748b",
              backgroundColor: "#f8fafc",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.color = "#3b82f6";
              e.target.style.backgroundColor = "#eff6ff";
              e.target.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#cbd5e1";
              e.target.style.color = "#64748b";
              e.target.style.backgroundColor = "#f8fafc";
              e.target.style.transform = "scale(1)";
            }}
            onClick={addShelf}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <FaPlus size={24} />
            </div>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "600",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              Create Your First Shelf
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              Start organizing your library
            </span>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column">
          {/* Header Card - matching ManageBooks layout */}
          <div className="card mb-3 p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <h4
                className="fw-bold text-dark mb-0"
                style={{ fontSize: "16px" }}
              >
                Organize and configure shelf locations in the library.
              </h4>
              <div className="d-flex gap-2">
                <button
                  className={`btn btn-sm d-flex align-items-center gap-1 ${
                    deletionMode ? "btn-secondary" : "btn-danger"
                  }`}
                  onClick={toggleDeletionMode}
                >
                  <FaMinus size={12} />
                  {deletionMode ? "Cancel" : "Remove"}
                </button>
                <button
                  className="btn btn-sm btn-success d-flex align-items-center gap-1"
                  onClick={addShelf}
                >
                  <FaPlus size={12} />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Card - matching ManageBooks table layout */}
          <div
            className="card shadow-sm p-2 flex-grow-1 d-flex flex-column"
            style={{ minHeight: "0", overflow: "hidden" }}
          >
            <div
              className="table-responsive flex-grow-1"
              style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
            >
              <div
                className="shelves-grid-layout"
                style={{
                  display: "flex", 
                  flexWrap: "nowrap", 
                  gap: "24px",
                  padding: "16px",
                  overflowX: "auto", 
                  overflowY: "hidden",
                }}
              >
                {shelves.map((shelf, index) => {
                  const isEditing = editingShelf === shelf.id;
                  const displayShelf = isEditing ? tempShelfData : shelf;

                  return (
                    <div
                      key={shelf.id}
                      className="shelf-card"
                      style={{
                        minWidth: `${Math.max(
                          400,
                          displayShelf.columns * 60 + 120
                        )}px`,
                        backgroundColor: deletionMode ? "#fee2e2" : "#ffffff",
                        borderRadius: "16px",
                        border: deletionMode
                          ? "2px solid #ef4444"
                          : isEditing
                          ? "2px solid #3b82f6"
                          : "1px solid #e2e8f0",
                        boxShadow: deletionMode
                          ? "0 10px 15px -1px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1)"
                          : isEditing
                          ? "0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)"
                          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        padding: "24px",
                        transition: "all 0.3s ease",
                        cursor: deletionMode ? "pointer" : "default",
                        position: "relative",
                      }}
                      onClick={
                        deletionMode ? () => removeShelf(shelf.id) : undefined
                      }
                    >
                      {/* Deletion overlay */}
                      {deletionMode && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "rgba(239, 68, 68, 0.95)",
                            color: "white",
                            padding: "12px 20px",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "14px",
                            pointerEvents: "none",
                            zIndex: 10,
                          }}
                        >
                          Click to Delete
                        </div>
                      )}

                      <div className="shelf-header mb-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5
                            className="fw-bold mb-0"
                            style={{
                              color: deletionMode ? "#dc2626" : "#1e293b",
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
                                backgroundColor: deletionMode
                                  ? "#dc2626"
                                  : `hsl(${index * 60}, 70%, 60%)`,
                              }}
                            ></div>
                            {displayShelf.name}
                          </h5>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              style={{
                                backgroundColor: deletionMode
                                  ? "#fca5a5"
                                  : isEditing
                                  ? "#dbeafe"
                                  : "#f1f5f9",
                                color: deletionMode
                                  ? "#7f1d1d"
                                  : isEditing
                                  ? "#1e40af"
                                  : "#475569",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                            >
                              {displayShelf.columns}×{displayShelf.rows}
                            </span>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="d-flex justify-content-end gap-2 mb-3">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={cancelEditing}
                              style={{ fontSize: "12px", padding: "4px 12px" }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={saveChanges}
                              style={{ fontSize: "12px", padding: "4px 12px" }}
                            >
                              Save
                            </button>
                          </div>
                        )}

                        {/* Column Controls - Always show add/remove buttons */}
                        <div className="controls-row d-flex justify-content-center mb-3">
                          <div className="control-group d-flex flex-column align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => removeColumn(shelf.id)}
                                disabled={displayShelf.columns <= 1}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  border: "1px solid #d1d5db",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                }}
                              >
                                <FaMinus size={10} />
                              </button>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontWeight: "600",
                                  margin: "8px 0",
                                  textOrientation: "mixed",
                                  textAlign: "center",
                                }}
                              >
                                COLUMNS: {displayShelf.columns}
                              </span>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => addColumn(shelf.id)}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  border: "1px solid #d1d5db",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                }}
                              >
                                <FaPlus size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shelf Grid Container with Row Controls */}
                      {!deletionMode && (
                        <div className="shelf-grid-container d-flex align-items-center gap-3">
                          {/* Left side - Row controls - Always show add/remove buttons */}
                          <div className="d-flex flex-column align-items-center">
                            <button
                              className="btn btn-outline-secondary mb-2"
                              onClick={() => removeRow(shelf.id)}
                              disabled={displayShelf.rows <= 1}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                              }}
                            >
                              <FaMinus size={10} />
                            </button>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: "600",
                                margin: "8px 0",
                                writingMode: "vertical-rl",
                                textOrientation: "mixed",
                                textAlign: "center",
                              }}
                            >
                              ROWS: {displayShelf.rows}
                            </div>
                            <button
                              className="btn btn-outline-secondary mt-2"
                              onClick={() => addRow(shelf.id)}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                              }}
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>

                          {/* Shelf Grid */}
                          <div
                            className="shelf-grid"
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${displayShelf.columns}, 1fr)`,
                              gap: "6px",
                              padding: "16px",
                              backgroundColor: "#f8fafc",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              flex: 1,
                            }}
                          >
                            {Array.from(
                              { length: displayShelf.rows },
                              (_, rowIndex) =>
                                Array.from(
                                  { length: displayShelf.columns },
                                  (_, colIndex) => {
                                    const columnLabel =
                                      getColumnLabel(colIndex);
                                    const rowLabel = rowIndex + 1;
                                    const selected = isSelected(
                                      shelf.id,
                                      colIndex,
                                      rowLabel
                                    );

                                    return (
                                      <div
                                        key={`${shelf.id}-${columnLabel}-${rowLabel}`}
                                        className={`shelf-cell ${
                                          selected ? "selected" : ""
                                        }`}
                                        onClick={() =>
                                          handleCellClick(
                                            shelf.id,
                                            columnLabel,
                                            rowLabel
                                          )
                                        }
                                        style={{
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
                                            ? "0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                                            : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                          color: selected
                                            ? "#ffffff"
                                            : "#64748b",
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!selected) {
                                            e.target.style.backgroundColor =
                                              "#f1f5f9";
                                            e.target.style.borderColor =
                                              "#94a3b8";
                                            e.target.style.transform =
                                              "scale(1.05)";
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!selected) {
                                            e.target.style.backgroundColor =
                                              "#ffffff";
                                            e.target.style.borderColor =
                                              "#d1d5db";
                                            e.target.style.transform =
                                              "scale(1)";
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
                                  }
                                )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom section - Selected Location Display */}
            {selectedShelfId && selectedColumn && selectedRow && (
              <div className="d-flex justify-content-between align-items-center mt-3 p-3 border-top">
                <div
                  className="selected-location-badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <FaBook size={14} />
                  <span>
                    Selected:{" "}
                    {shelves.find((s) => s.id === selectedShelfId)?.name} -{" "}
                    {selectedColumn}
                    {selectedRow}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx="true">{`
        .shelves-scroll-container::-webkit-scrollbar {
          height: 8px;
        }

        .shelves-scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .shelves-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .shelves-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .shelf-cell:hover {
          transform: scale(1.05);
        }

        .shelf-cell.selected {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 8px 12px -1px rgba(59, 130, 246, 0.5);
          }
          100% {
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
    </div>
  );
}

ManageShelfLocation.propTypes = {
  selectedColumn: PropTypes.string,
  selectedRow: PropTypes.number,
  selectedShelfId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLocationSelect: PropTypes.func,
  predefinedShelves: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      columns: PropTypes.number.isRequired,
      rows: PropTypes.number.isRequired,
    })
  ),
};

export default ManageShelfLocation;
