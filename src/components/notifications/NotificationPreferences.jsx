import { useState, useEffect } from 'react';
import { Save, Bell, Mail, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationPreferences.css';

// Valores por defecto para evitar undefined
const defaultPreferences = {
  email_enabled: true,
  push_enabled: true,
  notification_types: {
    SALE_CREATED: true,
    PRODUCT_LOW_STOCK: true,
    REPORT_GENERATED: true,
    ML_PREDICTION: true,
    SYSTEM: true
  }
};

/**
 * Panel de configuración de preferencias de notificaciones
 * Permite al usuario personalizar qué notificaciones recibir
 */
const NotificationPreferences = () => {
  const { preferences, updatePreferences, permission, requestPermission } = useNotifications();
  
  const [localPreferences, setLocalPreferences] = useState(defaultPreferences);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState(null); // Para mostrar mensajes

  // Actualizar localPreferences cuando preferences del Context cambie
  useEffect(() => {
    if (preferences) {
      // Asegurar que notification_types exista
      setLocalPreferences({
        ...defaultPreferences,
        ...preferences,
        notification_types: {
          ...defaultPreferences.notification_types,
          ...(preferences.notification_types || {})
        }
      });
    }
  }, [preferences]);

  // No renderizar hasta que localPreferences esté completamente configurado
  if (!localPreferences || !localPreferences.notification_types) {
    return (
      <div className="notification-preferences-container">
        <div className="notification-preferences-header">
          <p>Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  // Handler para cambios en preferencias generales
  const handleToggle = async (key) => {
    // Si es push_enabled y se está activando, solicitar permisos primero
    if (key === 'push_enabled' && !localPreferences.push_enabled) {
      if (permission !== 'granted') {
        setRequestingPermission(true);
        setPermissionMessage({ type: 'info', text: '📋 Solicitando permisos del navegador...' });
        
        try {
          await requestPermission();
          
          // Esperar un momento para que el Context actualice el permission
          setTimeout(() => {
            const currentPermission = Notification.permission;
            
            if (currentPermission === 'granted') {
              setLocalPreferences(prev => ({
                ...prev,
                [key]: true
              }));
              setPermissionMessage({ 
                type: 'success', 
                text: '✅ ¡Notificaciones push activadas correctamente!' 
              });
            } else if (currentPermission === 'denied') {
              setPermissionMessage({ 
                type: 'error', 
                text: '❌ Permisos denegados. Por favor, habílitalos en la configuración de tu navegador.' 
              });
            } else {
              setPermissionMessage({ 
                type: 'warning', 
                text: '⚠️ No se pudieron activar las notificaciones. Intenta de nuevo.' 
              });
            }
            
            setRequestingPermission(false);
            
            // Limpiar mensaje después de 5 segundos
            setTimeout(() => {
              setPermissionMessage(null);
            }, 5000);
          }, 1000);
          
        } catch (error) {
          console.error('Error solicitando permisos:', error);
          setPermissionMessage({ 
            type: 'error', 
            text: '❌ Error al solicitar permisos. Intenta de nuevo.' 
          });
          setRequestingPermission(false);
          
          setTimeout(() => {
            setPermissionMessage(null);
          }, 5000);
        }
        
        return;
      }
    }
    
    // Para otros toggles o si ya tiene permisos, simplemente cambiar el estado
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    // Mostrar mensaje de que debe guardar cambios
    if (key === 'push_enabled') {
      setPermissionMessage({ 
        type: 'info', 
        text: '💾 Recuerda hacer clic en "Guardar Cambios" para aplicar.' 
      });
      setTimeout(() => {
        setPermissionMessage(null);
      }, 3000);
    }
  };

  // Handler para cambios en tipos de notificaciones
  const handleTypeToggle = (type) => {
    setLocalPreferences(prev => ({
      ...prev,
      notification_types: {
        ...(prev.notification_types || {}),
        [type]: !(prev.notification_types?.[type] ?? true)
      }
    }));
  };

  // Guardar preferencias
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setPermissionMessage(null);

    try {
      await updatePreferences(localPreferences);
      setSaveSuccess(true);
      setPermissionMessage({ 
        type: 'success', 
        text: '✅ Preferencias guardadas correctamente' 
      });
      
      setTimeout(() => {
        setSaveSuccess(false);
        setPermissionMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      setPermissionMessage({ 
        type: 'error', 
        text: '❌ Error al guardar las preferencias. Intenta de nuevo.' 
      });
      
      setTimeout(() => {
        setPermissionMessage(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  // Solicitar permisos de notificaciones push
  const handleRequestPermission = async () => {
    await requestPermission();
  };

  return (
    <div className="notification-preferences-container">
      <div className="notification-preferences-header">
        <h1 className="notification-preferences-title">
          Preferencias de Notificaciones
        </h1>
        <p className="notification-preferences-subtitle">
          Personaliza cómo y cuándo recibir notificaciones
        </p>
      </div>

      <div className="notification-preferences-content">
        {/* Mensaje de feedback global */}
        {permissionMessage && (
          <div className={`notification-preferences-alert notification-preferences-alert-${permissionMessage.type}`}>
            <AlertTriangle size={18} />
            <span>{permissionMessage.text}</span>
          </div>
        )}

        {/* Permisos del navegador */}
        <div className="notification-preferences-section">
          <h2 className="notification-preferences-section-title">
            <Bell size={20} />
            Permisos del Navegador
          </h2>

          <div className="notification-preferences-permission-status">
            {permission === 'granted' ? (
              <div className="notification-preferences-alert notification-preferences-alert-success">
                <AlertTriangle size={18} />
                <span>✅ Notificaciones push habilitadas</span>
              </div>
            ) : permission === 'denied' ? (
              <div className="notification-preferences-alert notification-preferences-alert-error">
                <AlertTriangle size={18} />
                <div>
                  <p>❌ Notificaciones push bloqueadas</p>
                  <small>Habilítalas manualmente en la configuración de tu navegador</small>
                </div>
              </div>
            ) : (
              <div className="notification-preferences-alert notification-preferences-alert-warning">
                <AlertTriangle size={18} />
                <div>
                  <p>⚠️ Notificaciones push no habilitadas</p>
                  <button 
                    onClick={handleRequestPermission}
                    className="notification-preferences-enable-btn"
                    disabled={requestingPermission}
                  >
                    {requestingPermission ? 'Solicitando...' : 'Habilitar ahora'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canales de notificación */}
        <div className="notification-preferences-section">
          <h2 className="notification-preferences-section-title">
            Canales de Notificación
          </h2>

          <div className="notification-preferences-options">
            <label className="notification-preferences-option">
              <div className="notification-preferences-option-info">
                <Bell size={20} className="notification-preferences-option-icon" />
                <div>
                  <h3>Notificaciones Push</h3>
                  <p>Recibe notificaciones en tiempo real en tu navegador</p>
                  {permission !== 'granted' && localPreferences.push_enabled && (
                    <small style={{ color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                      ⚠️ Necesitas permitir las notificaciones en tu navegador primero
                    </small>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.push_enabled}
                onChange={() => handleToggle('push_enabled')}
                className="notification-preferences-toggle"
                disabled={requestingPermission}
              />
            </label>

            <label className="notification-preferences-option">
              <div className="notification-preferences-option-info">
                <Mail size={20} className="notification-preferences-option-icon" />
                <div>
                  <h3>Notificaciones por Email</h3>
                  <p>Recibe un resumen diario por correo electrónico</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.email_enabled}
                onChange={() => handleToggle('email_enabled')}
                className="notification-preferences-toggle"
              />
            </label>
          </div>
        </div>

        {/* Tipos de notificaciones */}
        <div className="notification-preferences-section">
          <h2 className="notification-preferences-section-title">
            Tipos de Notificaciones
          </h2>

          <div className="notification-preferences-types">
            <label className="notification-preferences-type">
              <div>
                <h4>💰 Ventas Creadas</h4>
                <p>Notificación cuando se registra una nueva venta</p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.notification_types.SALE_CREATED}
                onChange={() => handleTypeToggle('SALE_CREATED')}
                className="notification-preferences-toggle"
              />
            </label>

            <label className="notification-preferences-type">
              <div>
                <h4>📦 Stock Bajo</h4>
                <p>Alerta cuando un producto tiene stock bajo</p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.notification_types.PRODUCT_LOW_STOCK}
                onChange={() => handleTypeToggle('PRODUCT_LOW_STOCK')}
                className="notification-preferences-toggle"
              />
            </label>

            <label className="notification-preferences-type">
              <div>
                <h4>📊 Reportes Generados</h4>
                <p>Notificación cuando se genera un nuevo reporte</p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.notification_types.REPORT_GENERATED}
                onChange={() => handleTypeToggle('REPORT_GENERATED')}
                className="notification-preferences-toggle"
              />
            </label>

            <label className="notification-preferences-type">
              <div>
                <h4>🤖 Predicciones ML</h4>
                <p>Actualizaciones sobre predicciones de machine learning</p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.notification_types.ML_PREDICTION}
                onChange={() => handleTypeToggle('ML_PREDICTION')}
                className="notification-preferences-toggle"
              />
            </label>

            <label className="notification-preferences-type">
              <div>
                <h4>⚙️ Sistema</h4>
                <p>Notificaciones importantes del sistema</p>
              </div>
              <input
                type="checkbox"
                checked={localPreferences.notification_types.SYSTEM}
                onChange={() => handleTypeToggle('SYSTEM')}
                className="notification-preferences-toggle"
              />
            </label>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="notification-preferences-actions">
          {saveSuccess && !permissionMessage && (
            <span className="notification-preferences-success">
              ✓ Preferencias guardadas
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={saving || requestingPermission}
            className="notification-preferences-save-btn"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
