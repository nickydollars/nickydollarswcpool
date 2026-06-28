exports.handler = async (event) => {
  try {
    const prefix = (event.queryStringParameters && event.queryStringParameters.prefix) || '';
    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_TOKEN;
    let keys = [];
    let offset;
    do {
      const url = `https://api.airtable.com/v0/${base}/Store?pageSize=100${offset ? `&offset=${offset}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      (data.records || []).forEach((r) => {
        if (r.fields.Key && r.fields.Key.startsWith(prefix)) keys.push(r.fields.Key);
      });
      offset = data.offset;
    } while (offset);
    return { statusCode: 200, body: JSON.stringify({ keys }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};