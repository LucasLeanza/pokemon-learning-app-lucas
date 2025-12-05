import { useTheme } from "../contexts/ThemeContext";
import './ThemeToggle.css'

/**
 * Botón para cambiar entre modo claro y oscuro
 * Usa iconos de tipos Pokémon: Hada (claro) y Siniestro (oscuro)
 */

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const fairyIcon = 'https://duiker101.github.io/pokemon-type-svg-icons/icons/fairy.svg';
  const darkIcon = 'https://duiker101.github.io/pokemon-type-svg-icons/icons/dark.svg';

  return (
    <button
    className="theme-toggle"
    onClick={toggleTheme}
    aria-label="Cambiar Tema"
    title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          <img
            src={theme === 'light' ? fairyIcon : darkIcon}
            alt={theme === 'light' ? 'Modo claro' : 'Modo oscuro'}
            className="theme-icon"
          />
        </div>
      </div>
    </button>
  )
}

export default ThemeToggle