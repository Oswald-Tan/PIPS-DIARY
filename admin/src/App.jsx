import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./components/404";

import LayoutSuperAdmin from "./layout/LayoutSuperAdmin";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import LoginPage from "./pages/auth/Login";
import Dashboard from "./pages/SuperAdmin/Dashboard";
import ManualRateManager from "./pages/SuperAdmin/ManualRateManager";
import User from "./pages/SuperAdmin/User";
import ProfileSettings from "./pages/SuperAdmin/ProfileSettings";
import Transaction from "./pages/SuperAdmin/Transaction";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin Routes */}
        <Route element={<LayoutSuperAdmin />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<User />} />
          <Route path="/transactions" element={<Transaction />} />
          <Route path="/manual-rate" element={<ManualRateManager />} />
        </Route>
        <Route path="/profile-settings" element={<ProfileSettings />} />

      </Routes>
    </Router>
  );
}

export default App;
