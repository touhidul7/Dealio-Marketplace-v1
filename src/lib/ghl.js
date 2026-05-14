export async function createGHLContact({ firstName, lastName, email, phone, source, tags = [], customData = {} }) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn('GHL_API_KEY or GHL_LOCATION_ID is missing. Skipping GHL sync.');
    return null;
  }

  // GoHighLevel V2 API Endpoint for Contacts (Upsert prevents duplicate contact errors)
  const endpoint = 'https://services.leadconnectorhq.com/contacts/upsert';

  const payload = {
    locationId,
    firstName: firstName || '',
    lastName: lastName || '',
    name: `${firstName || ''} ${lastName || ''}`.trim(),
    email: email || '',
    phone: phone || '',
    tags: [...tags, 'dealio-marketplace'],
    source: source || 'Dealio Marketplace',
    customFields: []
  };

  // Convert customData into a single notes field for now, unless specific customField IDs are provided
  let notes = '';
  for (const [key, value] of Object.entries(customData)) {
    if (value) {
      notes += `${key}: ${value}\n`;
    }
  }

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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GoHighLevel API Error:', response.status, errorText);
    throw new Error(`GHL API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  // If we generated notes, add them to the contact
  if (notes && data.contact?.id) {
    await addGHLNote(data.contact.id, notes);
  }

  return data;
}

export async function addGHLNote(contactId, noteBody) {
  const apiKey = process.env.GHL_API_KEY;

  const endpoint = `https://services.leadconnectorhq.com/contacts/${contactId}/notes`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      body: noteBody
    })
  });

  if (!response.ok) {
    console.error('Failed to add GHL note', await response.text());
  }
}
