// Função do "Cofre" para adicionar cadastros
exports.handler = async function(event) {
    // Só permite que o formulário envie dados
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        const { nome, email, turma } = JSON.parse(event.body);
        
        // Pega as chaves secretas que SÓ a Netlify conhece
        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;
        const url = `https://api.airtable.com/v0/${baseId}/Cadastros`;

        // Monta os dados para o Airtable
        const airtableData = {
            fields: { "nome_completo": nome, "email": email, "turma": turma }
        };

        // Envia os dados para o Airtable
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });

        if (!response.ok) {
            // Se o Airtable der erro, avisa
            throw new Error('Falha ao salvar no Airtable.');
        }

        // Se deu tudo certo, retorna uma mensagem de sucesso
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cadastro realizado com sucesso!' })
        };

    } catch (error) {
        // Se qualquer outra coisa der errado, retorna um erro genérico
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro no servidor.' })
        };
    }
};
