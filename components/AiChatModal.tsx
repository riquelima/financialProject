

import React, { useState, useEffect, useRef } from 'react';
import { XIcon, SendIcon, RobotIcon, COLORS } from '../constants';
import { Transaction, TransactionType } from '../types'; 

interface FinancialContext {
  currentMonthData?: {
    openingBalance?: number;
    creditCardLimit?: number;
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

const PROXY_API_CHAT_URL = '/api/chat'; 

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
            text: `Olá${userName ? ' ' + userName : ''}! Sou seu assistente financeiro AI. Como posso te ajudar hoje?`, 
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
  }, [isOpen, financialContext.userSettings?.userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    try {
      const response = await fetch(PROXY_API_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: trimmedInput,
          context: financialContext, 
        }),
      });

      setIsLoadingAiResponse(false);

      if (!response.ok) {
        let errorData = { message: `Erro HTTP: ${response.status}` };
        try {
            const errJson = await response.json();
            errorData.message = errJson.message || errJson.error || errorData.message;
        } catch (e) {
            errorData.message = `Erro HTTP: ${response.status} - ${response.statusText || 'Falha ao buscar resposta da IA.'}`;
        }
        throw new Error(errorData.message);
      }

      const data = await response.json();
      
      if (data.aiResponseText) {
        const aiMessage: Message = { 
          id: Date.now().toString() + '-ai', 
          text: data.aiResponseText, 
          sender: 'ai', 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("Resposta da IA não continha o texto esperado.");
      }

    } catch (error: any) {
      console.error("Erro ao enviar mensagem para o proxy ou processar resposta:", error);
      setIsLoadingAiResponse(false);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: `Desculpe, ocorreu um erro: ${error.message || 'Não foi possível conectar ao assistente.'}`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
        inputRef.current?.focus();
    }
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
      className="fixed inset-0 z-[70] flex flex-col transition-opacity duration-300 ease-in-out"
      style={{ backgroundColor: 'var(--primary-bg)', opacity: isOpen ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chat-modal-title"
    >
      <header 
        className="flex items-center justify-between p-4"
        style={{ backgroundColor: 'var(--secondary-bg)', borderBottom: '1px solid var(--card-border-light)'}}
      >
        <div className="flex items-center">
          <RobotIcon className="w-7 h-7 mr-2 gradient-text"/>
          <h2 id="ai-chat-modal-title" className="text-xl font-semibold gradient-text">
            Assistente Financeiro AI
          </h2>
        </div>
        <button 
          onClick={onClose} 
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-full hover:bg-[var(--tertiary-bg)]"
          aria-label="Fechar chat"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`p-3 rounded-xl max-w-[80%] md:max-w-[70%] break-words shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-[var(--amethyst-purple)] text-white rounded-br-none' 
                  : 'rounded-bl-none border'
              }`}
              style={ msg.sender === 'ai' ? { backgroundColor: 'var(--tertiary-bg)', color: 'var(--text-primary)', borderColor: 'var(--card-border-light)'} : {}}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-purple-200 text-right' : 'text-[var(--text-secondary)] text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoadingAiResponse && (
          <div className="flex justify-start">
             <div className="p-3 rounded-lg rounded-bl-none max-w-[70%]" style={{backgroundColor: 'var(--tertiary-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border-light)'}}>
                <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse " style={{animationDelay: '0.075s'}}></div>
                    <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse " style={{animationDelay: '0.15s'}}></div>
                    <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-pulse " style={{animationDelay: '0.3s'}}></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div 
        className="p-3 sm:p-4 flex items-end"
        style={{ backgroundColor: 'var(--secondary-bg)', borderTop: '1px solid var(--card-border-light)'}}
      >
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          rows={1}
          className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--input-focus-border)] focus:border-[var(--input-focus-border)] resize-none input-neon-focus placeholder-[var(--placeholder-text)] text-sm max-h-24 overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoadingAiResponse || inputValue.trim() === ''}
          className="ml-2 sm:ml-3 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--secondary-bg)] focus:ring-[var(--electric-blue)] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
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