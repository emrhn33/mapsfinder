// Places.js
import React, { useState } from 'react';
import axios from 'axios';

const category = 'healthcare.pharmacy';
const radius = 2500;

const Places = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);

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
        const uri = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${locString},${radius}&bias=proximity:${locString}&limit=20&apiKey=${process.env.REACT_APP_API_KEY}`;
        
        axios.get(uri)
          .then(response => {
            const { features } = response.data;
            setResults(features.map(({
              properties: {name, formatted: address, datasource: {
                raw: {phone, email, website}
              }}}) => (
              {name, address, phone, email, website}
            )));
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
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchText}
          onChange={handleChange}
          placeholder="Enter a location"
        />
        <button type="submit">Search</button>
      </form>
      <pre>
        {results && JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
};

export default Places;
