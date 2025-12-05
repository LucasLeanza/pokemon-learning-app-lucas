const axios = require('axios')
const mongoose = require('mongoose')
require('dotenv').config()

const Pokemon = require('../models/Pokemon')
const { calculateTypeRelations } = require('../utils/typeEffectiveness')

// ============================================
// CONSTANTES
// ============================================

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'
const TOTAL_POKEMON = 1025; //Total en todas las generaciones: 1025

// ============================================
// FUNCIÓN: CONECTAR A MONGODB
// ============================================

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB')
  } catch (error) {
    console.error('❌ Error conectando a MongoDB', error)
    process.exit(1)
  }
}

// ============================================
// FUNCIÓN: OBTENER DATOS DE UN POKÉMON
// ============================================

/**
 * Obtiene los datos de un Pokémon desde la PokeAPI
 * 
 * @param {number} id del pokemon
 * @returns {Object} Datos procesados del pokemon
 * 
 * Funcionalidad:
 * 1. Hacer una petición a la API
 * 2. Extrae solo los datos que necesito
 * 3. Calcula la relaciones de tipo
 * 4. Devuelve un objeto listo para guarda en MongoDB
 */

async function fetchPokemonData(id) {
  try {
    console.log(`📡Obteniendo datos de Pokémon #${id}...`)

    //Peticion a la PokeAPI
    const response = await axios.get(`${POKEAPI_BASE}/pokemon/${id}`)
    const data = response.data

    // ============================================
    // EXTRAER TIPOS
    // ============================================

    /**
     * La PokeAPI devuelve tipos en este formato:
     * types: [
     *   {slot: 1, type: { name: 'fire', url: '...'} } ,
     *   {slot: 2, type: { name: 'flying', url: '...' } }
     * ]
     * 
     * Yo solo quiero: ['fire', 'flying']
     */

    const types = data.types
      .sort((a, b) => a.slot - b.slot) //Ordenar por slot (tipo primario primero)
      .map(t => t.type.name)

      // ============================================
    // EXTRAER ESTADÍSTICAS
    // ============================================
    
    /**
     * La PokeAPI devuelve stats en este formato:
     * stats: [
     *   { base_stat: 39, stat: { name: 'hp' } },
     *   { base_stat: 52, stat: { name: 'attack' } },
     *   ...
     * ]
     * 
     * Yo quiero un objeto plano:
     * { hp: 39, attack: 52, ... }
     */

    const stats = {};
    data.stats.forEach(stat => {
      //Convertir nombres de la API a camelcase
      const statName = stat.stat.name
        .replace('special-attack', 'specialAttack')
        .replace('special-defense', 'specialDefense')

        stats[statName] = stat.base_stat;
    })

    // ============================================
    // CALCULAR RELACIONES DE TIPO
    // ============================================
    
    /**
     * Aca uso la función que cree antes para calcular
     * automáticamente contra qué tipos es fuerte/débil
     */
    
    const typeRelations = calculateTypeRelations(types);

    // ============================================
    // CONSTRUIR OBJETO DEL POKÉMON
    // ============================================

    const pokemonData = {
      pokedexNumber: data.id,
      name: data.name,
      types: types,
      sprite: data.sprites.front_default,
      spriteShiny: data.sprites.front_shiny,
      height: data.height,
      weight: data.weight,
      stats: stats,

      //Relaciones de tipo calculadas automaticamente
      strongAgainst: typeRelations.strongAgainst,
      weakAgainst: typeRelations.weakAgainst,
      resistantTo: typeRelations.resistantTo,
      immuneTo: typeRelations.immuneTo
    }

    console.log(`✅ Datos obtenidos: ${data.name.toUpperCase()}`)

    return pokemonData
  } catch (error) {
    console.error(`❌ Error obteniendo Pokémon #${id}:`, error.message)
    throw error
  }
}

// ============================================
// FUNCIÓN: GUARDAR POKÉMON EN LA BASE DE DATOS
// ============================================

/**
 * Guarda o actualiza un Pokémon en MongoDB
 * 
 * @param {Object} pokemonData
 * 
 * Funcionalidad
 * Usa "upsert" (update + insert):
 * - Si el Pokémon ya existe, lo actualiza
 * - Si no existe, lo crea
 */

