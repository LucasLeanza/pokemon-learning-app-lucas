import { useState } from "react";
import SearchBar from './components/SearchBar'
import PokemonProfile from './components/PokemonProfile'
import './App.css'
import ThemeToggle from "./components/ThemeToggle";

/**
 * Componente principal de la aplicación
 * 
 * ¿Qué hace?
 * - Mantiene el estado del pokémon seleccionado
 * - Renderiza el SearchBar y el PokemonProfile
 * - Pasa datos entre componentes
 */

function App() {
  // ============================================
  // ESTADO
  // ============================================

  //Pokemon actualmente seleccionado (null al inicio)
  const [selectedPokemon, setSelectedPokemon] = useState(null)

  // ============================================
  // MANEJADORES
  // ============================================
  
  /**
   * Se ejecuta cuando el usuario selecciona un pokémon en el SearchBar
   * @param {Object} pokemon Datos completos del pokémon
   */

  const handleSelectPokemon = (pokemon) => {
    console.log('Pokémon seleccionado:', pokemon)
    setSelectedPokemon(pokemon)
  }

  // ============================================
  // RENDERIZADO
  // ============================================

  return (
    <div className="app">
      {/*BOTON DE TEMA*/}
      <ThemeToggle />

      {/*HEADER*/}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <img
              src="https://images.wikidexcdn.net/mwuploads/wikidex/b/b7/latest/20241009141717/Master_Ball_GO.png"
              alt="Pokeball"
              className="pokeball-icon"
            />
            Guía de Aprendizaje Pokémon
          </h1>
          <p className="app-subtitle">
            Aprende las fortalezas y debilidades de cada Pokémon
          </p>
        </div>
      </header>

      {/*CONTENIDO PRINCIPAL*/}
      <main className="app-main">
        {/*BARRA DE BÚSQUEDA*/}
        <div className="search-section">
          <SearchBar onSelectPokemon={handleSelectPokemon}/>
        </div>

        {/*PERFIL DEL POKEMON*/}
        <div className="profile-section">
          <PokemonProfile pokemon={selectedPokemon}/>
        </div>
      </main>

      {/*PIE DE PÁGINA*/}
      <footer className="app-footer">
        <p>
          Datos obtenidos de <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer">PokéAPI</a>
        </p>
        <p className="footer-note">
          Hecho por Lucas Leanza para aprender el stack MERN
        </p>
      </footer>
    </div>
  )
}

export default App