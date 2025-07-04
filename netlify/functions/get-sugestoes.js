// Este robô busca as sugestões no Airtable para mostrar no mural.
exports.handler = async function(event) {
    try {
        const apiKey = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID;
        
        // Fórmula para pegar apenas sugestões que NÃO estão "Pendentes".
        const filterFormula = "NOT({status} = 'Pendente')";
        const url = `https://api.airtable.com/v0/${baseId}/Sugestoes?filterByFormula=${encodeURIComponent(filterFormula)}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar sugestões no Airtable.');
        }
        
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Erro na função get-sugestoes:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro no servidor.' })
        };
    }
};
