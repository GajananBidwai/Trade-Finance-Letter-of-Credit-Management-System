import { useLogout } from '../features/auth/hooks/useAuth';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store';

export const TopNavBar = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    if (token) logoutMutation.mutate(token);
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 backdrop-blur-md border-b border-outline-variant/10 shadow-sm flex justify-between items-center px-4 z-40 bg-surface/70 dark:bg-surface-dim/70">
      <div className="flex items-center gap-4">
        <span className="font-title-lg text-title-lg font-black text-primary">TradeFinance AI</span>
        
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input 
            type="text" 
            placeholder="Search access logs..." 
            className="w-full bg-surface-container-lowest border-none rounded-full py-1.5 pl-10 text-body-md focus:ring-1 focus:ring-primary outline-none text-on-surface"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="bg-secondary-container/30 text-secondary text-body-md px-4 py-1.5 rounded-full border border-outline-variant/20 hover:bg-secondary-container/50 transition-all">
          Compliance Check
        </button>
        
        <div className="flex items-center gap-4 text-on-surface-variant">
          <Link to="/notifications" title="Notification Center">
            <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-all">notifications</span>
          </Link>
          <Link to="/notifications/preferences" title="Notification Preferences">
            <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-all">settings</span>
          </Link>
          <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-all" title="Help">help_outline</span>
          <button 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center justify-center p-2 rounded-full hover:bg-error-container hover:text-on-error-container transition-all"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
        
        <Link to="/profile" className="cursor-pointer hover:ring-2 hover:ring-primary/50 rounded-full transition-all block">
          <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/30">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtle_oUyOwmF9O1xSmPWe3oJ6MEfocF5RJmcRP_KheZM8oc6QXDfB6M9ky5VxGuUdDuEJ0w7_Myjch-jVO8N4WPNYUPribi73BxGuTOqr63HlkNlLGpUhv08_JZ9LfJpQDcRUyMR5j2UMVwi1aBank90Zk3vZGc8v2SRcw_CTtncU5u4bKpp6sJlp3HXSmTE8zRlOIc9Rx51bi4vF-XGMiSMurydWVVjVk2lhf6X-9ieExu26Uy_eFSPPrNCrDj7ETtngSYjwjrR8" 
              alt="User Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
};
