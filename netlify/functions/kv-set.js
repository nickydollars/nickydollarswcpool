exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    const { key, value } = JSON.parse(event.body || '{}');
    if (!key) return { statusCode: 400, body: JSON.stringify({ error: 'key required' }) };
    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    const formula = encodeURIComponent(`{Key}="${key}"`);
    const lookupUrl = `https://api.airtable.com/v0/${base}/Store?filterByFormula=${formula}`;
    const lookupRes = await fetch(lookupUrl, { headers: { Authorization: `Bearer ${token}` } });
    const lookupData = await lookupRes.json();
    if (lookupData.records && lookupData.records.length > 0) {
      const recordId = lookupData.records[0].id;
      await fetch(`https://api.airtable.com/v0/${base}/Store/${recordId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { Value: value } })
      });
    } else {
      await fetch(`https://api.airtable.com/v0/${base}/Store`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { Key: key, Value: value } })
      });
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};