// Este é o robô responsável por receber e salvar as sugestões.
exports.handler = async function(event) {
    // Regra de segurança: só aceita envios do formulário.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        // Pega os dados que o usuário enviou: a sugestão e o nome (que pode ser opcional).
        const { sugestao, autor } = JSON.parse(event.body);

        // Validação: garante que o campo da sugestão não está vazio.
        if (!sugestao) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'O campo da sugestão não pode estar vazio.' })
            };
        }

        // Pega as chaves secretas que só a Netlify conhece.
        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;
        const url = `https://api.airtable.com/v0/${baseId}/Sugestoes`;

        // Prepara os dados no formato que o Airtable entende.
        // Toda nova sugestão chega com o status "Pendente".
        const airtableData = {
            fields: {
                "sugestao": sugestao,
                "autor": autor || "Anônimo", // Se o autor não preencher, salva como "Anônimo".
                "status": "Pendente"
            }
        };

        // Envia os dados para o Airtable.
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });

        // Verifica se o Airtable aceitou os dados.
        if (!response.ok) {
            console.error('Erro retornado pelo Airtable:', await response.text());
            throw new Error('Falha ao salvar a sugestão no Airtable.');
        }

        // Se deu tudo certo, retorna uma mensagem de sucesso.
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Sugestão enviada com sucesso! Obrigado por participar.' })
        };

    } catch (error) {
        // Se qualquer outra coisa der errado, avisa.
        console.error('Erro na função:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro no servidor ao processar sua sugestão.' })
        };
    }
};
