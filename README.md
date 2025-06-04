
# Aplicativo de Controle Financeiro Pessoal

Este é um aplicativo web para controle financeiro pessoal.

## Assistente Financeiro AI (Simulação Frontend Avançada)

O "Assistente Financeiro AI" neste aplicativo é uma **simulação avançada que roda inteiramente no frontend**. Ele não se conecta a nenhuma API de inteligência artificial externa (como Google Gemini) nem utiliza um backend/proxy para processamento.

**Como Funciona:**
1.  Quando o usuário interage com o chat do assistente (componente `AiChatModal.tsx`):
    *   A entrada do usuário é processada localmente.
    *   Uma lógica de simulação robusta (`getSimulatedAiResponse` dentro de `AiChatModal.tsx`) analisa a pergunta do usuário e o `financialContext` (que contém os dados financeiros do usuário carregados no aplicativo para o mês ativo, como saldo, transações, resumos, categorias, etc.).
    *   Com base nessa análise, uma resposta é gerada e exibida no chat.
2.  A simulação agora pode responder a uma gama mais ampla de perguntas sobre os dados financeiros do usuário, incluindo:
    *   Informações sobre saldo (atual, inicial, economia do mês).
    *   Totais de proventos e débitos.
    *   Listagem de transações recentes (entradas, saídas, ou todas).
    *   Gastos ou proventos em categorias específicas (ex: "Quanto gastei com alimentação?").
    *   Identificação da maior despesa ou maior provento do mês.
    *   Informações sobre cartão de crédito (gastos, limite total, limite restante), se disponíveis.
    *   Cálculos simples, como a porcentagem de gastos em uma categoria específica em relação ao total de débitos.
    *   Oferecer algumas dicas financeiras genéricas e pré-definidas.
    *   Interações mais personalizadas usando o nome do usuário.
3.  Um pequeno atraso é simulado para tornar a interação mais parecida com um chat real.

**Vantagens desta Abordagem:**
-   **Simplicidade de Implementação (sem backend):** Não requer configuração de backend, API Keys externas, ou gerenciamento de proxy.
-   **Privacidade:** Os dados financeiros do usuário permanecem no frontend e não são enviados para serviços externos para esta funcionalidade de chat.
-   **Funcionamento Offline:** O chat simulado funcionará mesmo se o usuário estiver offline (após o carregamento inicial do aplicativo e dos dados).
-   **Respostas Rápidas:** Como tudo é processado localmente, as respostas são rápidas (após o atraso simulado).

**Limitações:**
-   A "inteligência" do assistente, embora significativamente melhorada, ainda é limitada pela lógica de simulação implementada (condicionais, correspondência de palavras-chave, etc.). Ele não possui capacidades de aprendizado de máquina ou o processamento de linguagem natural (PLN) profundo de um modelo de linguagem grande (LLM) como o Gemini.
-   Seu conhecimento é restrito aos dados presentes no `financialContext` para o **mês ativo**. Não pode responder sobre outros meses ou fazer análises históricas complexas.
-   Para adicionar novas perguntas, respostas ou lógicas mais complexas, o código da função `getSimulatedAiResponse` precisa ser modificado diretamente.

Esta abordagem foi mantida e aprimorada para fornecer uma funcionalidade de chat interativa e útil, focada nos dados financeiros do usuário, sem a complexidade de integrações de backend.
