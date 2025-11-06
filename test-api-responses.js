const https = require('http');

async function testAPIResponse() {
  console.log('Testing standardized API responses...\n');

  // Test 1: Health check (GET)
  await testEndpoint('GET', '/', null, 'Health Check');

  // Test 2: Get categories (GET)
  await testEndpoint('GET', '/categories', null, 'Get Categories');

  // Test 3: Get placements (GET) 
  await testEndpoint('GET', '/placements', null, 'Get Placements');

  // Test 4: Error case - invalid endpoint (GET)
  await testEndpoint('GET', '/invalid-endpoint', null, 'Invalid Endpoint (Error Test)');
}

function testEndpoint(method, path, data, description) {
  return new Promise((resolve) => {
    console.log(`🧪 Testing: ${description}`);
    console.log(`   ${method} http://localhost:3000${path}`);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response Format:`, JSON.stringify(response, null, 2));
          
          // Validate response format
          if (response.success !== undefined && response.timestamp) {
            if (response.success) {
              console.log(`   ✅ Success response format is correct`);
            } else {
              console.log(`   ✅ Error response format is correct`);
            }
          } else {
            console.log(`   ❌ Response format does not match standard`);
          }
        } catch (error) {
          console.log(`   ❌ Invalid JSON response:`, body);
        }
        console.log('   ─────────────────────────────────────────\n');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request failed:`, error.message);
      console.log('   ─────────────────────────────────────────\n');
      resolve();
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

testAPIResponse().then(() => {
  console.log('🎉 API response testing completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});