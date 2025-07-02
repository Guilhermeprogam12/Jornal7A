// A única tarefa deste robô é pegar o pedido e levar para o Airtable.
exports.handler = async function(event) {
    try {
        // Pega as chaves secretas que só a Netlify conhece.
        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;

        // O endereço do nosso chef (o Airtable).
        const url = `https://api.airtable.com/v0/${baseId}/Cadastros`;

        // Envia o pedido para o chef.
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: event.body // Envia os dados do formulário diretamente.
        });

        // Se o chef disse que o pedido está errado, avisa o erro.
        if (!response.ok) {
            throw new Error('O Airtable não aceitou os dados.');
        }

        // Se o chef disse "ok", o garçom volta com a resposta de sucesso.
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cadastro realizado com sucesso!' })
        };

    } catch (error) {
        // Se qualquer coisa der errado, o garçom avisa que deu problema.
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Deu um erro na cozinha!' })
        };
    }
};
