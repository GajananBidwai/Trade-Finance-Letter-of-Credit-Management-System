import { Outlet, Navigate } from 'react-router-dom';
import { SideNavBar } from './SideNavBar';
import { TopNavBar } from './TopNavBar';

import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const AppLayout = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <SideNavBar />
      
      <main className="ml-[280px] flex-1 flex flex-col h-screen relative">
        <TopNavBar />
        
        {/* Content Canvas */}
        <div className="mt-16 p-4 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
