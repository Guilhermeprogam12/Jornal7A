const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Verificação inicial para garantir que o corpo da requisição existe
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: { message: "Requisição sem corpo." } }) };
  }

  const { AIRTABLE_TOKEN, ADMIN_PASSWORD } = process.env;
  const { action, password, recordId, data } = JSON.parse(event.body);

  // 1. A primeira coisa é sempre verificar a senha
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
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error.message || 'Falha ao buscar notícias.');
      return { statusCode: 200, body: JSON.stringify(responseData) };
    }

    // AÇÃO: BUSCAR UMA ÚNICA NOTÍCIA
    if (action === 'GET_ONE' && recordId) {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const response = await fetch(url, { headers });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error.message || 'Falha ao buscar dados da notícia.');
      return { statusCode: 200, body: JSON.stringify(responseData) };
    }

    // AÇÃO: DELETAR UMA NOTÍCIA
    if (action === 'DELETE' && recordId) {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const response = await fetch(url, { method: 'DELETE', headers });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error.message || 'Falha ao deletar notícia.');
      return { statusCode: 200, body: JSON.stringify(responseData) };
    }

    // AÇÃO: EDITAR UMA NOTÍCIA
    if (action === 'EDIT' && recordId && data) {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const body = JSON.stringify({ fields: data });
      const response = await fetch(url, { method: 'PATCH', headers, body });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error.message || 'Falha ao editar notícia.');
      return { statusCode: 200, body: JSON.stringify(responseData) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: { message: "Ação inválida ou dados faltando." } }) };

  } catch (error) {
    console.error("ERRO CRÍTICO NA FUNÇÃO:", error);
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
  }
};
