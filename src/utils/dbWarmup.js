// src/utils/dbWarmup.js

/**
 * Utilidad para "calentar" Neon Database
 * 
 * Neon Database (plan gratuito) se suspende después de 5 minutos de inactividad
 * y tarda ~20-30 segundos en despertar en la primera petición.
 * 
 * Esta utilidad hace una petición de "warmup" al iniciar la app para despertar
 * la base de datos antes de que el usuario navegue.
 */

import axios from 'axios';

// ✅ CORREGIDO: Usar variable de entorno para producción
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8000/api';

/**
 * Intenta despertar la base de datos con una petición ligera
 * @returns {Promise<boolean>} true si tuvo éxito, false si falló
 */
export const warmupDatabase = async () => {
  try {
    console.log('🔥 [DB Warmup] Iniciando calentamiento de base de datos...');
    const startTime = Date.now();
    
    // Petición simple al endpoint de categorías (más ligero que productos)
    const response = await axios.get(`${API_BASE_URL}/shop/categories/`, {
      timeout: 60000, // 60 segundos para la primera petición
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ [DB Warmup] Base de datos lista en ${duration}ms`);
    
    return true;
  } catch (error) {
    console.error('❌ [DB Warmup] Error al calentar base de datos:', error.message);
    
    // Si es timeout, la DB está despertando pero aún no lista
    if (error.code === 'ECONNABORTED') {
      console.warn('⚠️ [DB Warmup] Timeout - la base de datos está despertando...');
      console.warn('   Las siguientes peticiones deberían funcionar.');
    }
    
    return false;
  }
};

/**
 * Verifica si la base de datos está activa con una petición rápida
 * @returns {Promise<boolean>}
 */
export const isDatabaseAwake = async () => {
  try {
    await axios.get(`${API_BASE_URL}/shop/categories/`, {
      timeout: 5000, // Solo 5 segundos - si tarda más, está dormida
    });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sistema de keep-alive para mantener la DB despierta
 * Hace una petición ligera cada 4 minutos (antes de que se suspenda a los 5 min)
 */
export class DatabaseKeepAlive {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
  }

  start() {
    if (this.isActive) {
      console.log('⚠️ [DB Keep-Alive] Ya está activo');
      return;
    }

    console.log('🔄 [DB Keep-Alive] Iniciando sistema de keep-alive (cada 4 minutos)');
    this.isActive = true;

    // Petición inicial inmediata
    this.ping();

    // Configurar intervalo de 4 minutos (240,000 ms)
    this.intervalId = setInterval(() => {
      this.ping();
    }, 4 * 60 * 1000); // 4 minutos
  }

  async ping() {
    try {
      console.log('🏓 [DB Keep-Alive] Ping a la base de datos...');
      await axios.get(`${API_BASE_URL}/shop/categories/`, {
        timeout: 10000,
      });
      console.log('✅ [DB Keep-Alive] Pong recibido - DB activa');
    } catch (error) {
      console.error('❌ [DB Keep-Alive] Error en ping:', error.message);
    }
  }

  stop() {
    if (this.intervalId) {
      console.log('🛑 [DB Keep-Alive] Deteniendo sistema de keep-alive');
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isActive = false;
    }
  }
}

// Instancia global
export const dbKeepAlive = new DatabaseKeepAlive();
