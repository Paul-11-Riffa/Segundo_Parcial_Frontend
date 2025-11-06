import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  Squares2X2Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

/**
 * Sidebar - Navegación lateral del panel de administración
 */
const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

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
    // Más módulos se agregarán aquí en el futuro
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside 
      className={`
        bg-blue-600 text-white transition-all duration-300 ease-in-out flex flex-col shadow-lg
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center justify-center px-4 bg-blue-700">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <Squares2X2Icon className="h-7 w-7 text-white" />
            <span className="font-bold text-xl tracking-wide">SmartSales</span>
          </div>
        )}
        {collapsed && (
          <Squares2X2Icon className="h-7 w-7 text-white" />
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                    ${active 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
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
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="border-t border-blue-500 p-3">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-blue-100 hover:bg-blue-500 hover:text-white transition-all duration-200 group"
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
