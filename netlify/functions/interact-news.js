const fetch = require('node-fetch');

// Função principal que decide o que fazer (curtir ou comentar)
exports.handler = async function(event) {
  // Pega a chave mestra e o ID da base do cofre
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = process.env;
  // Pega os dados enviados pelo site
  const data = JSON.parse(event.body);

  // Se a chave não estiver no cofre, para tudo
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: "Variáveis de ambiente não configuradas no servidor." }) };
  }

  // Decide qual ação tomar com base no que o site pediu
  try {
    if (data.action === 'LIKE_POST' && data.recordId) {
      return await likePost(data, { AIRTABLE_TOKEN, AIRTABLE_BASE_ID });
    }
    if (data.action === 'ADD_COMMENT' && data.recordId && data.comment && data.author) {
      return await addComment(data, { AIRTABLE_TOKEN, AIRTABLE_BASE_ID });
    }
    // Se nenhuma ação válida foi pedida, retorna erro
    return { statusCode: 400, body: JSON.stringify({ error: "Ação inválida." }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// Função específica para adicionar uma curtida
async function likePost(data, secrets) {
  const { recordId, currentLikes } = data;
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = secrets;
  
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Noticias/${recordId}`;
  
  // O corpo do pedido: apenas o campo "Curtidas" com o novo valor
  const body = JSON.stringify({
    fields: {
      "Curtidas": (currentLikes || 0) + 1 // Pega o número atual de curtidas e adiciona 1
    }
  });

  const response = await fetch(url, {
    method: 'PATCH', // PATCH é usado para ATUALIZAR um registro existente
    headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body: body
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro no Airtable ao curtir: ${error.error.message}`);
  }

  const result = await response.json();
  return { statusCode: 200, body: JSON.stringify(result) };
}

// Função específica para adicionar um comentário
async function addComment(data, secrets) {
  const { recordId, comment, author } = data;
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = secrets;

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Comentarios`;

  // O corpo do pedido: os campos do novo comentário
  const body = JSON.stringify({
    records: [{
      fields: {
        "Comentario": comment,
        "Autor": author,
        "NoticiaRelacionada": [recordId] // Linka o comentário com o ID da notícia
      }
    }]
  });

  const response = await fetch(url, {
    method: 'POST', // POST é usado para CRIAR um novo registro
    headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
    body: body
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro no Airtable ao comentar: ${error.error.message}`);
  }

  const result = await response.json();
  return { statusCode: 200, body: JSON.stringify(result) };
}