async function savePokemon(pokemonData) {
  try {
    //findOneAndUpdate con opción 'upsert'
    const pokemon = await Pokemon.findOneAndUpdate(
      { pokedexNumber: pokemonData.pokedexNumber }, //Busca por numero
      pokemonData,                                  //Datos a actualizar
      {
        upsert: true, //Crear si no existe (update + insert)
        new: true, //Devolver el documento actualizado
        runValidators: true //Ejecutar validaciones del Schema
      }
    )

    console.log(`💾 Guardado: #${pokemon.pokedexNumber} ${pokemon.displayName}`)

    return pokemon
  } catch (error) {
    console.error(`❌ Error guardando ${pokemonData.name}:`, error.message)
    throw error
  }
}

// ============================================
// FUNCIÓN: POBLAR BASE DE DATOS COMPLETA
// ============================================

/**
 * Función principal que descarga y guarda todos los Pokémon
 * 
 * ¿Qué hace?
 * 1. Se conecta a MongoDB
 * 2. Itera del 1 al TOTAL_POKEMON
 * 3. Para cada uno: descarga, procesa y guarda
 * 4. Muestra estadísticas al final
 * 
 * ¿Por qué con delay?
 * Para no saturar la PokeAPI con 151 peticiones simultáneas.
 * La API tiene límites de tasa (rate limiting).
 */

async function seedDatabase() {
  console.log('🌱 Iniciando población de base de datos...\n')

  await connectDB()

  let successCount = 0;
  let errorCount = 0;

  //Limpiar la colección antes de empezar
  const shouldClear = process.argv.includes('--clear')
  if (shouldClear) {
    console.log('🗑️ Limpiando base de datos...')
    await Pokemon.deleteMany({})
    console.log('✅ Base de datos limpiada\n')
  }

  //Iterar sobre todos los pokemon
  for (let i = 1; i <= TOTAL_POKEMON; i++) {
    try {
      //Obtener datos de la PokeAPI
      const pokemonData = await fetchPokemonData(i)

      //Guardar en MongoDB
      await savePokemon(pokemonData)

      successCount++;

      //Delay de 100ms para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      errorCount++
      console.error(`⚠️ Saltando Pokémon #${i}\n`)
    }
  }

  // ============================================
  // MOSTRAR ESTADÍSTICAS FINALES
  // ============================================

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE POBLACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📝 Total procesados: ${successCount + errorCount}`);

  //Mostrar algunos ejemplos de la base de datos
  console.log('\n🔍 Primero 5 Pokémon en la base de datos:');
  const samplePokemon = await Pokemon.find().limit(5).sort({ pokedexNumber: 1 })

  samplePokemon.forEach(p => {
    console.log(`  #${p.pokedexNumber} ${p.displayName} (${p.types.join('/')})`);
    console.log(`    💪 Fuerte contra: ${p.strongAgainst.join(', ')}`);
    console.log(`    ⚠️  Débil contra: ${p.weakAgainst.join(', ')}`);
  })

  console.log('\n✅ Proceso completado!')

  //Cerrar conexión
  await mongoose.connection.close()
  console.log('👋 Desconectado de MongoDB')
}

// ============================================
// FUNCIÓN: ACTUALIZAR UN SOLO POKÉMON
// ============================================

async function updateSinglePokemon(id) {
  await connectDB()

  try {
    const pokemonData = await fetchPokemonData(id)
    await savePokemon(pokemonData)
    console.log('\n✅ Pokémon actualizado exitosamente')
  } catch (error) {
    console.error('\n❌ Error:', error.message)
  }

  await mongoose.connection.close()
}

// ============================================
// EJECUTAR SCRIPT
// ============================================
/**
 * Detectar qué función ejecutar según los argumentos
 * 
 * Uso:
 * node seedPokemons.js              - Poblar todos
 * node seedPokemons.js --clear      - Limpiar y poblar
 * node seedPokemons.js --update 25  - Actualizar Pikachu (#25)
 */

const args = process.argv.slice(2)

if (args.includes('--update')) {
  const id = parseInt(args[args.indexOf('--update') +1])
  if (id) {
    updateSinglePokemon(id)
  } else {
    console.error('❌ Debes especificar un ID: --update 25')
  }
} else {
  seedDatabase();
}