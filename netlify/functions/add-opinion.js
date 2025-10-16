const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Pega a chave mestra do cofre
  const { AIRTABLE_TOKEN } = process.env;
  // Pega os dados enviados pelo pop-up
  const { opinion } = JSON.parse(event.body);

  // Se a chave não estiver no cofre, para tudo
  if (!AIRTABLE_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: "Chave da API não configurada." }) };
  }
  
  const url = `https://api.airtable.com/v0/app3Z2bJrTyMK2hHz/Opinioes`;
  
  const dataToSend = {
    records: [{ fields: { "Opiniao": opinion } }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) { throw await response.json(); }
    
    return { statusCode: 200, body: JSON.stringify({ message: "Opinião enviada com sucesso!" }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Erro no servidor." }) };
  }
};
