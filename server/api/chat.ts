import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Request, Response } from "express";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, financialData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = `Você é um assistente financeiro especialista e amigável. Sua função é analisar os dados financeiros fornecidos e responder às perguntas do usuário sobre sua situação financeira. Baseie suas respostas estritamente nos dados fornecidos. Não invente números ou informações. Seja direto e claro.

Dados financeiros do usuário: ${JSON.stringify(financialData || {})}`;

    const prompt = `${systemInstruction}\n\nPergunta do usuário: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ 
      error: 'Erro ao processar sua pergunta. Tente novamente.' 
    });
  }
}
