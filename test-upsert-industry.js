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
  
  const payload = {
    locationId,
    firstName: 'TestIndustryKey',
    email: 'testindustrykey@example.com',
    customFields: [
      {
        key: "dealio_id",
        value: "TEST-ID-456"
      },
      {
        key: "business_industry",
        value: "TEST-INDUSTRY"
      }
    ]
  };

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
  
  const data = await response.text();
  console.log('Response:', data);
}

testUpsert();
