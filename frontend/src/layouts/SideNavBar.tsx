import { NavLink } from 'react-router-dom';

export const SideNavBar = () => {
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Workflow', icon: 'account_tree', path: '/workflow' },
    { name: 'Reports', icon: 'assessment', path: '/reports' },
    { name: 'Users', icon: 'group', path: '/users' },
    { name: 'Settings', icon: 'settings', path: '/rbac' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] border-r border-outline-variant/10 backdrop-blur-xl shadow-2xl flex flex-col p-2 z-50 bg-surface dark:bg-surface-dim">
      <div className="mb-8 px-4 py-6">
        <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary">TradeFinance</h1>
        <p className="font-body-md text-body-md text-on-surface-variant opacity-60">Global Operations</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors active:scale-95 duration-200 ${
                isActive
                  ? 'text-primary bg-primary-container/20 border-r-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body-md text-body-md">{item.name}</span>
          </NavLink>
        ))}
        
        <NavLink 
          to="/users"
          className={({ isActive }) => `group flex items-center gap-4 px-4 py-3 transition-colors active:scale-95 duration-200 ${isActive ? 'text-primary bg-primary-container/20 relative' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute right-0 w-1 h-full bg-primary"></div>}
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>group</span>
              <span className={`font-body-md text-body-md ${isActive ? 'font-semibold' : ''}`}>Users</span>
            </>
          )}
        </NavLink>
        
        <NavLink 
          to="/rbac"
          className={({ isActive }) => `group flex items-center gap-4 px-4 py-3 transition-colors active:scale-95 duration-200 ${isActive ? 'text-primary bg-primary-container/20 relative' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'}`}
        >
          {({ isActive }) => (
            <>
              {isActive && <div className="absolute right-0 w-1 h-full bg-primary"></div>}
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>admin_panel_settings</span>
              <span className={`font-body-md text-body-md ${isActive ? 'font-semibold' : ''}`}>RBAC</span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="mt-auto p-4 bg-slate-800/70 backdrop-blur-md border border-white/10 rounded-xl mb-4">
        <button className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl active:scale-95 transition-all">
          New Transaction
        </button>
      </div>
    </aside>
  );
};
