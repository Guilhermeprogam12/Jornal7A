exports.handler = async function(event) {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const data = JSON.parse(event.body);

  const url = `https://api.airtable.com/v0/${data.baseId}/${data.tableId}`;

  const dataToSend = {
    fields: {
      "nome_completo": data.nome,
      "email": data.email,
      "sala": data.sala
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    });

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };
    } else {
      const errorData = await response.json();
      return { statusCode: response.status, body: JSON.stringify(errorData) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Server error." }) };
  }
};
