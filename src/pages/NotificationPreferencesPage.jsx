import NotificationPreferences from '../components/notifications/NotificationPreferences';
import './NotificationPreferencesPage.css';

/**
 * Página de preferencias de notificaciones
 * Permite al usuario configurar sus preferencias
 */
const NotificationPreferencesPage = () => {
  return (
    <div className="notification-preferences-page">
      <NotificationPreferences />
    </div>
  );
};

export default NotificationPreferencesPage;
