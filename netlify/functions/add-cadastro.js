// Esta é a receita de como nosso "garçom-robô" deve trabalhar.
exports.handler = async function(event) {
    // 1. Regra de Segurança: O robô só aceita pedidos que vêm do formulário (método POST).
    // Se alguém tentar acessar o endereço do robô diretamente, ele recusa.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        // 2. Pega as chaves secretas que SÓ a Netlify (o "gerente") conhece.
        // Elas nunca aparecem no site.
        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;

        // 3. Monta o endereço correto para a tabela "Cadastros" no Airtable.
        const url = `https://api.airtable.com/v0/${baseId}/Cadastros`;
        
        // 4. Pega os dados que o usuário preencheu no formulário.
        const { nome, email, turma } = JSON.parse(event.body);

        // 5. Prepara os dados no formato exato que o Airtable entende.
        const airtableData = {
            fields: {
                "nome_completo": nome,
                "email": email,
                "turma": turma
            }
        };

        // 6. Envia os dados para o Airtable usando as chaves seguras.
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });

        // 7. Verifica se o Airtable respondeu "OK, recebi!".
        if (!response.ok) {
            // Se o Airtable der um erro, o robô avisa que deu problema.
            console.error('Erro retornado pelo Airtable:', await response.text());
            throw new Error('Falha ao salvar no Airtable.');
        }

        // 8. Se tudo deu certo, o robô volta com uma mensagem de sucesso.
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cadastro realizado com sucesso!' })
        };

    } catch (error) {
        // 9. Se qualquer outra coisa no processo der errado, o robô avisa.
        console.error('Erro na função:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro no servidor.' })
        };
    }
};