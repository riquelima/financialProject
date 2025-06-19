interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
  gradient: string;
  subtitle?: string;
  delay?: string;
}

export default function SummaryCard({ 
  title, 
  value, 
  icon, 
  gradient, 
  subtitle,
  delay = '0s'
}: SummaryCardProps) {
  return (
    <div 
      className="glass-effect p-6 rounded-xl neon-glow floating-animation"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${gradient}`}>
          <i className={`${icon} text-white`}></i>
        </div>
        <span className="text-sm text-gray-400">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}
