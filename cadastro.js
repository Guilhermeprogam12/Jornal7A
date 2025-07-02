exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { nome, email, turma } = JSON.parse(event.body);

        if (!nome || !email || !turma) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Todos os campos são obrigatórios.' }) };
        }

        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;
        const url = `https://api.airtable.com/v0/${baseId}/Cadastros`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    "nome_completo": nome,
                    "email": email,
                    "turma": turma
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro do Airtable: ${errorData.error.message}`);
        }

        const responseData = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cadastro realizado com sucesso!', record: responseData })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};