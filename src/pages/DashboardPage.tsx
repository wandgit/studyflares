import Dashboard from '../components/dashboard/Dashboard';
import { RequireAuth } from '../components/auth/RequireAuth';

const DashboardPage = () => {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
};

export default DashboardPage;
