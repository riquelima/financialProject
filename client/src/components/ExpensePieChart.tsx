import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { useAppContext } from '../hooks/useAppContext';
import { CATEGORY_LABELS } from '../types';

Chart.register(...registerables);

const PIE_COLORS = [
  '#00D4FF', // neon-cyan
  '#7C3AED', // neon-purple
  '#00FF88', // neon-green
  '#FFA502', // neon-yellow
  '#FF4757', // neon-red
  '#2F3542', // dark
  '#57606F', // gray
  '#3742FA', // blue
  '#FF6B6B', // light red
  '#4834D4', // purple
];

export default function ExpensePieChart() {
  const { getCategoryTotals, settings } = useAppContext();
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

    const categoryTotals = getCategoryTotals();
    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    if (categories.length === 0) {
      return;
    }

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: categories.map(cat => CATEGORY_LABELS[cat] || cat),
        datasets: [{
          data: amounts,
          backgroundColor: PIE_COLORS,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#EAEAEA',
              padding: 20,
              usePointStyle: true
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
  }, [getCategoryTotals, settings]);

  return (
    <div className="glass-effect p-6 rounded-xl neon-glow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-neon-cyan">Distribuição de Gastos</h3>
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
