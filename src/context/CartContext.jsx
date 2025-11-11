/**
 * Context del Carrito de Compras
 * Gestiona el estado global del carrito y provee funciones para interactuar con él
 * 
 * Uso:
 * import { useCart } from '../context/CartContext';
 * 
 * function Component() {
 *   const { cart, loading, addToCart, cartItemCount } = useCart();
 *   // ...
 * }
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

// Crear el contexto
const CartContext = createContext(undefined);

/**
 * Hook personalizado para usar el contexto del carrito
 * Debe usarse dentro de un componente hijo de CartProvider
 * 
 * @returns {Object} - Estado y funciones del carrito
 * @throws {Error} - Si se usa fuera de CartProvider
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  
  return context;
};

/**
 * Provider del contexto del carrito
 * Envuelve la aplicación para proveer acceso global al carrito
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export const CartProvider = ({ children }) => {
  // ============================================================================
  // ESTADO
  // ============================================================================
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Obtener info del usuario autenticado
  const { user, isAuthenticated } = useAuth();
  
  // ============================================================================
  // VALORES DERIVADOS
  // ============================================================================
  
  /**
   * Calcula el número total de items en el carrito
   * Suma las cantidades de todos los productos
   */
  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  /**
   * Calcula el precio total del carrito
   * (Ya viene calculado del backend, pero útil como backup)
   */
  const cartTotal = cart?.total_price || '0.00';
  
  // ============================================================================
  // FUNCIONES DE CACHÉ
  // ============================================================================
  
  /**
   * Guarda el carrito en localStorage como caché
   * Mejora la experiencia al recargar la página
   */
  const cacheCart = useCallback((cartData) => {
    try {
      if (cartData) {
        localStorage.setItem('cart_cache', JSON.stringify(cartData));
        localStorage.setItem('cart_cache_timestamp', Date.now().toString());
      }
    } catch (err) {
      console.warn('Error al guardar caché del carrito:', err);
    }
  }, []);
  
  /**
   * Obtiene el carrito cacheado si existe y es reciente (< 5 minutos)
   */
  const getCachedCart = useCallback(() => {
    try {
      const cached = localStorage.getItem('cart_cache');
      const timestamp = localStorage.getItem('cart_cache_timestamp');
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        // Si el caché tiene menos de 5 minutos, usarlo
        if (age < FIVE_MINUTES) {
          return JSON.parse(cached);
        }
      }
    } catch (err) {
      console.warn('Error al leer caché del carrito:', err);
    }
    
    return null;
  }, []);
  
  /**
   * Limpia el caché del carrito
   */
  const clearCartCache = useCallback(() => {
    localStorage.removeItem('cart_cache');
    localStorage.removeItem('cart_cache_timestamp');
  }, []);
  
  // ============================================================================
  // FUNCIONES DEL CARRITO
  // ============================================================================
  
  /**
   * Carga el carrito actual del usuario desde el backend
   * Si hay caché disponible, lo muestra primero para mejor UX
   */
  const loadCart = useCallback(async () => {
    // Si no está autenticado, no cargar
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Mostrar caché inmediatamente si existe (UX optimista)
      const cached = getCachedCart();
      if (cached) {
        setCart(cached);
      }

      // Cargar carrito real del backend
      const data = await cartService.getCart();
      setCart(data);

      // Actualizar caché
      cacheCart(data);

    } catch (err) {
      console.error('Error al cargar carrito:', err);

      // Si es error 401, el carrito simplemente no está disponible
      // NO es un error crítico, mantener el estado limpio
      if (err.response?.status === 401 || err.message?.includes('No autorizado')) {
        console.warn('[CartContext] Carrito no disponible (401), estado limpio');
        setCart(null);
        setError(null); // No mostrar error al usuario
      } else {
        setError(err.message);

        // Si falla la carga pero hay caché, mantenerlo
        const cachedFallback = getCachedCart();
        if (cachedFallback) {
          setCart(cachedFallback);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, cacheCart, getCachedCart]); // ✅ Removido 'cart' de dependencias
  
  /**
   * Añade un producto al carrito
   * 
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad a añadir (default: 1)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
      cacheCart(updatedCart);
      
      return { success: true };
    } catch (err) {
      console.error('Error al añadir al carrito:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [cacheCart]);
  
  /**
   * Actualiza la cantidad de un item en el carrito
   * Si quantity es 0, elimina el item
   * 
   * @param {number} itemId - ID del OrderItem
   * @param {number} quantity - Nueva cantidad
   */
  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCart = await cartService.updateItemQuantity(itemId, quantity);
      setCart(updatedCart);
      cacheCart(updatedCart);
      
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      setError(err.message);
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [cacheCart]);
  
  /**
   * Elimina un item del carrito
   * 
   * @param {number} itemId - ID del OrderItem a eliminar
   */
  const removeItem = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
      cacheCart(updatedCart);
      
    } catch (err) {
      console.error('Error al eliminar item:', err);
      setError(err.message);
      throw err; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [cacheCart]);
  
  /**
   * Inicia el proceso de checkout (pago)
   * Redirige al usuario a Stripe Checkout
   */
  const proceedToCheckout = useCallback(async () => {
    // Validar que el carrito no esté vacío
    if (!cart || cart.items.length === 0) {
      setError('El carrito está vacío');
      return { success: false, error: 'El carrito está vacío' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[CartContext] 🛒 GUARDANDO datos del carrito antes de checkout...');
      console.log('[CartContext] Carrito actual:', cart);
      console.log('[CartContext] Items:', cart.items);
      console.log('[CartContext] Total items:', cart.items.reduce((sum, item) => sum + item.quantity, 0));
      console.log('[CartContext] Total price:', cart.total_price);
      
      // ✅ GUARDAR datos del carrito en localStorage ANTES de ir a Stripe
      // Esto nos permitirá mostrarlos en la página de éxito
      const orderDataToSave = {
        items: cart.items,
        total_price: cart.total_price,
        total_items: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        timestamp: Date.now()
      };
      
      localStorage.setItem('pending_order_data', JSON.stringify(orderDataToSave));
      console.log('[CartContext] ✅ Datos guardados en localStorage:', orderDataToSave);
      
      // Verificar que se guardó correctamente
      const saved = localStorage.getItem('pending_order_data');
      console.log('[CartContext] Verificación - datos en localStorage:', saved);
      
      const { checkout_url } = await cartService.checkout();
      console.log('[CartContext] 🚀 Redirigiendo a Stripe:', checkout_url);
      
      // Redirigir a Stripe (sale de la SPA)
      window.location.href = checkout_url;
      
      return { success: true };
    } catch (err) {
      console.error('[CartContext] ❌ Error al iniciar checkout:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
    // No setear loading a false aquí porque estamos redirigiendo
  }, [cart]);
  
  /**
   * Completa una orden después del pago exitoso
   * Solo debe llamarse desde la página /order/success
   * 
   * @returns {Promise<{success: boolean, order?: Object, error?: string}>}
   */
  const completeOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[CartContext] Iniciando completeOrder...');
      
      // Paso 1: Recuperar datos del carrito guardados ANTES del checkout
      console.log('[CartContext] 🔍 Buscando datos guardados en localStorage...');
      const pendingOrderData = localStorage.getItem('pending_order_data');
      console.log('[CartContext] Datos raw de localStorage:', pendingOrderData);
      
      let savedCartData = null;
      
      if (pendingOrderData) {
        try {
          savedCartData = JSON.parse(pendingOrderData);
          console.log('[CartContext] ✅ Datos del carrito recuperados:', savedCartData);
          console.log('[CartContext] - Items recuperados:', savedCartData.items);
          console.log('[CartContext] - Total items:', savedCartData.total_items);
          console.log('[CartContext] - Total price:', savedCartData.total_price);
        } catch (e) {
          console.error('[CartContext] ❌ Error al parsear datos guardados:', e);
        }
      } else {
        console.warn('[CartContext] ⚠️ NO se encontraron datos guardados en localStorage');
      }
      
      // Paso 2: Completar la orden en el backend
      const result = await cartService.completeOrder();
      console.log('[CartContext] Orden completada, order_id:', result.order_id);
      
      // Paso 3: Obtener el historial para obtener la fecha y estado actualizados
      const orderHistoryResponse = await cartService.getOrderHistory();
      const orderHistory = Array.isArray(orderHistoryResponse) 
        ? orderHistoryResponse 
        : (orderHistoryResponse.results || []);
      
      const completedOrder = orderHistory.find(order => order.id === result.order_id);
      console.log('[CartContext] Orden del historial:', completedOrder);
      
      // Paso 4: Construir objeto de orden con datos completos
      const orderData = {
        id: result.order_id,
        status: completedOrder?.status || 'COMPLETED',
        created_at: completedOrder?.created_at || new Date().toISOString(),
        // ✅ Usar datos guardados si existen, sino usar los del historial
        items: savedCartData?.items || completedOrder?.items || [],
        total_price: savedCartData?.total_price || completedOrder?.total_price || '0.00',
        total_items: savedCartData?.total_items || completedOrder?.total_items || 0,
        customer: completedOrder?.customer
      };
      
      console.log('[CartContext] Orden final construida:', orderData);
      
      // Paso 5: Limpiar datos temporales
      localStorage.removeItem('pending_order_data');
      setCart(null);
      clearCartCache();
      
      // Paso 6: Recargar el carrito (el backend crea uno nuevo vacío)
      await loadCart();
      
      // Paso 7: Retornar los detalles completos de la orden
      return { 
        success: true, 
        order: orderData,
        message: result.message 
      };
    } catch (err) {
      console.error('[CartContext] Error al completar orden:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [clearCartCache, loadCart]);
  
  /**
   * Obtiene el historial de órdenes del usuario
   * 
   * @returns {Promise<Order[]>}
   */
  const getOrderHistory = useCallback(async () => {
    try {
      const orders = await cartService.getOrderHistory();
      return orders;
    } catch (err) {
      console.error('Error al obtener historial:', err);
      throw err;
    }
  }, []);
  
  // ============================================================================
  // EFECTOS
  // ============================================================================
  
  /**
   * Cargar carrito al montar el componente
   * Solo si el usuario está autenticado
   */
  useEffect(() => {
    // ✅ PROTECCIÓN: Flag para evitar loops en StrictMode
    let mounted = true;

    if (isAuthenticated && mounted) {
      loadCart();
    } else if (!isAuthenticated) {
      // Si no está autenticado, limpiar todo
      setCart(null);
      setLoading(false);
      clearCartCache();
    }

    // Cleanup para StrictMode
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Solo depende de isAuthenticated

  /**
   * Actualizar caché cuando el carrito cambia
   * OPTIMIZADO: Sin incluir cacheCart en dependencias para evitar loops
   */
  useEffect(() => {
    if (cart) {
      // Llamar directamente sin depender de la referencia
      try {
        localStorage.setItem('cart_cache', JSON.stringify(cart));
        localStorage.setItem('cart_cache_timestamp', Date.now().toString());
      } catch (err) {
        console.warn('Error al guardar caché del carrito:', err);
      }
    }
  }, [cart]); // Solo cart
  
  // ============================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================
  
  const value = {
    // Estado
    cart,
    loading,
    error,
    
    // Valores derivados
    cartItemCount,
    cartTotal,
    
    // Funciones
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    proceedToCheckout,
    completeOrder,
    getOrderHistory,
    
    // Utilidades
    clearCartCache
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
