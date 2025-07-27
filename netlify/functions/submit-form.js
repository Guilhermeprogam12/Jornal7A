// Este é o novo código do "cofre"
const fetch = require('node-fetch');

exports.handler = async function(event) {
  // 1. Pega a chave secreta do cofre do Netlify
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  // 2. Pega os dados que o formulário enviou (baseId, tableId, nome, etc.)
  const { baseId, tableId, email, nome, sala } = JSON.parse(event.body);

  // Se a chave não estiver no cofre, retorna um erro claro
  if (!AIRTABLE_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: "Chave da API não configurada no servidor." } }) };
  }
  
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  // 3. Verifica se o usuário já existe na planilha 'Cadastro'
  const checkUrl = `https://api.airtable.com/v0/${baseId}/Cadastro?filterByFormula=({email} = '${email}')`;

  try {
    const checkResponse = await fetch(checkUrl, { headers });
    if (!checkResponse.ok) {
        const error = await checkResponse.json();
        return { statusCode: checkResponse.status, body: JSON.stringify(error) };
    }
    const checkData = await checkResponse.json();

    // 4. Se o usuário não existe, cria um novo
    if (checkData.records.length === 0) {
      const createUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
      const createBody = {
        records: [{ fields: { nome_completo: nome, email: email, sala: sala } }]
      };
      const createResponse = await fetch(createUrl, { method: 'POST', headers, body: JSON.stringify(createBody) });
      
      if (!createResponse.ok) {
        const error = await createResponse.json();
        return { statusCode: createResponse.status, body: JSON.stringify(error) };
      }
    }

    // 5. Se o usuário já existia OU foi criado com sucesso, retorna sucesso e o token
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success", token: AIRTABLE_TOKEN })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
  }
};
