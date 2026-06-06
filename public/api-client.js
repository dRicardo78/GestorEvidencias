// api-client.js
// Cliente HTTP para interactuar con la API del backend

const API_BASE_URL = `${window.location.origin}/api`;

/**
 * Realiza una petición HTTP genérica
 * @param {string} endpoint - Ruta de la API (ej: '/libros')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Datos a enviar (para POST/PUT)
 * @returns {Promise} Respuesta JSON del servidor
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Parsear respuesta
    const result = await response.json();

    // Si hay error en la respuesta, lanzar excepción
    if (!response.ok) {
      const errorMessage = result.error || result.message || 'Error desconocido';
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error(`Error en ${method} ${endpoint}:`, error);
    throw error;
  }
}

// ==================== EVIDENCIAS ====================

const EvidenciasAPI = {
  /**
   * Obtener todas las evidencias con filtros opcionales
   * @param {object} filtros - { estudiante, tipo, estado }
   */
  getAll: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.estudiante) params.append('estudiante', filtros.estudiante);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.estado) params.append('estado', filtros.estado);

    const queryString = params.toString();
    const endpoint = queryString ? `/evidencias?${queryString}` : '/evidencias';
    return apiCall(endpoint);
  },

  /**
   * Obtener una evidencia por ID
   * @param {string} id - ID de MongoDB de la evidencia
   */
  getById: (id) => apiCall(`/evidencias/${id}`),

  /**
   * Crear una nueva evidencia
   * @param {object} evidencia - Datos de la evidencia
   */
  create: (evidencia) =>
    apiCall('/evidencias', 'POST', {
      estudiante: evidencia.estudiante,
      tipo: evidencia.tipo,
      nombre: evidencia.nombre,
      descripcion: evidencia.descripcion,
      archivo: evidencia.archivo || null,
    }),

  /**
   * Actualizar una evidencia
   * @param {string} id - ID de MongoDB de la evidencia
   * @param {object} updates - Campos a actualizar
   */
  update: (id, updates) =>
    apiCall(`/evidencias/${id}`, 'PUT', {
      estudiante: updates.estudiante,
      tipo: updates.tipo,
      nombre: updates.nombre,
      descripcion: updates.descripcion,
      archivo: updates.archivo || undefined,
      estado: updates.estado || undefined,
    }),

  /**
   * Eliminar una evidencia
   * @param {string} id - ID de MongoDB de la evidencia
   */
  delete: (id) => apiCall(`/evidencias/${id}`, 'DELETE'),

  /**
   * Cambiar estado de una evidencia
   * @param {string} id - ID de MongoDB de la evidencia
   * @param {string} estado - Nuevo estado (Pendiente, Revisada, Aprobada, Rechazada)
   */
  updateEstado: (id, estado) =>
    apiCall(`/evidencias/${id}`, 'PUT', { estado }),
};

// ==================== UTILITARIOS ====================

const Utils = {
  /**
   * Mostrar mensaje de error al usuario
   * @param {string} mensaje - Mensaje a mostrar
   * @param {number} duracion - Duración en ms (0 = permanente)
   */
  showError: (mensaje, duracion = 4000) => {
    const errorBox = document.createElement('div');
    errorBox.className = 'error-message';
    errorBox.setAttribute('role', 'alert');
    errorBox.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      max-width: 400px;
      word-wrap: break-word;
    `;
    errorBox.textContent = mensaje;
    document.body.appendChild(errorBox);

    if (duracion > 0) {
      setTimeout(() => errorBox.remove(), duracion);
    }

    return errorBox;
  },

  /**
   * Mostrar mensaje de éxito
   * @param {string} mensaje - Mensaje a mostrar
   * @param {number} duracion - Duración en ms
   */
  showSuccess: (mensaje, duracion = 2500) => {
    const successBox = document.createElement('div');
    successBox.className = 'success-message';
    successBox.setAttribute('role', 'status');
    successBox.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #16a34a;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      max-width: 400px;
      word-wrap: break-word;
    `;
    successBox.textContent = mensaje;
    document.body.appendChild(successBox);

    if (duracion > 0) {
      setTimeout(() => successBox.remove(), duracion);
    }

    return successBox;
  },

  /**
   * Formatear fecha ISO a formato legible
   * @param {string} isoDate - Fecha ISO (ej: 2024-01-15T10:30:00Z)
   * @returns {string} Fecha formateada (ej: 15/01/2024)
   */
  formatDate: (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES');
  },

  /**
   * Validar email básico
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Escapar HTML para evitar inyección XSS
   * @param {string} text - Texto a escapar
   * @returns {string}
   */
  escapeHtml: (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
};

// Exportar para uso en módulos (si se usa módulos ES6)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { apiCall, EvidenciasAPI, Utils };
}
