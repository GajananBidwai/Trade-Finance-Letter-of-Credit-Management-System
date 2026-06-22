import { NavLink, useNavigate } from 'react-router-dom';

export const SideNavBar = () => {
  const navigate = useNavigate();
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/' },
    { name: 'Workflow', icon: 'account_tree', path: '/workflow' },
    { name: 'AI Hub', icon: 'smart_toy', path: '/ai-hub' },
    { name: 'Reports', icon: 'assessment', path: '/reports' },
    { name: 'Users', icon: 'group', path: '/users' },
    { name: 'RBAC Settings', icon: 'admin_panel_settings', path: '/rbac' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] border-r border-outline-variant/10 backdrop-blur-xl shadow-2xl flex flex-col p-2 z-50 bg-surface dark:bg-surface-dim">
      <div className="mb-8 px-4 py-6">
        <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary">TradeFinance AI</h1>
        <p className="font-body-md text-body-md text-on-surface-variant opacity-60">Global Operations</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors active:scale-95 duration-200 rounded-r-lg ${
                isActive
                  ? 'text-primary bg-primary-container/10 border-l-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body-md text-body-md">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-surface-container-low border-t border-outline-variant/10">
        <button 
          onClick={() => navigate('/lc/new')}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3 rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          New Letter of Credit
        </button>
      </div>
    </aside>
  );
};
