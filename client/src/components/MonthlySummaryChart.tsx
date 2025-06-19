import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { useAppContext } from '../hooks/useAppContext';

Chart.register(...registerables);

export default function MonthlySummaryChart() {
  const { getTotalIncome, getTotalExpenses, settings } = useAppContext();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const income = getTotalIncome();
    const expenses = getTotalExpenses();
    const currency = settings?.currencySymbol || 'R$';

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          data: [income, expenses],
          backgroundColor: [
            'rgba(0, 255, 136, 0.8)',
            'rgba(255, 71, 87, 0.8)'
          ],
          borderColor: [
            '#00FF88',
            '#FF4757'
          ],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#EAEAEA',
              callback: function(value) {
                return `${currency} ${Number(value).toLocaleString('pt-BR')}`;
              }
            },
            grid: {
              color: 'rgba(0, 212, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#EAEAEA'
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [getTotalIncome, getTotalExpenses, settings]);

  return (
    <div className="glass-effect p-6 rounded-xl neon-glow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-neon-cyan">Resumo Mensal</h3>
        <button className="text-sm text-gray-400 hover:text-neon-cyan transition-colors">
          <i className="fas fa-expand-alt"></i>
        </button>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
