import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AppLayout } from './layouts/AppLayout';
import { RbacManagementPage } from './pages/RbacManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { LcIssuancePage } from './pages/LcIssuancePage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkflowListPage } from './pages/WorkflowListPage';
import { LcDetailPage } from './pages/LcDetailPage';
import { DocumentPresentationPage } from './pages/DocumentPresentationPage';
import { SettlementPage } from './pages/SettlementPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { NotificationPreferencesPage } from './pages/NotificationPreferencesPage';
import { ReportingPage } from './pages/ReportingPage';
import { AIAssistantHubPage } from './pages/AIAssistantHubPage';
import { UserProfilePage } from './pages/UserProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rbac" element={<RbacManagementPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/lc/new" element={<LcIssuancePage />} />
          <Route path="/workflow" element={<WorkflowListPage />} />
          <Route path="/workflow/:id" element={<LcDetailPage />} />
          <Route path="/workflow/:id/documents" element={<DocumentPresentationPage />} />
          <Route path="/workflow/:id/settlement" element={<SettlementPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/notifications/preferences" element={<NotificationPreferencesPage />} />
          <Route path="/reports" element={<ReportingPage />} />
          <Route path="/ai-hub" element={<AIAssistantHubPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
        </Route>

        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
