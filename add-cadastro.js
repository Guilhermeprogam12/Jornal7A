exports.handler = async function(event) {
    // 1. Garante que só aceitamos envios pelo formulário (método POST)
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 2. Pega os dados enviados pelo formulário
        const { nome, email, turma } = JSON.parse(event.body);

        // 3. Validação: garante que todos os campos foram preenchidos
        if (!nome || !email || !turma) {
            return {
                statusCode: 400, // Erro de "Requisição Inválida"
                body: JSON.stringify({ error: 'Por favor, preencha todos os campos.' })
            };
        }

        // 4. Pega as chaves secretas do "cofre" da Netlify
        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;
        const url = `https://api.airtable.com/v0/${baseId}/Cadastros`;

        // 5. Prepara os dados no formato que o Airtable entende
        const airtableData = {
            fields: {
                "nome_completo": nome,
                "email": email,
                "turma": turma
            }
        };

        // 6. Envia os dados para o Airtable
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });

        // 7. Verifica se o Airtable aceitou os dados
        if (!response.ok) {
            // Se não aceitou, lê o erro e o envia de volta para o site
            const errorDetails = await response.json();
            console.error('Erro do Airtable:', errorDetails);
            throw new Error('Não foi possível salvar os dados no Airtable.');
        }

        // 8. Se deu tudo certo, envia uma resposta de sucesso
        const responseData = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cadastro realizado com sucesso!', data: responseData })
        };

    } catch (error) {
        // 9. Se qualquer coisa no processo der errado, envia uma resposta de erro clara
        console.error('Erro na função:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro interno. Tente novamente mais tarde.' })
        };
    }
};
