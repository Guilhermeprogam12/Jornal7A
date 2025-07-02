exports.handler = async function(event, context) {
    // Este cofre de teste apenas envia uma mensagem de sucesso.
    // Ele não tenta se conectar ao Airtable.
    
    return {
        statusCode: 200, // Código de Sucesso
        body: JSON.stringify({ message: 'O cofre respondeu com sucesso!' })
    };
};
