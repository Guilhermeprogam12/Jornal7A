const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { AIRTABLE_TOKEN, ADMIN_PASSWORD } = process.env;
  const { action, password, recordId, data } = JSON.parse(event.body);

  if (password !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: { message: "Senha do painel incorreta." } }) };
  }

  const BASE_ID = 'app3Z2bJrTyMK2hHz';
  const TABLE_NAME = 'Noticias';
  const headers = { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' };
  
  try {
    // AÇÃO: BUSCAR TODAS AS NOTÍCIAS
    if (action === 'GET') {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?sort%5B0%5D%5Bfield%5D=date&sort%5B0%5D%5Bdirection%5D=desc`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Falha ao buscar notícias.');
      const newsData = await response.json();
      return { statusCode: 200, body: JSON.stringify(newsData) };
    }

    // AÇÃO: BUSCAR UMA ÚNICA NOTÍCIA (NOVO!)
    if (action === 'GET_ONE' && recordId) {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Falha ao buscar dados da notícia.');
      const newsData = await response.json();
      return { statusCode: 200, body: JSON.stringify(newsData) };
    }

    // AÇÃO: DELETAR UMA NOTÍCIA
    if (action === 'DELETE' && recordId) {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const response = await fetch(url, { method: 'DELETE', headers });
      if (!response.ok) throw new Error('Falha ao deletar notícia.');
      return { statusCode: 200, body: JSON.stringify({ message: "Notícia deletada." }) };
    }

    // AÇÃO: EDITAR UMA NOTÍCIA (NOVO!)
    if (action === 'EDIT' && recordId && data) {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const body = JSON.stringify({ fields: data });
      const response = await fetch(url, { method: 'PATCH', headers, body });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Falha ao editar notícia: ${errorData.error.message}`);
      }
      return { statusCode: 200, body: JSON.stringify({ message: "Notícia editada." }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: { message: "Ação inválida." } }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
  }
};
