import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';

/**
 * AdminLayout - Layout principal para el panel de administración
 * Sidebar fijo + Contenido con scroll sincronizado
 */
const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Ancho del sidebar según estado (en píxeles)
  const SIDEBAR_WIDTH_EXPANDED = 256; // w-64 = 16rem = 256px
  const SIDEBAR_WIDTH_COLLAPSED = 80; // w-20 = 5rem = 80px

  const currentSidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - FIJO con position fixed */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content Area - Con margen izquierdo sincronizado */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${currentSidebarWidth}px` }}
      >
        {/* Header - Sticky en la parte superior */}
        <Header user={user} onMenuClick={toggleSidebar} />

        {/* Page Content - Con scroll vertical habilitado */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
