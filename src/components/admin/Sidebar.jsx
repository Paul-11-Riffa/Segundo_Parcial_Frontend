import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  Squares2X2Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CubeIcon,
  TagIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import './Sidebar.css';

/**
 * Sidebar - Navegación lateral del panel de administración
 */
const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    inventory: true, // Expandido por defecto
  });

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      path: '/admin/dashboard',
    },
    {
      id: 'users',
      label: 'Users',
      icon: UsersIcon,
      path: '/admin/users',
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: CubeIcon,
      submenu: [
        {
          id: 'products',
          label: 'Productos',
          icon: CubeIcon,
          path: '/admin/inventory/products',
        },
        {
          id: 'categories',
          label: 'Categorías',
          icon: TagIcon,
          path: '/admin/inventory/categories',
        },
        {
          id: 'alerts',
          label: 'Alertas de Stock',
          icon: ExclamationTriangleIcon,
          path: '/admin/inventory/alerts',
        },
      ],
    },
    {
      id: 'voice-reports',
      label: 'Reportes por Voz',
      icon: MicrophoneIcon,
      path: '/admin/voice-reports',
    },
    {
      id: 'notifications',
      label: 'Enviar Notificación',
      icon: BellAlertIcon,
      path: '/admin/notifications/send',
    },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      {/* Logo / Brand */}
      <div className="sidebar-brand">
        {!collapsed && (
          <div className="sidebar-brand-content">
            <Squares2X2Icon className="sidebar-brand-icon" />
            <span className="sidebar-brand-text">SmartSales</span>
          </div>
        )}
        {collapsed && (
          <Squares2X2Icon className="sidebar-brand-icon" />
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.path && isActive(item.path);
            const hasSubmenu = !!item.submenu;
            const isExpanded = expandedMenus[item.id];
            const hasActiveChild = hasSubmenu && item.submenu.some(sub => isActive(sub.path));

            return (
              <li key={item.id} className="sidebar-menu-item">
                {/* Item principal */}
                {hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => !collapsed && toggleSubmenu(item.id)}
                      className={`sidebar-item-button ${hasActiveChild ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
                      title={collapsed ? item.label : ''}
                    >
                      <div className="sidebar-item-content">
                        <Icon className="sidebar-item-icon" />
                        {!collapsed && (
                          <span className="sidebar-item-label">{item.label}</span>
                        )}
                      </div>
                      {!collapsed && (
                        <ChevronDownIcon className="sidebar-item-chevron" />
                      )}
                    </button>

                    {/* Submenú */}
                    {!collapsed && isExpanded && (
                      <ul className="sidebar-submenu">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const subActive = isActive(subItem.path);

                          return (
                            <li key={subItem.id} className="sidebar-submenu-item">
                              <Link
                                to={subItem.path}
                                className={`sidebar-submenu-link ${subActive ? 'active' : ''}`}
                              >
                                <SubIcon className="sidebar-submenu-icon" />
                                <span className="sidebar-submenu-label">{subItem.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`sidebar-item-link ${active ? 'active' : ''}`}
                    title={collapsed ? item.label : ''}
                  >
                    <div className="sidebar-item-content">
                      <Icon className="sidebar-item-icon" />
                      {!collapsed && (
                        <span className="sidebar-item-label">{item.label}</span>
                      )}
                    </div>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="sidebar-footer">
        <button
          onClick={onToggle}
          className="sidebar-toggle-button"
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="sidebar-toggle-icon" />
          ) : (
            <>
              <ChevronDoubleLeftIcon className="sidebar-toggle-icon" />
              <span className="sidebar-toggle-text">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
