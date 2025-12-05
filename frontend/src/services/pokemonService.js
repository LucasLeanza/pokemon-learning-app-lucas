import axios from 'axios'

// const api = axios.create({
//   baseURL: '/api',
//   timeout: 5000,
//   headers: {
//     'Content-Type' : 'application/json'
//   }
// })

const baseURL = import.meta.env.PROD
  ? 'https://pokemon-learning-app.onrender.com'
  : '/api'

  const api = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

// ============================================
// INTERCEPTORES (PARA DEBUGGING)
// ============================================

//Se ejecuta ANTES de cada peticion
api.interceptors.request.use(
  (config) => {
    console.log(`📤 Petición: ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

//Se ejecuta DESPUES de cada respuesta
api.interceptors.response.use(
  (response) => {
    console.log(`📤 Respuesta: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ Error en petición:', error.message)
    return Promise.reject(error)
  }
)

// ============================================
// FUNCIONES DE LA API
// ============================================
/**
 * Buscar pokémon por nombre (autocompletado)
 * @param {string} query Texto de búsqueda
 * @returns {Promise} Lista de pokémon que coinciden
 */
export const searchPokemon = async (query) => {
  try {
    const response = await api.get('/pokemon/search', {
      params: { query }
    })
    return response.data
  } catch (error) {
    console.error('Error buscando pokémon:', error)
    throw error
  }
}

/**
 * Obtener detalles completos de un pokémon
 * @param {string} name - Nombre del pokémon
 * @returns {Promise} - Objeto con todos los datos del pokémon
 */
export const getPokemonDetails = async (name) => {
  try {
    const response = await api.get(`/pokemon/${name}`)
    return response.data
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Pokémon no encontrado')
    }
    console.error('Error obteniendo detalles:', error)
    throw error
  }
}

/**
 * Obtener pokémon aleatorio
 * @returns {Promise} - Pokémon aleatorio
 */
export const getRandomPokemon = async () => {
  try {
    const response = await api.get('/pokemon/random')
    return response.data
  } catch (error) {
    console.error('Error obteniendo pokemon aleatorio:', error)
    throw error
  }
}

export default api