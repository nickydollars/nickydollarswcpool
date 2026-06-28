exports.handler = async (event) => {
  try {
    const key = event.queryStringParameters && event.queryStringParameters.key;
    if (!key) return { statusCode: 400, body: JSON.stringify({ error: 'key required' }) };
    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const formula = encodeURIComponent(`{Key}="${key}"`);
    const url = `https://api.airtable.com/v0/${base}/Store?filterByFormula=${formula}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.records || data.records.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ value: null }) };
    }
    return { statusCode: 200, body: JSON.stringify({ value: data.records[0].fields.Value }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};