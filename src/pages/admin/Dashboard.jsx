import { Link } from 'react-router-dom';
import {
  UsersIcon,
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  SparklesIcon,
  CubeIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

/**
 * Dashboard - Panel de administración con diseño profesional
 * Fondo gris sutil + Tarjetas blancas + Iconos con color
 */
const Dashboard = () => {
  const stats = [
    {
      label: 'TOTAL USERS',
      value: '142',
      change: '+12',
      changeText: 'from last month',
      trend: 'up',
      icon: UsersIcon,
      iconBg: 'bg-blue-500',
      iconColor: 'text-blue-500'
    },
    {
      label: 'ACTIVE SESSIONS',
      value: '38',
      change: '+5',
      changeText: 'currently online',
      trend: 'up',
      icon: BoltIcon,
      iconBg: 'bg-green-500',
      iconColor: 'text-green-500'
    },
    {
      label: 'ML MODELS',
      value: '5',
      change: '100%',
      changeText: 'trained & active',
      trend: 'up',
      icon: CpuChipIcon,
      iconBg: 'bg-purple-500',
      iconColor: 'text-purple-500'
    },
    {
      label: 'TOTAL SALES',
      value: '$45.2K',
      change: '+12%',
      changeText: 'vs last month',
      trend: 'up',
      icon: ArrowTrendingUpIcon,
      iconBg: 'bg-orange-500',
      iconColor: 'text-orange-500'
    },
  ];

  const modules = [
    {
      id: 'users',
      title: 'Users Management',
      description: 'Manage system users, roles and permissions',
      icon: UsersIcon,
      link: '/admin/users',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      available: true
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Manage products, categories and stock alerts',
      icon: CubeIcon,
      link: '/admin/inventory/products',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      available: true
    },
    {
      id: 'analytics',
      title: 'ML Predictions',
      description: 'Sales predictions and machine learning models',
      icon: CpuChipIcon,
      link: '/admin/dashboard/predictions',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      available: true
    },
  ];

  const activities = [
    {
      title: 'User management module accessed',
      description: 'Admin user logged in',
      time: '2 min ago',
      icon: UsersIcon,
      iconBg: 'bg-blue-500'
    },
    {
      title: 'New product added to inventory',
      description: 'Smart Watch Pro added successfully',
      time: '15 min ago',
      icon: CubeIcon,
      iconBg: 'bg-purple-500'
    },
    {
      title: 'ML model training completed',
      description: 'Sales prediction model updated',
      time: '1 hour ago',
      icon: CpuChipIcon,
      iconBg: 'bg-green-500'
    },
    {
      title: 'System security updated',
      description: 'Security patch v2.1 applied',
      time: '2 hours ago',
      icon: ShieldCheckIcon,
      iconBg: 'bg-orange-500'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your system today.</p>
      </div>

      {/* Statistics Cards - KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">
                  {stat.changeText}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                to={module.link}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-12 h-12 ${module.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-6 w-6 ${module.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>

                {module.available && (
                  <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Access module
                    </span>
                    <svg
                      className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Recent Activity</h2>
              <p className="text-sm text-gray-600">Latest system events and actions</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-gray-600" />
            </div>
          </div>

          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                >
                  <div className={`w-10 h-10 ${activity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Status Card - 1 column */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">System Status</h3>
            <p className="text-sm text-gray-600">All systems operational</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900">Server Status</span>
              </div>
              <span className="text-xs text-green-700 font-bold bg-green-100 px-2.5 py-1 rounded-full">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900">Database</span>
              </div>
              <span className="text-xs text-green-700 font-bold bg-green-100 px-2.5 py-1 rounded-full">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-900">API Services</span>
              </div>
              <span className="text-xs text-green-700 font-bold bg-green-100 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
              <h4 className="text-sm font-bold text-gray-900">Quick Tip</h4>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Use the sidebar to navigate between different modules. Click on any card to access detailed views.
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="text-2xl font-bold text-gray-900">Getting Started</h3>
              <SparklesIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              Welcome to your admin panel! All modules are fully functional.
              Start by managing users, checking inventory, or reviewing ML predictions.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/users"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-sm"
              >
                <span>Manage Users</span>
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/admin/inventory/products"
                className="inline-flex items-center px-5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-sm"
              >
                <span>View Inventory</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Espacio adicional para scroll */}
      <div className="h-16"></div>
    </div>
  );
};

export default Dashboard;
