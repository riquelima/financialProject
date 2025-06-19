import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import MonthNavigator from '../components/MonthNavigator';
import SummaryCard from '../components/SummaryCard';
import MonthlySummaryChart from '../components/MonthlySummaryChart';
import ExpensePieChart from '../components/ExpensePieChart';
import TransactionItem from '../components/TransactionItem';
import FloatingActionButton from '../components/FloatingActionButton';
import AddTransactionModal from '../components/AddTransactionModal';

export default function DashboardScreen() {
  const { 
    transactions, 
    getTotalIncome, 
    getTotalExpenses, 
    getNetSavings, 
    getAccountBalance,
    settings 
  } = useAppContext();

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const currency = settings?.currencySymbol || 'R$';
  
  const formatCurrency = (amount: number) => {
    return `${currency} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="dashboard-screen pb-20 md:pb-0">
      <MonthNavigator />
      
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in">
          <SummaryCard
            title="Saldo Atual"
            value={formatCurrency(getAccountBalance())}
            icon="fas fa-wallet"
            gradient="bg-gradient-to-r from-neon-cyan to-neon-purple"
            subtitle="Saldo atualizado"
          />
          
          <SummaryCard
            title="Economia Líquida"
            value={formatCurrency(getNetSavings())}
            icon="fas fa-piggy-bank"
            gradient="bg-gradient-to-r from-neon-green to-neon-cyan"
            subtitle={`${getNetSavings() >= 0 ? 'Economia positiva' : 'Déficit'}`}
            delay="0.1s"
          />
          
          <SummaryCard
            title="Receitas"
            value={formatCurrency(getTotalIncome())}
            icon="fas fa-arrow-up"
            gradient="bg-gradient-to-r from-neon-green to-neon-yellow"
            subtitle={`${transactions.filter(t => t.type === 'income').length} transações`}
            delay="0.2s"
          />
          
          <SummaryCard
            title="Despesas"
            value={formatCurrency(getTotalExpenses())}
            icon="fas fa-arrow-down"
            gradient="bg-gradient-to-r from-neon-red to-neon-purple"
            subtitle={`${transactions.filter(t => t.type === 'expense').length} transações`}
            delay="0.3s"
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
          <MonthlySummaryChart />
          <ExpensePieChart />
        </div>
        
        {/* Recent Transactions Section */}
        <div className="glass-effect p-6 rounded-xl neon-glow fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neon-cyan">Transações Recentes</h3>
            <button className="text-sm text-neon-cyan hover:text-neon-purple transition-colors">
              Ver todas <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </div>
          
          <div className="space-y-3 custom-scrollbar max-h-64 overflow-y-auto">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <i className="fas fa-inbox text-4xl mb-4"></i>
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm">Adicione sua primeira transação para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <FloatingActionButton
          onClick={() => setIsAddTransactionOpen(true)}
          icon="fas fa-plus"
          size="lg"
        />
      </div>

      {/* Modals */}
      <AddTransactionModal 
        isOpen={isAddTransactionOpen} 
        onClose={() => setIsAddTransactionOpen(false)} 
      />
    </div>
  );
}
