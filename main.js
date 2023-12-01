// Import the axios library
const axios = require('axios');

// Function to search for pharmacies
async function searchPharmacies(location) {
  try {
    // Your Google Maps API Key
    const apiKey = 'YOUR_API_KEY';

    // Google Places API endpoint for text search
    const apiUrl = 
'https://maps.googleapis.com/maps/api/place/textsearch/json';

    // Make a request to Google Places API
    const response = await axios.get(apiUrl, {
      params: {
        query: `pharmacy ${location}`,
        key: apiKey,
      },
    });

    // Extract relevant data from the API response
    const places = response.data.results.map(place => ({
      name: place.name,
      address: place.formatted_address,
    }));

    return places;
  } catch (error) {
    throw error;
  }
}

// Function to run the program
async function run() {
  try {
    // Get the location from the command line arguments
    const location = process.argv[2];

    if (!location) {
      console.error('Please provide a location as a command line 
argument.');
      return;
    }

    // Search for pharmacies
    const results = await searchPharmacies(location);

    // Display the results
    console.log('\nPharmacy Results:\n');
    results.forEach(place => {
      console.log(`Name: ${place.name}`);
      console.log(`Address: ${place.address}\n`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the program
run();

