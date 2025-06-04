
import React, { useState, useEffect, useRef } from 'react';
import { XIcon, SendIcon, RobotIcon, COLORS } from '../constants';
import { formatCurrency, formatDate } from '../utils/formatters'; 
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types'; 

interface FinancialContext {
  currentMonthData?: {
    openingBalance?: number;
    creditCardLimit?: number;
    // other fields if present in MonthData that could be useful
  };
  allTransactions?: Transaction[]; 
  monthlySummary?: {
    totalIncome?: number;
    totalExpenses?: number;
    netSavings?: number;
    accountBalance?: number;
    creditCardSpent?: number;
    creditCardRemainingLimit?: number;
    totalBenefits?: number; 
  };
  userSettings?: {
    currencySymbol?: string;
    userName?: string;
  };
}
interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialContext: FinancialContext;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose, financialContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (messages.length === 0) {
        const userName = financialContext.userSettings?.userName;
        setMessages([
          { 
            id: Date.now().toString(), 
            text: `Olá${userName ? ' ' + userName : ''}! Sou seu assistente financeiro simulado. Tenho acesso aos seus dados carregados no app para o mês ativo. Como posso te ajudar hoje?`, 
            sender: 'ai',
            timestamp: new Date()
          }
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, financialContext.userSettings?.userName]); // Added userName to dependency

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enhanced AI Simulation Logic
  const getSimulatedAiResponse = (userInput: string, context: FinancialContext): string => {
    const lowerInput = userInput.toLowerCase().trim();
    const { monthlySummary, allTransactions = [], userSettings, currentMonthData } = context;
    const currency = userSettings?.currencySymbol || 'R$';
    const userName = userSettings?.userName || 'usuário';

    if (!monthlySummary && allTransactions.length === 0) {
        return "Parece que ainda não tenho acesso aos seus dados financeiros para o mês ativo. Por favor, verifique se os dados foram carregados.";
    }

    // Helper function to extract category from input
    const extractCategory = (input: string, categories: string[]): string | null => {
        for (const cat of categories) {
            if (input.includes(cat.toLowerCase())) {
                return cat;
            }
        }
        // Try partial match for common terms if direct match fails
        if (input.includes("alimentacao") || input.includes("comida")) return "Alimentação (Supermercado/Outros)";
        if (input.includes("cartao de credito") || input.includes("cartão")) return "Cartão de Crédito";
        if (input.includes("salario")) return "Salário";
        return null;
    };
    
    // Helper to extract number
    const extractNumber = (input: string, defaultValue: number = 5): number => {
        const match = input.match(/\d+/);
        return match ? parseInt(match[0], 10) : defaultValue;
    };

    // Greetings and basic interactions
    if (lowerInput.match(/^(olá|oi|ei|opa|e aí|salve)\b/)) {
        const greetings = [`Olá, ${userName}! Como posso ajudar com suas finanças hoje?`, `Oi, ${userName}! Pronto para analisar seus números?`, `E aí, ${userName}! O que você gostaria de saber sobre suas finanças?`];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    if (lowerInput.includes("meu nome")) {
        return `Seu nome é ${userName}, de acordo com as configurações.`;
    }

    // Summary queries
    if (lowerInput.includes("qual meu saldo") || lowerInput.includes("saldo atual") || lowerInput.includes("saldo em conta")) {
      if (monthlySummary?.accountBalance !== undefined) {
        return `Seu saldo final em conta para o mês ativo é ${formatCurrency(monthlySummary.accountBalance, currency)}.`;
      }
      return "Não consegui encontrar seu saldo em conta atual para este mês.";
    }
    if (lowerInput.includes("saldo inicial")) {
        if (currentMonthData?.openingBalance !== undefined) {
            return `Seu saldo inicial para este mês foi ${formatCurrency(currentMonthData.openingBalance, currency)}.`;
        }
        return "Não consegui encontrar o saldo inicial para este mês.";
    }
    if (lowerInput.includes("quanto gastei") || lowerInput.includes("total de débitos") || lowerInput.includes("total de despesas")) {
      if (monthlySummary?.totalExpenses !== undefined) {
        return `Seu total de débitos no mês ativo é ${formatCurrency(monthlySummary.totalExpenses, currency)}.`;
      }
      return "Não encontrei seu total de débitos para este mês.";
    }
    if (lowerInput.includes("quanto ganhei") || lowerInput.includes("total de proventos") || lowerInput.includes("minha renda") || lowerInput.includes("total de receitas")) {
      if (monthlySummary?.totalIncome !== undefined) {
        return `Seu total de proventos no mês ativo é ${formatCurrency(monthlySummary.totalIncome, currency)}.`;
      }
      return "Não encontrei seu total de proventos para este mês.";
    }
    if (lowerInput.includes("economizei") || lowerInput.includes("quanto sobrou") || lowerInput.includes("saldo do mês")) {
        if (monthlySummary?.netSavings !== undefined) {
            if (monthlySummary.netSavings > 0) {
                return `Você economizou ${formatCurrency(monthlySummary.netSavings, currency)} este mês. Ótimo trabalho!`;
            } else if (monthlySummary.netSavings < 0) {
                return `Este mês, seus gastos ultrapassaram seus proventos em ${formatCurrency(Math.abs(monthlySummary.netSavings), currency)}.`;
            } else {
                return `Seus proventos e débitos se igualaram este mês, resultando em ${formatCurrency(0, currency)} de economia.`;
            }
        }
        return "Não consegui calcular sua economia para este mês.";
    }

    // Transaction queries
    const expenses = allTransactions.filter(t => t.type === TransactionType.EXPENSE);
    const incomes = allTransactions.filter(t => t.type === TransactionType.INCOME);

    if (lowerInput.includes("maior gasto") || lowerInput.includes("maior despesa")) {
      if (expenses.length > 0) {
        const biggestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];
        return `Sua maior despesa no mês foi "${biggestExpense.description}" na categoria "${biggestExpense.category}", no valor de ${formatCurrency(biggestExpense.amount, currency)}.`;
      }
      return "Você não tem despesas registradas este mês para eu analisar a maior.";
    }
    if (lowerInput.includes("maior entrada") || lowerInput.includes("maior provento") || lowerInput.includes("maior receita")) {
      if (incomes.length > 0) {
        const biggestIncome = [...incomes].sort((a, b) => b.amount - a.amount)[0];
        return `Seu maior provento no mês foi "${biggestIncome.description}" na categoria "${biggestIncome.category}", no valor de ${formatCurrency(biggestIncome.amount, currency)}.`;
      }
      return "Você não tem proventos registrados este mês para eu analisar o maior.";
    }

    // Listing transactions
    const listTransactions = (transactionsToList: Transaction[], typeName: string, count: number): string => {
        if (transactionsToList.length > 0) {
            let response = `Aqui estão suas ${Math.min(count, transactionsToList.length)} últimas transações de ${typeName} do mês:\n`;
            transactionsToList.slice(0, count).forEach(t => {
                response += `\n• ${formatDate(t.date)}: ${t.description} (${t.category}) - ${formatCurrency(t.amount, currency)}`;
            });
            if (transactionsToList.length > count) response += `\nE mais ${transactionsToList.length - count} outras...`;
            return response;
        }
        return `Você não tem transações de ${typeName} registradas este mês.`;
    };

    if (lowerInput.match(/listar (minhas |as )?(\d+ )?(últimas )?(despesas|débitos|saídas)/)) {
        const count = extractNumber(lowerInput);
        return listTransactions(expenses, "saída", count);
    }
    if (lowerInput.match(/listar (minhas |as )?(\d+ )?(últimas )?(entradas|proventos|receitas)/)) {
        const count = extractNumber(lowerInput);
        return listTransactions(incomes, "entrada", count);
    }
    if (lowerInput.match(/listar (minhas |as )?(\d+ )?(últimas )?transações/)) {
        const count = extractNumber(lowerInput);
        if (allTransactions.length > 0) {
             let response = `Aqui estão suas ${Math.min(count, allTransactions.length)} últimas transações do mês:\n`;
            allTransactions.slice(0, count).forEach(t => {
                 response += `\n• ${formatDate(t.date)}: ${t.description} (${t.type === TransactionType.INCOME ? 'Entrada' : 'Saída'} / ${t.category}) - ${formatCurrency(t.amount, currency)}`;
            });
            if (allTransactions.length > count) response += `\nE mais ${allTransactions.length - count} outras...`;
            return response;
        }
       return "Você não tem transações registradas este mês.";
    }
    
    // Category-specific queries
    const askedCategoryExpense = extractCategory(lowerInput, EXPENSE_CATEGORIES);
    if ((lowerInput.includes("quanto gastei com") || lowerInput.includes("gastos em") || lowerInput.includes("despesas de")) && askedCategoryExpense) {
        const categoryExpenses = expenses.filter(t => t.category.toLowerCase() === askedCategoryExpense.toLowerCase());
        const totalCategoryExpense = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);
        if (totalCategoryExpense > 0) {
            let response = `Você gastou ${formatCurrency(totalCategoryExpense, currency)} com ${askedCategoryExpense} este mês.`;
            if (monthlySummary?.totalExpenses && monthlySummary.totalExpenses > 0) {
                const percentage = (totalCategoryExpense / monthlySummary.totalExpenses) * 100;
                response += ` Isso representa ${percentage.toFixed(1)}% do seu total de débitos.`;
            }
            if (categoryExpenses.length > 0) {
                response += `\nPrincipais gastos em ${askedCategoryExpense}:\n`;
                categoryExpenses.slice(0,3).forEach(t => {
                     response += `\n• ${formatDate(t.date)}: ${t.description} - ${formatCurrency(t.amount, currency)}`;
                });
                 if (categoryExpenses.length > 3) response += `\nE mais ${categoryExpenses.length - 3} outros...`;
            }
            return response;
        }
        return `Não encontrei gastos na categoria "${askedCategoryExpense}" este mês.`;
    }

    const askedCategoryIncome = extractCategory(lowerInput, INCOME_CATEGORIES);
     if ((lowerInput.includes("quanto recebi de") || lowerInput.includes("entradas de") || lowerInput.includes("proventos de")) && askedCategoryIncome) {
        const categoryIncomes = incomes.filter(t => t.category.toLowerCase() === askedCategoryIncome.toLowerCase());
        const totalCategoryIncome = categoryIncomes.reduce((sum, t) => sum + t.amount, 0);
        if (totalCategoryIncome > 0) {
             let response = `Você recebeu ${formatCurrency(totalCategoryIncome, currency)} de ${askedCategoryIncome} este mês.`;
             if (categoryIncomes.length > 0) {
                response += `\nDetalhes:\n`;
                categoryIncomes.slice(0,3).forEach(t => {
                     response += `\n• ${formatDate(t.date)}: ${t.description} - ${formatCurrency(t.amount, currency)}`;
                });
                 if (categoryIncomes.length > 3) response += `\nE mais ${categoryIncomes.length - 3} outros...`;
            }
            return response;
        }
        return `Não encontrei proventos na categoria "${askedCategoryIncome}" este mês.`;
    }

    // Credit Card queries
    if (lowerInput.includes("cartão de crédito") || lowerInput.includes("cartao")) {
        if (currentMonthData?.creditCardLimit === undefined && monthlySummary?.creditCardSpent === 0) {
            return "Parece que você não configurou um limite de cartão de crédito ou não teve gastos no cartão este mês.";
        }
        let response = "Sobre seu cartão de crédito este mês:\n";
        if (monthlySummary?.creditCardSpent !== undefined) {
            response += `\n• Gasto Total: ${formatCurrency(monthlySummary.creditCardSpent, currency)}`;
        }
        if (currentMonthData?.creditCardLimit !== undefined) {
            response += `\n• Limite Total: ${formatCurrency(currentMonthData.creditCardLimit, currency)}`;
        }
        if (monthlySummary?.creditCardRemainingLimit !== undefined) {
            response += `\n• Limite Restante: ${formatCurrency(monthlySummary.creditCardRemainingLimit, currency)}`;
        }
        return response.trim() === "Sobre seu cartão de crédito este mês:" ? "Não tenho informações detalhadas sobre seu cartão de crédito para este mês." : response;
    }
    
    // Financial Tips (Simple examples)
    if (lowerInput.includes("dica") || lowerInput.includes("conselho") || lowerInput.includes("sugestão")) {
        const tips = [
            "Lembre-se de revisar seus gastos regularmente para identificar áreas onde pode economizar.",
            "Considere criar um orçamento mensal para melhor controle financeiro.",
            "Tente poupar uma porcentagem da sua renda todo mês, mesmo que seja um valor pequeno.",
            `Olá ${userName}, uma dica: sempre compare preços antes de grandes compras!`,
            "Manter um fundo de emergência é uma ótima prática financeira."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    // Thank you / closing
    if (lowerInput.match(/\b(obrigad[oa]|valeu|grato|agradeço|tchau|até mais|flw)\b/)) {
        const farewells = ["De nada! Se precisar de mais alguma coisa, é só chamar. 😉", "Disponha! Estou aqui para ajudar.", "Até a próxima!"];
        return farewells[Math.floor(Math.random() * farewells.length)];
    }

    // Fallback response
    const fallbackResponses = [
        "Desculpe, não entendi bem o que você quis dizer. Poderia tentar perguntar de outra forma?",
        "Não tenho certeza de como responder a isso. Que tal perguntar sobre seu saldo, despesas, ou listar algumas transações?",
        `Hmm, ${userName}, essa pergunta é um pouco complexa para mim no momento. Posso te ajudar com informações sobre seus gastos mensais, proventos, saldo em conta, ou detalhes de transações.`,
        "Posso te ajudar a verificar seu saldo, listar suas despesas ou proventos, ou te dar dicas financeiras gerais. Como posso ser útil?"
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoadingAiResponse) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInput,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoadingAiResponse(true);

    // Simular resposta da IA
    setTimeout(() => {
      const aiText = getSimulatedAiResponse(trimmedInput, financialContext);
      const aiMessage: Message = { 
        id: Date.now().toString() + '-ai', 
        text: aiText, 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoadingAiResponse(false);
      inputRef.current?.focus();
    }, 700 + Math.random() * 800); // Simula um atraso de 0.7-1.5 segundos
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] bg-[var(--absolute-black)] flex flex-col transition-opacity duration-300 ease-in-out"
      style={{ opacity: isOpen ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chat-modal-title"
    >
      {/* Header */}
      <header 
        className="flex items-center justify-between p-4"
        style={{ backgroundColor: 'var(--deep-gray-2)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}
      >
        <div className="flex items-center">
          <RobotIcon className="w-7 h-7 mr-2 gradient-text"/>
          <h2 id="ai-chat-modal-title" className="text-xl font-semibold gradient-text">
            Assistente Financeiro AI
          </h2>
        </div>
        <button 
          onClick={onClose} 
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-full hover:bg-[var(--deep-gray-1)]"
          aria-label="Fechar chat"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`p-3 rounded-xl max-w-[80%] md:max-w-[70%] break-words shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-[var(--amethyst-purple)] text-white rounded-br-none' 
                  : 'bg-[var(--deep-gray-2)] text-[var(--text-primary)] rounded-bl-none border border-[rgba(255,255,255,0.08)]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-purple-200 text-right' : 'text-slate-500 text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoadingAiResponse && (
          <div className="flex justify-start">
             <div className="p-3 rounded-lg rounded-bl-none max-w-[70%] bg-[var(--deep-gray-2)] text-[var(--text-primary)] border border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse " style={{animationDelay: '0.075s'}}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse " style={{animationDelay: '0.15s'}}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse " style={{animationDelay: '0.3s'}}></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div 
        className="p-3 sm:p-4 flex items-end"
        style={{ backgroundColor: 'var(--deep-gray-2)', borderTop: '1px solid rgba(255,255,255,0.1)'}}
      >
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          rows={1}
          className="flex-1 bg-[var(--deep-gray-1)] border border-[rgba(255,255,255,0.15)] rounded-lg p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--electric-blue)] focus:border-[var(--electric-blue)] resize-none input-neon-focus placeholder-[var(--placeholder-text-color)] text-sm max-h-24 overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoadingAiResponse || inputValue.trim() === ''}
          className="ml-2 sm:ml-3 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--deep-gray-2)] focus:ring-[var(--electric-blue)] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          style={{ background: COLORS.gradientAiChatSend }}
          aria-label="Enviar mensagem"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AiChatModal;
