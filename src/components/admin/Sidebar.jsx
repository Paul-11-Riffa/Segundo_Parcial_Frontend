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
  DocumentTextIcon
} from '@heroicons/react/24/outline';

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
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-40
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 bg-white">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <Squares2X2Icon className="h-7 w-7 text-gray-900" />
            <span className="font-bold text-xl tracking-wide text-gray-900">SmartSales</span>
          </div>
        )}
        {collapsed && (
          <Squares2X2Icon className="h-7 w-7 text-gray-900" />
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.path && isActive(item.path);
            const hasSubmenu = !!item.submenu;
            const isExpanded = expandedMenus[item.id];
            const hasActiveChild = hasSubmenu && item.submenu.some(sub => isActive(sub.path));

            return (
              <li key={item.id}>
                {/* Item principal */}
                {hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => !collapsed && toggleSubmenu(item.id)}
                      className={`
                        w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                        ${hasActiveChild
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                        ${collapsed ? 'justify-center' : 'justify-between'}
                      `}
                      title={collapsed ? item.label : ''}
                    >
                      <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
                        <Icon className="flex-shrink-0 h-5 w-5" />
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.label}</span>
                        )}
                      </div>
                      {!collapsed && (
                        <div>
                          {isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Submenú */}
                    {!collapsed && isExpanded && (
                      <ul className="mt-2 space-y-1 ml-4">
                        {item.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const subActive = isActive(subItem.path);

                          return (
                            <li key={subItem.id}>
                              <Link
                                to={subItem.path}
                                className={`
                                  flex items-center px-4 py-2 rounded-lg transition-all duration-200 group
                                  ${subActive
                                    ? 'bg-blue-50 text-blue-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }
                                `}
                              >
                                <SubIcon className="flex-shrink-0 h-4 w-4 mr-3" />
                                <span className="font-medium text-sm">{subItem.label}</span>
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
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                      ${active
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${collapsed ? 'justify-center' : 'space-x-3'}
                    `}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon className={`flex-shrink-0 ${active ? 'h-5 w-5' : 'h-5 w-5'}`} />
                    {!collapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <>
              <ChevronDoubleLeftIcon className="h-5 w-5" />
              <span className="ml-2 text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
