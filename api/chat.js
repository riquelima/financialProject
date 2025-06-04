
// Arquivo: api/chat.js
// Este arquivo deve estar na pasta /api na raiz do seu projeto Vercel.

export default async function handler(req, res) {
  // 1. Verificar se o método da requisição é POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  // 2. Obter o corpo da requisição do seu frontend
  // O Vercel já faz o parse do corpo se o Content-Type for application/json
  const requestBodyFromFrontend = req.body;

  if (!requestBodyFromFrontend || !requestBodyFromFrontend.userInput) {
    return res.status(400).json({ message: 'Corpo da requisição inválido ou "userInput" ausente.' });
  }

  // 3. Defina a URL REAL do seu webhook n8n aqui!
  // É ALTAMENTE RECOMENDADO usar uma variável de ambiente do Vercel aqui.
  // Ex: const N8N_ACTUAL_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  // E configure N8N_WEBHOOK_URL nas variáveis de ambiente do seu projeto no Vercel.
  const N8N_ACTUAL_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv837598.hstgr.cloud/webhook/3d45ca46-9f34-47a2-9a66-f1d66dab130f';

  try {
    // 4. Faça a requisição do seu servidor proxy para o n8n
    const n8nResponse = await fetch(N8N_ACTUAL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione quaisquer outros cabeçalhos que o n8n possa esperar, se houver.
        // Por exemplo, se você configurou uma chave de API no n8n para autenticação do webhook:
        // 'X-N8N-API-KEY': process.env.N8N_WEBHOOK_AUTH_KEY,
      },
      body: JSON.stringify(requestBodyFromFrontend), // Envia o corpo recebido do frontend
    });

    // 5. Obtenha a resposta do n8n (mesmo que seja um erro)
    // É importante tentar ler o corpo da resposta do n8n para repassar mensagens de erro.
    let dataFromN8n;
    try {
        dataFromN8n = await n8nResponse.json();
    } catch (jsonError) {
        // Se o n8n não retornar JSON (ex: HTML de erro ou texto puro), pegue o texto.
        const textError = await n8nResponse.text();
        console.error('Resposta do n8n não era JSON. Status:', n8nResponse.status, 'Resposta como texto:', textError);
        // Retorna o status do n8n, mas com uma mensagem de erro genérica se não for JSON
        return res.status(n8nResponse.status).json({ 
            message: `Erro do n8n (resposta não JSON): ${n8nResponse.status} ${n8nResponse.statusText}`,
            details: textError.substring(0, 500) // Limita o tamanho do texto do erro
        });
    }

    // 6. Verifique se a resposta do n8n foi bem-sucedida (status 2xx)
    if (!n8nResponse.ok) {
      console.error('Erro ao chamar n8n. Status:', n8nResponse.status, 'Resposta do n8n:', dataFromN8n);
      // Repassa o status e a mensagem de erro do n8n para o frontend
      return res.status(n8nResponse.status).json({
        message: `Erro ao comunicar com o serviço de chat (n8n). Status: ${n8nResponse.status}`,
        details: dataFromN8n, // Contém a resposta JSON do n8n, mesmo que seja um erro
      });
    }
    
    // 7. Envie a resposta bem-sucedida do n8n de volta para o seu frontend
    return res.status(200).json(dataFromN8n);

  } catch (error) {
    // Captura erros de rede ou outros erros inesperados ao tentar se comunicar com o n8n
    console.error('Erro interno no proxy de chat ao tentar se comunicar com n8n:', error);
    return res.status(500).json({ 
      message: 'Erro interno no servidor proxy ao tentar contatar o serviço de chat.',
      details: error.message 
    });
  }
}
