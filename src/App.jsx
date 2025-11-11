import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { useEffect } from 'react';

// Utilidades
import { warmupDatabase, dbKeepAlive } from './utils/dbWarmup';

// Componentes globales
import DatabaseWarmupIndicator from './components/DatabaseWarmupIndicator';

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

// Admin Notifications Module
import SendNotification from './pages/admin/notifications/SendNotification';

// Audit Module - COMMENTED OUT (files don't exist)
// import { 
//   AuditDashboard as AuditDashboardPage, 
//   AuditLogs, 
//   SecurityAlerts
// } from './pages/admin/audit';

// Notification Pages
import NotificationsPage from './pages/NotificationsPage';
import NotificationPreferencesPage from './pages/NotificationPreferencesPage';

// Notification Components
import { NotificationBanner, NotificationToastContainer } from './components/notifications';

// Shop Pages (Public)
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';

// Cart Pages (Protected)
import CartPage from './pages/cart/CartPage';
import OrderSuccessPage from './pages/cart/OrderSuccessPage';
import OrderCancelPage from './pages/cart/OrderCancelPage';
import OrderHistoryPage from './pages/cart/OrderHistoryPage';

function App() {
  // ✅ Calentar base de datos al iniciar la aplicación
  useEffect(() => {
    // Ejecutar warmup de forma asíncrona (no bloquea la UI)
    warmupDatabase().then((success) => {
      if (success) {
        // Si el warmup fue exitoso, iniciar sistema de keep-alive
        dbKeepAlive.start();
      }
    });

    // Cleanup: detener keep-alive al desmontar la app
    return () => {
      dbKeepAlive.stop();
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            {/* ✅ Indicador de base de datos despertando */}
            <DatabaseWarmupIndicator />
            
            {/* Banner para solicitar permisos de notificaciones */}
            <NotificationBanner />
            
            {/* Container para toasts de notificaciones en foreground */}
            <NotificationToastContainer />
            
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Ruta alternativa que acepta el formato del backend */}
          <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
          
          {/* Shop Routes (Public - No login required) */}
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          
          {/* Access Denied */}
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Protected Routes (Usuario normal) */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Notification Routes */}
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/notifications/preferences" element={<ProtectedRoute><NotificationPreferencesPage /></ProtectedRoute>} />

          {/* Cart Routes (Protected - Usuario debe estar logueado) */}
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/order/success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
          <Route path="/order/cancel" element={<ProtectedRoute><OrderCancelPage /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />

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
            
            {/* Audit Routes - COMMENTED OUT (components don't exist) */}
            {/* <Route path="audit/dashboard" element={<AuditDashboardPage />} /> */}
            {/* <Route path="audit/logs" element={<AuditLogs />} /> */}
            {/* <Route path="audit/security" element={<SecurityAlerts />} /> */}
            
            {/* Notifications Route */}
            <Route path="notifications/send" element={<SendNotification />} />
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
        </NotificationProvider>
      </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
