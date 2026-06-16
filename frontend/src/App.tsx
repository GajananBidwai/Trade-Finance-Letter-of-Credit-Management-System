import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './layouts/AppLayout';
import { RbacManagementPage } from './pages/RbacManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<AppLayout />}>
          <Route path="/rbac" element={<RbacManagementPage />} />
          <Route path="/users" element={<UserManagementPage />} />
        </Route>

        {/* Redirect root to login for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
