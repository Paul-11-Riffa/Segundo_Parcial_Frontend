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
import './Dashboard.css';

/**
 * Dashboard - Panel de administración con diseño minimalista moderno
 * Diseño inspirado en Vercel, Linear, Notion
 * Solo CSS y React - Sin Tailwind
 */
const Dashboard = () => {
  const stats = [
    {
      label: 'TOTAL USERS',
      value: '142',
      change: '+12',
      changeText: 'from last month',
      trend: 'up',
      icon: UsersIcon
    },
    {
      label: 'ACTIVE SESSIONS',
      value: '38',
      change: '+5',
      changeText: 'currently online',
      trend: 'up',
      icon: BoltIcon
    },
    {
      label: 'ML MODELS',
      value: '5',
      change: '100%',
      changeText: 'trained & active',
      trend: 'up',
      icon: CpuChipIcon
    },
    {
      label: 'TOTAL SALES',
      value: '$45.2K',
      change: '+12%',
      changeText: 'vs last month',
      trend: 'up',
      icon: ArrowTrendingUpIcon
    },
  ];

  const modules = [
    {
      id: 'users',
      title: 'Users Management',
      description: 'Manage system users, roles and permissions',
      icon: UsersIcon,
      link: '/admin/users',
      available: true
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Manage products, categories and stock alerts',
      icon: CubeIcon,
      link: '/admin/inventory/products',
      available: true
    },
    {
      id: 'analytics',
      title: 'ML Predictions',
      description: 'Sales predictions and machine learning models',
      icon: CpuChipIcon,
      link: '/admin/dashboard/predictions',
      available: true
    },
  ];

  const activities = [
    {
      title: 'User management module accessed',
      description: 'Admin user logged in',
      time: '2 min ago',
      icon: UsersIcon
    },
    {
      title: 'New product added to inventory',
      description: 'Smart Watch Pro added successfully',
      time: '15 min ago',
      icon: CubeIcon
    },
    {
      title: 'ML model training completed',
      description: 'Sales prediction model updated',
      time: '1 hour ago',
      icon: CpuChipIcon
    },
    {
      title: 'System security updated',
      description: 'Security patch v2.1 applied',
      time: '2 hours ago',
      icon: ShieldCheckIcon
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your system today.</p>
      </div>

      {/* Statistics Cards - KPIs */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-icon">
                  <Icon />
                </div>
                {stat.trend === 'up' && (
                  <div className="stat-badge positive">
                    <ArrowTrendingUpIcon />
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
              <div className="stat-card-body">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-description">{stat.changeText}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Section */}
      <div className="section-header">
        <h2 className="section-title">Quick Access</h2>
      </div>

      <div className="modules-grid">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.id} to={module.link} className="module-card">
              <div className="module-card-content">
                <div className="module-icon">
                  <Icon />
                </div>
                <div className="module-info">
                  <h3 className="module-title">{module.title}</h3>
                  <p className="module-description">{module.description}</p>
                </div>
              </div>

              {module.available && (
                <div className="module-action">
                  <span>Access module</span>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="two-column-layout">
        {/* Recent Activity */}
        <div className="activity-card">
          <div className="activity-header">
            <div className="activity-header-info">
              <h2>Recent Activity</h2>
              <p>Latest system events and actions</p>
            </div>
            <div className="activity-icon-badge">
              <ClockIcon />
            </div>
          </div>

          <div className="activity-list">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="activity-item">
                  <div className="activity-item-icon">
                    <Icon />
                  </div>
                  <div className="activity-item-content">
                    <p className="activity-item-title">{activity.title}</p>
                    <p className="activity-item-description">{activity.description}</p>
                  </div>
                  <span className="activity-item-time">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Status Card */}
        <div className="status-card">
          <div className="status-header">
            <h3>System Status</h3>
            <p>All systems operational</p>
          </div>

          <div className="status-list">
            <div className="status-item online">
              <div className="status-item-info">
                <div className="status-dot"></div>
                <span className="status-item-label">Server Status</span>
              </div>
              <span className="status-badge">Online</span>
            </div>

            <div className="status-item online">
              <div className="status-item-info">
                <div className="status-dot"></div>
                <span className="status-item-label">Database</span>
              </div>
              <span className="status-badge">Connected</span>
            </div>

            <div className="status-item online">
              <div className="status-item-info">
                <div className="status-dot"></div>
                <span className="status-item-label">API Services</span>
              </div>
              <span className="status-badge">Active</span>
            </div>
          </div>

          <div className="status-tip">
            <div className="status-tip-header">
              <SparklesIcon />
              <h4>Quick Tip</h4>
            </div>
            <p>Use the sidebar to navigate between different modules. Click on any card to access detailed views.</p>
          </div>
        </div>
      </div>

      {/* Getting Started Banner */}
      <div className="banner-card">
        <div className="banner-content">
          <div className="banner-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="banner-info">
            <div className="banner-title">
              <h3>Getting Started</h3>
              <SparklesIcon />
            </div>
            <p className="banner-description">
              Welcome to your admin panel! All modules are fully functional.
              Start by managing users, checking inventory, or reviewing ML predictions.
            </p>
            <div className="banner-actions">
              <Link to="/admin/users" className="banner-button-primary">
                <span>Manage Users</span>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/admin/inventory/products" className="banner-button-secondary">
                <span>View Inventory</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="dashboard-spacer"></div>
    </div>
  );
};

export default Dashboard;
