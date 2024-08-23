import React, { useState, useEffect } from "react";
import "../css/CsvImporter.css"; // Ensure you create this CSS file for the new styles
import { CSVLink } from "react-csv";
import Papa from 'papaparse';

function CsvImporter() {
  const [file, setFile] = useState(null);
  const [array, setArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [CsvData, setCsvData] = useState([]);

  const fileReader = new FileReader();

  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };

  const csvFileToArray = (string) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i) => {
      const values = i.split(",");
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });

    setArray(array);
    setCurrentPage(1);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const text = event.target.result;
        csvFileToArray(text);
      };

      fileReader.readAsText(file);
    }
  };
  const fetchCsvData = async () => {
    try {
      const response = await fetch(`http://localhost/do-an/exportAllStudents.php`);
      const csvText = await response.text(); // Nhận dữ liệu dưới dạng văn bản

      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          setCsvData(results.data); // Kết quả phân tích cú pháp sẽ là một mảng các đối tượng
        }
      });
    } catch (error) {
      console.error('Error fetching CSV data:', error);
    }
  };

  useEffect(() => {
    fetchCsvData();
  }, []);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = array.slice(indexOfFirstRow, indexOfLastRow);

  const headerKeys = Object.keys(Object.assign({}, ...array));

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(array.length / rowsPerPage);

  return (
    <div className="csv-importer-container">
      <nav className="navbar">
        <div className="navbar-logo">VKU Dashboard</div>
        <ul className="navbar-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#import">Thông Báo</a></li>
          <li><a href="#export">Export</a></li>
        </ul>
      </nav>

      <div className="csv-importer-header">
        <h1 className="csv-importer-title">Admin CSV Importer</h1>
        <form className="csv-importer-form">
          <CSVLink
            filename={"students.csv"}
            className="csv-importer-export-btn color-button-export"
            data={CsvData}
            headers={[
              { label: "Họ tên", key: "full_name" },
              { label: "Mã Sinh Viên", key: "student_code" },
              { label: "Ngày Sinh", key: "dob" },
              { label: "Lớp Sinh Hoạt", key: "class_code" },
              { label: "Môn Thi", key: "exam_subject" },
              { label: "Suất Thi", key: "exam_time" },
              { label: "Phòng Thi", key: "exam_room" },
              { label: "Hình Thức Vi Phạm", key: "violate" },
              { label: "Hình Thức Xử Lý", key: "processing" },
              { label: "Cán Bộ Coi Thi", key: "exam_invigilator1" }
            ]}
          >
           <i class="fa-solid fa-file-arrow-down"></i> Export 
          </CSVLink>
          <input
            type="file"
            id="csvFileInput"
            accept=".csv"
            onChange={handleOnChange}
            className="csv-importer-input"
          />
          
          <button onClick={handleOnSubmit} className="csv-importer-button">
          <i class="fa-solid fa-file-import"></i> Import 
          </button>
        </form>
      </div>
      <br />
      {array.length > 0 && (
        <div className="csv-importer-table-container">
          <table className="csv-importer-table">
            <thead>
              <tr>
                {headerKeys.map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((val, idx) => (
                    <td key={idx}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                className={`pagination-button ${currentPage === number ? "active" : ""}`}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
            <button
              className="pagination-button"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CsvImporter;
