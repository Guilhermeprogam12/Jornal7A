const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Pega a chave de visitante do cofre do Netlify
  const AIRTABLE_READ_ONLY_KEY = process.env.AIRTABLE_READ_ONLY_KEY;
  const BASE_ID = 'app3Z2bJrTyMK2hHz';
  const TABLE_NAME = 'Galeria';

  // Se a chave não estiver no cofre, retorna um erro
  if (!AIRTABLE_READ_ONLY_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: { message: "Chave da API de leitura não configurada no servidor." } }) 
    };
  }
  
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const headers = { 'Authorization': `Bearer ${AIRTABLE_READ_ONLY_KEY}` };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const error = await response.json();
        return { statusCode: response.status, body: JSON.stringify(error) };
    }
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
  }
};
