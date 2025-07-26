// Este é o código do nosso "garçom"
// Ele roda no servidor do Netlify, não no navegador.

exports.handler = async function(event) {
  // Pega a chave secreta do "cofre" (Environment Variables) do Netlify
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

  // Pega os dados que o formulário enviou (nome, sala, email)
  const data = JSON.parse(event.body);

  // Monta a URL da API do Airtable
  const url = `https://api.airtable.com/v0/${data.baseId}/${data.tableId}`;

  // Prepara os dados no formato que o Airtable espera
  const dataToSend = {
    fields: {
      "nome_completo": data.nome,
      "email": data.email,
      "sala": data.sala
    }
  };

  try {
    // Tenta se comunicar com o Airtable
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });

    if (response.ok) {
      // Se deu certo, retorna sucesso
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Cadastro realizado com sucesso!" })
      };
    } else {
      // Se deu erro, retorna o erro do Airtable
      const errorData = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify(errorData)
      };
    }
  } catch (error) {
    // Se deu erro de conexão, retorna erro
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erro de conexão com o servidor." })
    };
  }
};
