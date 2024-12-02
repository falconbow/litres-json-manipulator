import React, { useState } from "react";
import { parse } from "csv-parse/browser/esm/sync";
import "./Reader.scss";

const CsvToJson = () => {
  const [jsonResults, setJsonResults] = useState({});
  const [columns, setColumns] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result as string | Buffer;
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (csvText: string | Buffer) => {
    try {
      const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const headers = Object.keys(records[0]);
      setColumns(headers);
      processAllColumns(records, headers);
    } catch (err) {
      console.error("Error parsing CSV:", err);
      alert("Failed to parse the CSV file. Please check the file format.");
    }
  };

  const processAllColumns = (records, headers) => {
    const allResults = {};

    headers.forEach((header) => {
      const result = {};
      records.forEach((record) => {
        if (record["RU"] && record[header]) {
          result[record["RU"]] = record[header];
        }
      });
      allResults[header] = result;
    });

    setJsonResults(allResults);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleInputChange = (e: Event) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const formatJson = (json) => {
    let jsonString = JSON.stringify(json, null, 2);
    jsonString = jsonString.replace(/^\{/, ",");
    jsonString = jsonString.replace(/\}$/, "");
    return jsonString;
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        className="fileInput"
        id="fileInput"
        onChange={handleInputChange}
      />
      <div
        className={`dragDropArea ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        CSV-файл с преводами
      </div>
      {columns.length > 0 && (
        <div>
          {columns.map((col, index) => (
            <div key={index} className="json-section">
              <h3>{col}</h3>
              <pre
                className="json-content"
                onClick={() => handleCopy(formatJson(jsonResults[col]))}
              >
                <code lang="JSON">{formatJson(jsonResults[col])}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CsvToJson;
