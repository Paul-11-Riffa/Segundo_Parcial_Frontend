import { API_BASE_URL } from './apiConfig';

/**
 * Servicio para búsqueda de productos por voz
 * Endpoint: POST /api/shop/products/search_by_voice/
 */

/**
 * Buscar productos usando comando de voz en español
 * @param {string} voiceText - Texto capturado del comando de voz
 * @param {string} token - JWT token para autenticación
 * @returns {Promise<Object>} - Resultados con products, interpretation, confidence, filters_applied
 */
export const searchProductsByVoice = async (voiceText, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shop/products/search_by_voice/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ text: voiceText }),
    });

    const data = await response.json();

    // El backend devuelve success:true incluso con 0 resultados
    // Solo devuelve success:false cuando no puede interpretar el comando
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor inicia sesión.');
      }
      throw new Error(data.error || 'Error al buscar productos');
    }

    return data;
  } catch (error) {
    console.error('Error en voiceSearchService:', error);
    throw error;
  }
};
