const fs = require('fs');
const path = require('path');

async function checkFields() {
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
  
  console.log('Location ID:', locationId ? 'Set' : 'Missing');
  console.log('API Key:', apiKey ? 'Set' : 'Missing');
  
  if (!apiKey || !locationId) return;
  
  const endpoint = `https://services.leadconnectorhq.com/locations/${locationId}/customFields?model=contact`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    console.error('Failed to fetch:', response.status, await response.text());
    return;
  }
  
  const data = await response.json();
  const fields = data.customFields || [];
  console.log(`Found ${fields.length} custom fields.`);
  
  fields.forEach(f => {
    const nameStr = (f.name || '').toLowerCase();
    const keyStr = (f.fieldKey || '').toLowerCase();
    
    if (nameStr.includes('dealio') || keyStr.includes('dealio') || 
        nameStr.includes('industry') || keyStr.includes('industry') ||
        nameStr.includes('asset') || keyStr.includes('asset') ||
        nameStr.includes('business') || keyStr.includes('business')) {
      console.log(`- MATCH: Name: "${f.name}", FieldKey: "${f.fieldKey}", ID: "${f.id}"`);
    }
  });
}

checkFields();
