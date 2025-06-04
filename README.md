# Aplicativo de Controle Financeiro Pessoal

Este é um aplicativo web para controle financeiro pessoal.

## Assistente Financeiro AI com Integração Direta Gemini

O endpoint de proxy em `/api/chat.js` foi modificado para interagir diretamente com a API Google Gemini. Este arquivo destina-se a ser implantado como uma Serverless Function no Vercel.

**Propósito:**
- Atua como um backend seguro para o seu frontend, processando as solicitações do chat.
- Envia as perguntas do usuário e o contexto financeiro diretamente para a API Gemini.
- Retorna a resposta da IA para o frontend.
- Ajuda a manter sua API Key da Gemini segura no backend, em vez de expô-la no código do frontend.

**Como Funciona:**
1. O frontend (componente `AiChatModal.tsx`) envia requisições para `/api/chat` (a rota da sua função Vercel).
2. A Serverless Function em `api/chat.js` recebe essa requisição.
3. A função utiliza o SDK `@google/genai` para construir um prompt e enviar para a API Gemini.
4. A resposta da Gemini é retornada pela função para o frontend.

**Implantação no Vercel:**
- Ao implantar este projeto no Vercel, a pasta `api` e o arquivo `chat.js` serão automaticamente reconhecidos e implantados como uma Serverless Function.
- O endpoint estará disponível em `https://SEU_DOMINIO_VERCEL/api/chat`.

**Configuração da API Key da Gemini (MUITO IMPORTANTE):**
Para que a integração com a Gemini funcione, você **precisa** configurar sua API Key da Gemini como uma variável de ambiente no Vercel:
1. No painel do seu projeto no Vercel, vá em "Settings" -> "Environment Variables".
2. Adicione uma variável chamada `GEMINI_API_KEY`.
3. Defina o valor dela para a sua API Key da Google Gemini.
O código em `api/chat.js` já está configurado para usar `process.env.GEMINI_API_KEY`.

**Dependência do Pacote `@google/genai`:**
Para que a função Vercel possa usar o SDK da Gemini, o pacote `@google/genai` deve estar listado nas `dependencies` do seu arquivo `package.json` na raiz do projeto.
Se ainda não estiver lá, adicione-o executando:
`npm install @google/genai`
ou
`yarn add @google/genai`
Faça o commit dos arquivos `package.json` e `package-lock.json` (ou `yarn.lock`) atualizados antes de fazer o deploy no Vercel.

**Solução de Problemas (Troubleshooting):**
- Se o chat não funcionar, verifique os logs da sua função `/api/chat` no painel do Vercel. Eles podem indicar erros relacionados à API Key, ao SDK da Gemini, ou outros problemas na execução da função.
- Certifique-se de que sua API Key da Gemini está correta, ativa e tem permissões para usar o modelo especificado (`gemini-2.5-flash-preview-04-17`).
- Confirme que o pacote `@google/genai` foi instalado corretamente durante o build no Vercel (verifique os logs de build).