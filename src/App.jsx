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

// Admin Layout and Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UsersList from './pages/admin/users/UsersList';

// Inventory Module
import ProductsList from './pages/admin/inventory/ProductsList';
import CategoriesList from './pages/admin/inventory/CategoriesList';
import StockAlerts from './pages/admin/inventory/StockAlerts';
import TestPage from './pages/admin/inventory/TestPage';

// Voice Reports Module
import VoiceReportsPage from './pages/admin/voice/VoiceReportsPage';

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
          {/* New Admin Layout Routes with Sidebar */}
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersList />} />
            
            {/* Inventory Routes */}
            <Route path="inventory/test" element={<TestPage />} />
            <Route path="inventory/products" element={<ProductsList />} />
            <Route path="inventory/categories" element={<CategoriesList />} />
            <Route path="inventory/alerts" element={<StockAlerts />} />
            
            {/* Voice Reports Route */}
            <Route path="voice-reports" element={<VoiceReportsPage />} />
          </Route>

          {/* Old routes - Keep for backward compatibility */}
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
