import React, { useState } from "react";
import { FaPlus, FaMinus, FaBook } from "react-icons/fa";
import PropTypes from "prop-types";

function SelectShelfLocation({
  selectedColumn = null,
  selectedRow = null,
  onLocationSelect = () => {},
  initialColumns = 5,
  initialRows = 3,
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [rows, setRows] = useState(initialRows);

  const handleCellClick = (column, row) => {
    onLocationSelect(column, row);
  };

  const addColumn = () => {
    setColumns((prev) => prev + 1);
  };

  const removeColumn = () => {
    if (columns > 1) {
      setColumns((prev) => prev - 1);
    }
  };

  const addRow = () => {
    setRows((prev) => prev + 1);
  };

  const removeRow = () => {
    if (rows > 1) {
      setRows((prev) => prev - 1);
    }
  };

  const getColumnLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, etc.
  };

  const isSelected = (column, row) => {
    return selectedColumn === getColumnLabel(column) && selectedRow === row;
  };

  return (
    <div
      className="shelf-location-container"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="d-flex flex-column align-items-center">
        {/* Top controls - Add/Remove Columns */}
        <div className="d-flex align-items-center mb-3">
          <button
            className="btn btn-outline-danger btn-sm me-2"
            onClick={removeColumn}
            disabled={columns <= 1}
            style={{ width: "35px", height: "35px" }}
          >
            <FaMinus size={12} />
          </button>
          <span className="mx-3 fw-bold text-muted">Columns: {columns}</span>
          <button
            className="btn btn-outline-success btn-sm ms-2"
            onClick={addColumn}
            style={{ width: "35px", height: "35px" }}
          >
            <FaPlus size={12} />
          </button>
        </div>

        {/* Shelf Grid with Left Side Controls */}
        <div className="shelf-grid-container d-flex align-items-center gap-3">
          {/* Left side - Row controls */}
          <div className="d-flex flex-column align-items-center">
            <button
              className="btn btn-outline-danger btn-sm mb-2"
              onClick={removeRow}
              disabled={rows <= 1}
              style={{ width: "30px", height: "30px" }}
            >
              <FaMinus size={10} />
            </button>
            <span
              className="fw-bold text-muted"
              style={{
                fontSize: "0.75rem",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              Rows: {rows}
            </span>
            <button
              className="btn btn-outline-success btn-sm mt-2"
              onClick={addRow}
              style={{ width: "30px", height: "30px" }}
            >
              <FaPlus size={10} />
            </button>
          </div>

          {/* Main shelf grid */}
          <div
            className="shelf-grid"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: "8px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              border: "2px solid #dee2e6",
              minWidth: "fit-content",
            }}
          >
            {Array.from({ length: rows }, (_, rowIndex) =>
              Array.from({ length: columns }, (_, colIndex) => {
                const columnLabel = getColumnLabel(colIndex);
                const rowLabel = rowIndex + 1;
                const selected = isSelected(colIndex, rowLabel);

                return (
                  <div
                    key={`${columnLabel}-${rowLabel}`}
                    className={`shelf-cell ${selected ? "selected" : ""}`}
                    onClick={() => handleCellClick(columnLabel, rowLabel)}
                    style={{
                      width: "80px",
                      height: "60px",
                      backgroundColor: selected ? "#007bff" : "#ffffff",
                      border: selected
                        ? "2px solid #0056b3"
                        : "2px solid #dee2e6",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: selected
                        ? "0 4px 8px rgba(0, 123, 255, 0.3)"
                        : "0 2px 4px rgba(0, 0, 0, 0.1)",
                      color: selected ? "#ffffff" : "#6c757d",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.target.style.backgroundColor = "#e9ecef";
                        e.target.style.borderColor = "#adb5bd";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.borderColor = "#dee2e6";
                      }
                    }}
                  >
                    <FaBook size={16} className="mb-1" />
                    <small style={{ fontSize: "11px", fontWeight: "600" }}>
                      {columnLabel}
                      {rowLabel}
                    </small>
                  </div>
                );
              })
            )}
          </div>

          {/* Right side - Add new shelf */}
          <div className="d-flex flex-column align-items-center">
            <div
              className="add-shelf-placeholder"
              style={{
                width: "100px",
                height: "80px",
                border: "3px dashed #adb5bd",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color: "#6c757d",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#007bff";
                e.target.style.color = "#007bff";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#adb5bd";
                e.target.style.color = "#6c757d";
              }}
              onClick={() => {
                // Add functionality to create a new shelf
                console.log("Add new shelf clicked");
              }}
            >
              <FaPlus size={20} className="mb-1" />
              <small
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Add Shelf
              </small>
            </div>
          </div>
        </div>

        {/* Selected Location Display */}
        {selectedColumn && selectedRow && (
          <div className="mt-3 p-2 bg-primary text-white rounded text-center">
            <small className="fw-bold">
              Selected Location: {selectedColumn}
              {selectedRow}
            </small>
          </div>
        )}
      </div>

      <style jsx>{`
        .shelf-cell:hover {
          transform: translateY(-2px);
        }

        .shelf-cell.selected {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
          }
          50% {
            box-shadow: 0 6px 12px rgba(0, 123, 255, 0.5);
          }
          100% {
            box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
          }
        }
      `}</style>
    </div>
  );
}

SelectShelfLocation.propTypes = {
  selectedColumn: PropTypes.string,
  selectedRow: PropTypes.number,
  onLocationSelect: PropTypes.func,
  initialColumns: PropTypes.number,
  initialRows: PropTypes.number,
};

export default SelectShelfLocation;
