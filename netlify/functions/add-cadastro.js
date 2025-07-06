exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        const { nome, email, turma } = JSON.parse(event.body);
        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;
        const url = `https://api.airtable.com/v0/${baseId}/Cadastros`;

        const airtableData = {
            fields: { "nome_completo": nome, "email": email, "turma": turma }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(airtableData)
        });

        if (!response.ok) throw new Error('Falha ao salvar no Airtable.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cadastro realizado com sucesso!' })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Ocorreu um erro no servidor.' }) };
    }
};
