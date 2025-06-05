// File: api/chat.js
// This is a Vercel Serverless Function
// To use it:
// 1. Make sure this file is in the 'api' directory at the root of your project.
// 2. Ensure '@google/genai' is in your package.json dependencies.
//    Run: npm install @google/genai  OR  yarn add @google/genai
// 3. Set the GEMINI_API_KEY environment variable in your Vercel project settings.

const { GoogleGenAI } = require('@google/genai');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { userInput, context } = req.body;

  if (!userInput) {
    return res.status(400).json({ message: 'userInput is required.' });
  }
  if (!context) {
    return res.status(400).json({ message: 'financialContext is required.' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("API Key da Gemini não configurada nas variáveis de ambiente do Vercel!");
    return res.status(500).json({ message: 'Erro de configuração do assistente: Chave da API ausente no servidor.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Construct a detailed prompt for Gemini
    let financialPrompt = "Você é um assistente financeiro prestativo. Analise o seguinte contexto financeiro e responda à pergunta do usuário.\n\n";
    financialPrompt += "Contexto Financeiro do Usuário:\n";

    if (context.userSettings) {
      if (context.userSettings.userName) financialPrompt += `- Nome: ${context.userSettings.userName}\n`;
      if (context.userSettings.currencySymbol) financialPrompt += `- Moeda: ${context.userSettings.currencySymbol}\n`;
    }

    if (context.monthlySummary) {
      financialPrompt += "\nResumo do Mês Ativo:\n";
      if (context.monthlySummary.totalIncome !== undefined) financialPrompt += `  - Total de Proventos: ${context.userSettings.currencySymbol}${context.monthlySummary.totalIncome.toFixed(2)}\n`;
      if (context.monthlySummary.totalExpenses !== undefined) financialPrompt += `  - Total de Débitos: ${context.userSettings.currencySymbol}${context.monthlySummary.totalExpenses.toFixed(2)}\n`;
      if (context.monthlySummary.netSavings !== undefined) financialPrompt += `  - Economia Líquida: ${context.userSettings.currencySymbol}${context.monthlySummary.netSavings.toFixed(2)}\n`;
      if (context.monthlySummary.accountBalance !== undefined) financialPrompt += `  - Saldo Final em Conta: ${context.userSettings.currencySymbol}${context.monthlySummary.accountBalance.toFixed(2)}\n`;
      if (context.currentMonthData?.openingBalance !== undefined) financialPrompt += `  - Saldo Inicial do Mês: ${context.userSettings.currencySymbol}${context.currentMonthData.openingBalance.toFixed(2)}\n`;
    }
    
    if (context.currentMonthData?.creditCardLimit !== undefined) {
      financialPrompt += "\nInformações do Cartão de Crédito:\n";
      financialPrompt += `  - Limite Total: ${context.userSettings.currencySymbol}${context.currentMonthData.creditCardLimit.toFixed(2)}\n`;
      if (context.monthlySummary?.creditCardSpent !== undefined) financialPrompt += `  - Gasto no Cartão: ${context.userSettings.currencySymbol}${context.monthlySummary.creditCardSpent.toFixed(2)}\n`;
      if (context.monthlySummary?.creditCardRemainingLimit !== undefined) financialPrompt += `  - Limite Restante: ${context.userSettings.currencySymbol}${context.monthlySummary.creditCardRemainingLimit.toFixed(2)}\n`;
    }

    if (context.allTransactions && context.allTransactions.length > 0) {
      financialPrompt += "\nAlgumas Transações Recentes (máx 5):\n";
      context.allTransactions.slice(0, 5).forEach(t => {
        financialPrompt += `  - ${t.date} (${t.type === 'income' ? 'Entrada' : 'Saída'}): ${t.description} (${t.category}) - ${context.userSettings.currencySymbol}${t.amount.toFixed(2)}\n`;
      });
    }
    financialPrompt += "\n---";
    financialPrompt += `\nPergunta do Usuário: "${userInput}"`;
    financialPrompt += "\n---";
    financialPrompt += "\nResponda de forma concisa e útil, usando o contexto fornecido. Se os dados forem insuficientes, informe educadamente.";

    const modelInstruction = "Você é um assistente financeiro especialista e amigável. Sua função é analisar os dados financeiros fornecidos e responder às perguntas do usuário sobre sua situação financeira. Baseie suas respostas estritamente nos dados fornecidos. Não invente números ou informações. Seja direto e claro.";

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17", // Using the recommended model
        contents: financialPrompt,
        config: {
            systemInstruction: modelInstruction,
            // thinkingConfig: { thinkingBudget: 0 } // Optional: for lower latency if needed
        }
    });

    const aiResponseText = response.text;

    if (!aiResponseText) {
        console.error("Gemini API retornou uma resposta vazia.");
        return res.status(500).json({ message: "O assistente AI não conseguiu gerar uma resposta no momento." });
    }
    
    return res.status(200).json({ aiResponseText });

  } catch (error) {
    console.error('Erro ao interagir com a API Gemini:', error);
    let errorMessage = 'Falha ao se comunicar com o assistente AI.';
    if (error.message) {
        errorMessage += ` Detalhe: ${error.message}`;
    }
    // Check for specific Google API errors if possible, e.g., auth or quota
    // error.toString() might contain more info
    return res.status(500).json({ message: errorMessage, details: error.toString() });
  }
}