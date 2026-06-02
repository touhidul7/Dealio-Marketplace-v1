const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function checkColumns() {
  const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
  const envVars = {};
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Try to select all columns of a single listing to print the keys
  const { data, error } = await supabase.from('listings').select('*').limit(1);
  if (error) {
    console.error('Error fetching listing:', error);
  } else {
    console.log('Fetched listing columns:', Object.keys(data[0] || {}));
  }
}

checkColumns();
