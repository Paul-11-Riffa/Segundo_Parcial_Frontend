import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * Dashboard - Página principal del panel de administración
 * Muestra accesos rápidos a los diferentes módulos
 */
const Dashboard = () => {
  const modules = [
    {
      id: 'users',
      title: 'Users Management',
      description: 'Manage system users, roles and permissions',
      icon: UsersIcon,
      color: 'bg-blue-500',
      link: '/admin/users',
      available: true
    },
    {
      id: 'analytics',
      title: 'ML Predictions',
      description: 'Sales predictions and machine learning models',
      icon: CpuChipIcon,
      color: 'bg-purple-500',
      link: '/admin/dashboard/predictions',
      available: true
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'View charts, statistics and business reports',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      link: '/admin/dashboard',
      available: true
    },
  ];

  const stats = [
    { label: 'Total Users', value: '14', change: '+2 this month', color: 'text-blue-600' },
    { label: 'Active Sessions', value: '8', change: 'Currently online', color: 'text-green-600' },
    { label: 'ML Models', value: '3', change: 'Trained & Active', color: 'text-purple-600' },
    { label: 'Total Sales', value: '$45.2K', change: '+12% vs last month', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Manage your system from this centralized dashboard
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                to={module.link}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${module.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.description}
                    </p>
                    {module.available && (
                      <span className="inline-flex items-center text-xs text-blue-600 font-medium mt-3 group-hover:translate-x-1 transition-transform duration-200">
                        Access module →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <ClockIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">User management module accessed</span>
            <span className="text-gray-400 ml-auto">Just now</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Admin panel layout created</span>
            <span className="text-gray-400 ml-auto">5 minutes ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">System initialized successfully</span>
            <span className="text-gray-400 ml-auto">10 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="bg-blue-500 rounded-full p-2">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Getting Started
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Welcome to your new admin panel! The <strong>Users Management</strong> module is fully functional. 
              You can create, edit, delete users and manage their roles.
            </p>
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Go to Users Management
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
