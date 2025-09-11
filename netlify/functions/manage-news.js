const fetch = require('node-fetch');

exports.handler = async function(event) {
  console.log("DETETIVE (COFRE): Função 'manage-news' foi chamada.");
  
  const { AIRTABLE_TOKEN, ADMIN_PASSWORD } = process.env;
  const { action, password, recordId, data } = JSON.parse(event.body);

  console.log(`DETETIVE (COFRE): Ação recebida: ${action}, Senha digitada: ${'*'.repeat(password.length)}, Senha no cofre: ${ADMIN_PASSWORD ? '*'.repeat(ADMIN_PASSWORD.length) : 'NÃO ENCONTRADA'}`);

  if (password !== ADMIN_PASSWORD) {
    console.error("DETETIVE (COFRE): FALHA DE AUTENTICAÇÃO! Senha incorreta.");
    return { statusCode: 401, body: JSON.stringify({ error: { message: "Senha do painel incorreta." } }) };
  }

  const BASE_ID = 'app3Z2bJrTyMK2hHz';
  const TABLE_NAME = 'Noticias';
  const headers = { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' };
  
  try {
    if (action === 'GET') {
      console.log("DETETIVE (COFRE): Executando ação GET...");
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?sort%5B0%5D%5Bfield%5D=date&sort%5B0%5D%5Bdirection%5D=desc`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Falha ao buscar notícias do Airtable.');
      const newsData = await response.json();
      console.log("DETETIVE (COFRE): Ação GET bem-sucedida.");
      return { statusCode: 200, body: JSON.stringify(newsData) };
    }

    if (action === 'GET_ONE' && recordId) {
      console.log(`DETETIVE (COFRE): Executando GET_ONE para o ID: ${recordId}`);
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Falha ao buscar dados da notícia.');
      const newsData = await response.json();
      return { statusCode: 200, body: JSON.stringify(newsData) };
    }

    if (action === 'DELETE' && recordId) {
      console.log(`DETETIVE (COFRE): Executando DELETE para o ID: ${recordId}`);
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const response = await fetch(url, { method: 'DELETE', headers });
      if (!response.ok) throw new Error('Falha ao deletar notícia no Airtable.');
      return { statusCode: 200, body: JSON.stringify({ message: "Notícia deletada." }) };
    }

    if (action === 'EDIT' && recordId && data) {
      console.log(`DETETIVE (COFRE): Executando EDIT para o ID: ${recordId}`);
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const body = JSON.stringify({ fields: data });
      const response = await fetch(url, { method: 'PATCH', headers, body });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Falha ao editar notícia: ${errorData.error.message}`);
      }
      return { statusCode: 200, body: JSON.stringify({ message: "Notícia editada." }) };
    }

    console.error(`DETETIVE (COFRE): Ação '${action}' é inválida ou não reconhecida.`);
    return { statusCode: 400, body: JSON.stringify({ error: { message: "Ação inválida." } }) };

  } catch (error) {
    console.error("DETETIVE (COFRE): Ocorreu um erro CRÍTICO:", error);
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
  }
};
