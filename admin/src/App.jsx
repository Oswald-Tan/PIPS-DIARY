import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./components/404";

import Layout from "./layout/Layout";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import LoginPage from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import ManualRateManager from "./pages/ManualRateManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manual-rate" element={<ManualRateManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
