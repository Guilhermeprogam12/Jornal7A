const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { AIRTABLE_TOKEN, ADMIN_PASSWORD } = process.env;
  const { action, password, recordId, data } = JSON.parse(event.body);

  // 1. A primeira coisa é sempre verificar a senha
  if (password !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: { message: "Senha do painel incorreta." } }) };
  }

  const BASE_ID = 'app3Z2bJrTyMK2hHz';
  const TABLE_NAME = 'Noticias';
  
  // 2. Decide o que fazer com base na 'action'
  try {
    // AÇÃO: BUSCAR TODAS AS NOTÍCIAS
    if (action === 'GET') {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?sort%5B0%5D%5Bfield%5D=date&sort%5B0%5D%5Bdirection%5D=desc`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` } });
      if (!response.ok) throw new Error('Falha ao buscar notícias do Airtable.');
      const newsData = await response.json();
      return { statusCode: 200, body: JSON.stringify(newsData) };
    }

    // AÇÃO: DELETAR UMA NOTÍCIA
    if (action === 'DELETE' && recordId) {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` } });
      if (!response.ok) throw new Error('Falha ao deletar notícia no Airtable.');
      return { statusCode: 200, body: JSON.stringify({ message: "Notícia deletada com sucesso." }) };
    }

    // AÇÃO: EDITAR UMA NOTÍCIA (será implementada no futuro)
    if (action === 'EDIT' && recordId && data) {
      // Aqui entraria a lógica para editar, que é um pouco mais complexa
      return { statusCode: 501, body: JSON.stringify({ error: { message: "Função de editar não implementada." } }) };
    }

    // Se nenhuma ação válida foi passada
    return { statusCode: 400, body: JSON.stringify({ error: { message: "Ação inválida." } }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
  }
};
