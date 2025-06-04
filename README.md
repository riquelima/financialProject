# Aplicativo de Controle Financeiro Pessoal

Este é um aplicativo web para controle financeiro pessoal.

## Proxy para o Assistente Financeiro AI (n8n)

Foi adicionado um endpoint de proxy em `/api/chat.js`. Este arquivo destina-se a ser implantado como uma Serverless Function no Vercel.

**Propósito:**
- Atua como um intermediário entre o frontend do aplicativo e o webhook do n8n.
- Ajuda a contornar problemas de CORS que podem ocorrer quando o navegador tenta chamar diretamente um webhook em um domínio diferente.
- Permite que a URL do webhook n8n seja gerenciada no backend (idealmente via variáveis de ambiente).

**Como Funciona:**
1. O frontend (componente `AiChatModal.tsx`) envia requisições para `/api/chat`.
2. A Serverless Function em `api/chat.js` recebe essa requisição.
3. A função então faz uma nova requisição para a URL real do webhook n8n, encaminhando os dados.
4. A resposta do n8n é retornada pela função para o frontend.

**Implantação no Vercel:**
- Ao implantar este projeto no Vercel, a pasta `api` e o arquivo `chat.js` serão automaticamente reconhecidos e implantados como uma Serverless Function.
- O endpoint estará disponível em `https://SEU_DOMINIO_VERCEL/api/chat`.

**Configuração da URL do Webhook n8n (IMPORTANTE):**
Dentro de `api/chat.js`, a URL do webhook n8n está definida. **É altamente recomendável substituí-la pelo uso de uma variável de ambiente no Vercel:**
1. No painel do seu projeto no Vercel, vá em "Settings" -> "Environment Variables".
2. Adicione uma variável chamada `N8N_WEBHOOK_URL`.
3. Defina o valor dela para a URL completa do seu webhook n8n (ex: `https://seuservidor.n8n.cloud/webhook/seu-path`).
O código em `api/chat.js` já está configurado para tentar usar `process.env.N8N_WEBHOOK_URL` primeiro.

**Nota sobre o Erro "Failed to fetch":**
Se você ainda encontrar o erro "Failed to fetch" após implementar o proxy:
1. Verifique os logs da sua função `/api/chat` no painel do Vercel. Eles podem indicar se o proxy está recebendo a requisição e se está conseguindo se comunicar com o n8n, ou se o n8n está retornando um erro para o proxy.
2. Se o n8n estiver retornando um erro (como 500) para o proxy, o problema original ainda reside na sua instância do n8n ou na sua configuração. O proxy ajuda com o CORS do navegador, mas não corrige erros internos no servidor de destino.
