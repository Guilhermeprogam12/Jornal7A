const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Pega os segredos do cofre do Netlify
  const { AIRTABLE_TOKEN, ADMIN_PASSWORD } = process.env;
  
  // Pega os dados enviados pelo formulário admin
  const { title, category, content, password } = JSON.parse(event.body);

  // 1. Verifica a senha do painel
  if (password !== ADMIN_PASSWORD) {
    return {
      statusCode: 401, // Unauthorized
      body: JSON.stringify({ error: { message: "Senha do painel incorreta." } })
    };
  }

  // 2. Prepara os dados para o Airtable
  const url = `https://api.airtable.com/v0/app3Z2bJrTyMK2hHz/Noticias`;
  const dataToSend = {
    records: [{
      fields: {
        title: title,
        category: category,
        content: content,
        date: new Date().toISOString().split('T')[0] // Pega a data de hoje
      }
    }]
  };

  // 3. Tenta salvar no Airtable
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { statusCode: response.status, body: JSON.stringify(errorData) };
    }

    // 4. Retorna sucesso
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Notícia criada com sucesso!" })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message } }) };
  }
};
