import NotificationList from '../components/notifications/NotificationList';
import './NotificationsPage.css';

/**
 * Página principal de notificaciones
 * Muestra la lista completa de notificaciones con filtros
 */
const NotificationsPage = () => {
  return (
    <div className="notifications-page">
      <NotificationList />
    </div>
  );
};

export default NotificationsPage;
