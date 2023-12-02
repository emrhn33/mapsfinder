// Places.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Places.css';
 
const Places = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState(null);
  const [radius, setRadius] = useState(2500);
  const [category] = useState('healthcare.pharmacy');
  const [limit, setLimit] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [currentItems, setCurrentItems] = useState(null);
  useEffect(() => {
    if (results === null) return;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);
    setCurrentItems(currentItems);
  }, [currentPage, results]);

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const exportToExcel = (arrayOfObjects) => {
    const worksheet = XLSX.utils.json_to_sheet(arrayOfObjects);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "output.xlsx");
  };

  const handleChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loc_uri = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchText)}&limit=1&apiKey=${process.env.REACT_APP_API_KEY}`;

    axios.get(loc_uri)
      .then(response => {
        const { features } = response.data;
        const location = features[0].geometry.coordinates;
        return location;
      })
      .then(location => {
        const locString = `${location[0]},${location[1]}`;
        const uri = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${locString},${radius}&bias=proximity:${locString}&limit=${limit}&apiKey=${process.env.REACT_APP_API_KEY}`;
        
        axios.get(uri)
          .then(response => {
            const { features } = response.data;
            const results = features.map(({
              properties: {name, formatted: address, datasource: {
                raw: {phone, email, website}
              }}}) => (
              {name, address, phone, email, website}
            ));
            setResults(results);
          })
          .catch(error => {
            console.log('error', error);
            return [];
          });
      })
      .catch(error => {
        console.log('error', error);
        return [];
      });
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="colorful-form">
        <div className="form-group">
          <label htmlFor="locationInput">Location:</label>
          <input
            id="locationInput"
            type="text"
            value={searchText}
            onChange={handleChange}
            placeholder="Enter a location"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="radiusInput">Radius:</label>
          <input
            id="radiusInput"
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            placeholder="Radius"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="limitInput">Limit:</label>
          <input
            id="limitInput"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="form-input"
          />
        </div>
        <button type="submit" className='form-button'>Submit</button>
        <button type="button" onClick={() => exportToExcel(results)} className="form-button">Export to Excel</button>
      </form>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage}</span>
        <button onClick={nextPage} disabled={!currentItems || currentItems.length < itemsPerPage}>Next</button>
      </div>
      <div className="results-count">
        {results && <p>Total Results: {results.length}</p>}
      </div>
      <div className="results-container">
        {currentItems && currentItems.map((item, index) => (
          <div key={index} className="item-container">
            <h2>{item.name}</h2>
            <p>{item.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Places;
