// Test script for hotel description extraction
// Run: node web-app/scripts/test-description.js

const http = require('http');

const url = 'http://localhost:3000/api/hotels/30714?checkIn=2026-04-09&checkOut=2026-04-12';

http.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
  let data = '';
  
  // Handle redirects manually
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Redirect to:', res.headers.location);
    const redirectUrl = res.headers.location.startsWith('http')
      ? res.headers.location
      : 'http://localhost:3000' + res.headers.location;
    http.get(redirectUrl, (res2) => {
      let data2 = '';
      res2.on('data', (chunk) => data2 += chunk);
      res2.on('end', () => {
        try {
          const json = JSON.parse(data2);
          console.log('Status:', res2.statusCode);
          console.log('Hotel Name:', json.data?.hotelName);
          console.log('Description:', json.data?.description ? json.data.description.substring(0, 200) + '...' : 'NULL/UNDEFINED');
          console.log('Has Description:', !!json.data?.description);
          console.log('\nFull Response Keys:', Object.keys(json.data || {}));
        } catch (e) {
          console.log('Raw response:', data2.substring(0, 500));
        }
      });
    });
    return;
  }
  
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Hotel Name:', json.data?.hotelName);
      console.log('Description:', json.data?.description ? json.data.description.substring(0, 200) + '...' : 'NULL/UNDEFINED');
      console.log('Has Description:', !!json.data?.description);
      console.log('\nFull Response Keys:', Object.keys(json.data || {}));
    } catch (e) {
      console.log('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
