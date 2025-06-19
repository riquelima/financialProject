import { useState, useRef, useEffect } from 'react';
import { Modal } from './ui/modal';
import { useAppContext } from '../hooks/useAppContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiChatModal({ isOpen, onClose }: AiChatModalProps) {
  const { transactions, getTotalIncome, getTotalExpenses, getCategoryTotals, settings } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente financeiro. Posso ajudá-lo a analisar seus gastos, identificar padrões e sugerir melhorias para suas finanças. Como posso ajudá-lo hoje?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare financial data for AI
      const financialData = {
        totalIncome: getTotalIncome(),
        totalExpenses: getTotalExpenses(),
        netSavings: getTotalIncome() - getTotalExpenses(),
        transactionCount: transactions.length,
        categoryTotals: getCategoryTotals(),
        currencySymbol: settings?.currencySymbol || 'R$',
        transactions: transactions.slice(0, 10) // Send only recent transactions for context
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          financialData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl h-5/6">
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon-cyan border-opacity-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center">
              <i className="fas fa-robot text-white"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-neon-cyan">Assistente Financeiro</h2>
              <p className="text-sm text-gray-400">Seu consultor pessoal de finanças</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-times text-gray-400"></i>
          </button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-6 custom-scrollbar overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' ? (
                <div className="ai-chat-bubble p-4 rounded-lg max-w-3xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="text-gray-200 whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-xs lg:max-w-md bg-neon-cyan bg-opacity-20 p-4 rounded-lg">
                  <p className="text-gray-200">{message.text}</p>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="ai-chat-bubble p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input */}
        <div className="p-6 border-t border-neon-cyan border-opacity-20">
          <div className="flex space-x-3">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 rounded-lg glass-effect text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              placeholder="Digite sua pergunta sobre finanças..."
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 btn-neon rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <div className="flex items-center space-x-4 mt-3">
            <button 
              onClick={() => sendSuggestion('Como estão meus gastos este mês?')}
              className="text-sm text-gray-400 hover:text-neon-cyan transition-colors"
            >
              💡 Analisar gastos mensais
            </button>
            <button 
              onClick={() => sendSuggestion('Que dicas você tem para eu economizar mais dinheiro?')}
              className="text-sm text-gray-400 hover:text-neon-cyan transition-colors"
            >
              📊 Dicas de economia
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
