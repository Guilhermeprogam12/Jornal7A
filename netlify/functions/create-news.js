const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { AIRTABLE_TOKEN, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  const { title, category, content, username, password } = JSON.parse(event.body);

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: { message: "Usuário ou senha incorretos." } }) };
  }

  const url = `https://api.airtable.com/v0/app3Z2bJrTyMK2hHz/Noticias`;
  const dataToSend = {
    records: [{ fields: { title, category, content, date: new Date().toISOString().split('T')[0] } }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) { throw await response.json(); }
    return { statusCode: 200, body: JSON.stringify({ message: "Notícia criada com sucesso!" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: { message: error.message || "Erro no servidor." } }) };
  }
};
