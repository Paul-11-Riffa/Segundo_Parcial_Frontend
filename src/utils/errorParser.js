/**
 * Normaliza distintos formatos de error que el backend puede devolver
 * Devuelve un mensaje legible para mostrar al usuario y, opcionalmente,
 * una estructura con detalles (por campo) cuando aplique.
 */
export function parseApiError(err) {
  if (!err) return { message: 'Error desconocido.' };

  // Si ya es un string
  if (typeof err === 'string') return { message: err };

  // Axios error shape: err.response.data
  const data = err.response?.data || err.data || null;

  // If no structured data, fall back to err.message
  if (!data) return { message: err.message || 'Error desconocido.' };

  // Common DRF shapes:
  // { detail: '...' }
  if (typeof data.detail === 'string') return { message: data.detail };

  // { error: '...' } or { message: '...' }
  if (typeof data.error === 'string') return { message: data.error };
  if (typeof data.message === 'string') return { message: data.message };

  // Validation errors: { field: ["msg1","msg2"] }
  if (typeof data === 'object') {
    // If it's an array of errors
    if (Array.isArray(data) && data.length > 0) {
      return { message: String(data[0]) };
    }

    // If keys map to arrays
    const fieldMessages = {};
    const messages = [];
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val)) {
        fieldMessages[key] = val.map(String);
        messages.push(`${key}: ${val[0]}`);
      } else if (typeof val === 'string') {
        fieldMessages[key] = [val];
        messages.push(`${key}: ${val}`);
      }
    }

    if (messages.length > 0) {
      return { message: messages.join(' — '), details: fieldMessages };
    }
  }

  // Fallback
  return { message: JSON.stringify(data) || 'Error desconocido.' };
}

export default parseApiError;
