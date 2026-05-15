const fs = require('fs');
const path = require('path');

async function testUpsert() {
  const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });

  const apiKey = envVars.GHL_API_KEY;
  const locationId = envVars.GHL_LOCATION_ID;
  
  if (!apiKey || !locationId) return;

  const endpoint = 'https://services.leadconnectorhq.com/contacts/upsert';
  
  // Test with `key` instead of `id`
  const payload = {
    locationId,
    firstName: 'TestDealioKey',
    email: 'testdealiokey@example.com',
    customFields: [
      {
        key: "contact.dealio_id",
        value: "TEST-ID-123"
      },
      {
        key: "dealio_id",
        value: "TEST-ID-456"
      }
    ]
  };

  console.log('Sending payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  console.log('Status:', response.status);
  const data = await response.text();
  console.log('Response:', data);
}

testUpsert();
