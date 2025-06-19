export const APP_NAME = 'Controle Financeiro v2';

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const PIE_CHART_COLORS = [
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

export const COLORS = {
  NEON_CYAN: '#00D4FF',
  NEON_PURPLE: '#7C3AED',
  DARK_PRIMARY: '#0F0F23',
  DARK_SECONDARY: '#1A1A2E',
  DARK_TERTIARY: '#16213E',
  NEON_GREEN: '#00FF88',
  NEON_RED: '#FF4757',
  NEON_YELLOW: '#FFA502',
};

// SVG Icons as React components
export const Icons = {
  Dashboard: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  ),
  
  History: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  
  Settings: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  
  Plus: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  
  Robot: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h2.114a4 4 0 001.787-.422l.05-.025A2 2 0 0014 15.764v-5.43A2 2 0 0016 8.333V7a1 1 0 011-1 3 3 0 003 3v4.5a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 010 13.5V9a3 3 0 013-3 1 1 0 011 1v1.333A2 2 0 016 10.333z"/>
    </svg>
  )
};
