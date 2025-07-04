exports.handler = async function(event) {
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
        
        // --- NOVA LÓGICA DE VERIFICAÇÃO ---
        // 1. Monta o endereço para PROCURAR o e-mail, usando uma fórmula
        const filterFormula = encodeURIComponent(`{email} = '${email}'`);
        const searchUrl = `https://api.airtable.com/v0/${baseId}/Cadastros?filterByFormula=${filterFormula}`;

        // 2. Procura no Airtable
        const searchResponse = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!searchResponse.ok) {
            throw new Error('Erro ao verificar e-mail no Airtable.');
        }

        const searchData = await searchResponse.json();

        // 3. Se a busca encontrou algum registro (a lista não está vazia), retorna o erro
        if (searchData.records && searchData.records.length > 0) {
            return {
                statusCode: 409, // 409 é o código HTTP para "Conflito"
                body: JSON.stringify({ error: 'Este e-mail já está cadastrado!' })
            };
        }
        // --- FIM DA LÓGICA DE VERIFICAÇÃO ---

        // 4. Se o e-mail não existe, continua para salvar o novo cadastro
        const createUrl = `https://api.airtable.com/v0/${baseId}/Cadastros`;
        const createData = {
            fields: {
                "nome_completo": nome,
                "email": email,
                "turma": turma
            }
        };

        const createResponse = await fetch(createUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createData)
        });

        if (!createResponse.ok) {
            throw new Error('Falha ao salvar o novo cadastro no Airtable.');
        }

        const responseData = await createResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cadastro realizado com sucesso!', record: responseData })
        };

    } catch (error) {
        console.error('Erro na função:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro interno no servidor.' })
        };
    }
};
