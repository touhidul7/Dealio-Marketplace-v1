


async function testGHL() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.log('Missing env vars');
    return;
  }

  const payload = {
    locationId,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    tags: ['test-tag'],
  };

  const response = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
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
  const text = await response.text();
  console.log('Body:', text);
}

testGHL();
