

# Aplicativo de Controle Financeiro Pessoal

Este é um aplicativo web para controle financeiro pessoal.

## Assistente Financeiro AI (Integrado com Google Gemini)

O "Assistente Financeiro AI" neste aplicativo é integrado com a API Google Gemini através de uma Serverless Function no Vercel que atua como um proxy.

**Como Funciona:**
1.  Quando o usuário interage com o chat do assistente (componente `AiChatModal.tsx`):
    *   A entrada do usuário (`userInput`) e o contexto financeiro (`financialContext`) são enviados para um endpoint de API no backend do Vercel (`/api/chat`).
2.  A Serverless Function em `/api/chat.js`:
    *   Recebe os dados do frontend.
    *   Utiliza o SDK `@google/genai` para se comunicar com a API Google Gemini.
    *   Constrói um prompt detalhado para a Gemini, incluindo o contexto financeiro do usuário (resumos, transações recentes, configurações) e a pergunta do usuário.
    *   Envia este prompt para um modelo Gemini (atualmente `gemini-2.5-flash-preview-04-17`).
    *   Recebe a resposta da Gemini.
    *   Retorna a resposta textual da Gemini (`aiResponseText`) para o frontend.
3.  O `AiChatModal.tsx` recebe essa resposta e a exibe no chat para o usuário.

**Requisitos para Funcionar Corretamente:**
-   **Arquivo `api/chat.js`:** Este arquivo deve existir na pasta `api/` na raiz do seu projeto e conter a lógica da Serverless Function.
-   **Pacote `@google/genai`:** Este pacote deve estar listado nas dependências do seu arquivo `package.json`. Se você não tiver um `package.json` ou o pacote não estiver listado, você precisará:
    1.  Criar um `package.json` se não existir: `npm init -y` (ou `yarn init -y`)
    2.  Instalar o pacote: `npm install @google/genai` (ou `yarn add @google/genai`)
    3.  Fazer commit do `package.json` e do arquivo de lock (`package-lock.json` ou `yarn.lock`).
-   **Variável de Ambiente `GEMINI_API_KEY` no Vercel:**
    *   Você precisa obter uma chave de API do Google Gemini (Google AI Studio).
    *   Configure esta chave como uma variável de ambiente chamada `GEMINI_API_KEY` nas configurações do seu projeto no Vercel. **Não coloque a chave diretamente no código.**
-   **Deploy no Vercel:** Após configurar tudo, faça o deploy (ou redeploy) do seu projeto no Vercel para que a Serverless Function seja construída e ativada.

**Vantagens desta Abordagem:**
-   **Inteligência Real:** Utiliza o poder de um modelo de linguagem grande (LLM) real para respostas mais naturais, contextuais e inteligentes.
-   **Segurança da API Key:** Sua chave da API Gemini permanece segura no backend (ambiente Vercel) e não é exposta no frontend.
-   **Escalabilidade:** O Vercel gerencia a escalabilidade da Serverless Function.

**Considerações:**
-   **Custos:** O uso da API Gemini pode estar sujeito a custos, dependendo dos limites do plano gratuito e do volume de uso.
-   **Latência:** Haverá uma pequena latência de rede envolvida nas chamadas para a API Gemini.
-   **Conectividade:** O chat AI requer conexão com a internet para funcionar.
-   **Prompt Engineering:** A qualidade das respostas da Gemini dependerá significativamente de quão bem o prompt é construído no arquivo `api/chat.js`.
