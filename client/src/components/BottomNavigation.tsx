import { useLocation } from 'wouter';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'fas fa-home' },
    { name: 'Histórico', href: '/history', icon: 'fas fa-history' },
    { name: 'Config', href: '/settings', icon: 'fas fa-cog' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-neon-cyan border-opacity-20 md:hidden z-40">
      <div className="flex justify-around py-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => setLocation(item.href)}
            className={`flex flex-col items-center p-2 transition-colors
              ${location === item.href 
                ? 'text-neon-cyan' 
                : 'text-gray-400 hover:text-neon-cyan'
              }`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
