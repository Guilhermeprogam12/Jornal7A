const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { AIRTABLE_TOKEN, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  const { action, username, password, recordId, data } = JSON.parse(event.body);

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: { message: "Usuário ou senha incorretos." } }) };
  }

  const BASE_ID = 'app3Z2bJrTyMK2hHz';
  const TABLE_NAME = 'Noticias';
  const headers = { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' };
  
  try {
    if (action === 'GET') {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?sort%5B0%5D%5Bfield%5D=date&sort%5B0%5D%5Bdirection%5D=desc`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw await response.json();
      const newsData = await response.json();
      return { statusCode: 200, body: JSON.stringify(newsData) };
    }
    // ... (as outras ações como GET_ONE, DELETE, EDIT continuam iguais)

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message || "Erro no servidor." } }) };
  }
};
