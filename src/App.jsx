import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import PredictionsDashboard from './pages/PredictionsDashboard';
import StockAlertsDashboard from './pages/StockAlertsDashboard';
import TrainModelPage from './pages/TrainModelPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Ruta alternativa que acepta el formato del backend */}
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          
          {/* Access Denied */}
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Protected Routes (Usuario normal) */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Routes (Solo administradores) */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/dashboard/predictions" 
            element={
              <ProtectedAdminRoute>
                <PredictionsDashboard />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/dashboard/alerts" 
            element={
              <ProtectedAdminRoute>
                <StockAlertsDashboard />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/dashboard/train-model" 
            element={
              <ProtectedAdminRoute>
                <TrainModelPage />
              </ProtectedAdminRoute>
            } 
          />

          {/* Redirect any unknown route to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
