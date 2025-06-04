// Arquivo: api/chat.js
// Este arquivo deve estar na pasta /api na raiz do seu projeto Vercel.

// Importa o SDK do Google GenAI.
// Certifique-se de que '@google/genai' está listado no seu package.json
const { GoogleGenAI } = require('@google/genai');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { userInput, context: financialContext } = req.body;

  if (!userInput) {
    return res.status(400).json({ message: '"userInput" é obrigatório no corpo da requisição.' });
  }

  // Obtenha a API Key da Gemini das variáveis de ambiente do Vercel
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("API Key da Gemini não configurada nas variáveis de ambiente (GEMINI_API_KEY).");
    return res.status(500).json({ message: "Erro de configuração do assistente: API Key ausente no servidor." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Construir o prompt para a Gemini
    // Você pode personalizar este prompt para ser mais específico e útil
    let contextString = "Dados Financeiros Atuais do Usuário:\n";
    if (financialContext) {
        if (financialContext.userSettings?.userName) {
            contextString += `- Nome do Usuário: ${financialContext.userSettings.userName}\n`;
        }
        if (financialContext.currentMonthData?.monthYear) {
            contextString += `- Mês Ativo: ${financialContext.currentMonthData.monthYear}\n`;
        }
        if (financialContext.monthlySummary) {
            contextString += `- Resumo do Mês:\n`;
            contextString += `  - Saldo Inicial: ${financialContext.currentMonthData?.openingBalance || 'Não informado'}\n`;
            contextString += `  - Total de Proventos: ${financialContext.monthlySummary.totalIncome || 0}\n`;
            contextString += `  - Total de Débitos: ${financialContext.monthlySummary.totalExpenses || 0}\n`;
            contextString += `  - Saldo do Mês (Economia): ${financialContext.monthlySummary.netSavings || 0}\n`;
            contextString += `  - Saldo Final em Conta: ${financialContext.monthlySummary.accountBalance || 0}\n`;
        }
        // Adicione mais detalhes do contexto financeiro conforme necessário
    } else {
        contextString = "Nenhum contexto financeiro adicional fornecido.\n";
    }
    
    const systemInstruction = `Você é um assistente financeiro especialista, amigável e prestativo.
    Sua principal função é analisar os dados financeiros fornecidos e responder às perguntas do usuário sobre sua situação financeira.
    Baseie suas respostas estritamente nos dados fornecidos. Não invente números ou informações.
    Se os dados forem insuficientes para uma resposta completa, informe isso ao usuário de forma educada.
    Forneça insights úteis e práticos quando possível. Mantenha as respostas concisas e claras.
    A moeda padrão é Real (R$) a menos que especificado de outra forma no contexto.
    `;

    const fullPrompt = `
    Contexto Financeiro:
    ${contextString}
    ---
    Pergunta do Usuário: "${userInput}"
    ---
    Com base no contexto financeiro acima, responda à pergunta do usuário.
    `;

    console.log("Enviando prompt para a Gemini:", fullPrompt);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17', // Modelo recomendado
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction,
            // Você pode adicionar outros parâmetros de configuração aqui, se necessário
            // Ex: temperature, topK, topP
        }
    });
    
    const aiResponseText = response.text;
    console.log("Resposta da Gemini recebida:", aiResponseText);

    if (!aiResponseText) {
        return res.status(500).json({ message: "Assistente não conseguiu gerar uma resposta." });
    }

    return res.status(200).json({ aiResponseText: aiResponseText });

  } catch (error) {
    console.error('Erro ao interagir com a API Gemini:', error);
    let errorMessage = 'Erro interno no servidor ao processar sua solicitação com a IA.';
    if (error.message) {
        errorMessage += ` Detalhes: ${error.message}`;
    }
    return res.status(500).json({ 
      message: errorMessage
    });
  }
}