import { createContext, useContext, useState, useEffect } from "react";

/**
 * Contexto para manejar el tema (claro/oscuro) de toda la aplicación
 * 
 * ¿Qué es un Context?
 * Es una forma de compartir datos entre componentes sin tener que
 * pasar props manualmente en cada nivel (evita "prop drilling")
 * 
 * ¿Por qué lo usamos aquí?
 * Porque el tema debe ser accesible desde cualquier componente
 * y debe persistir entre recargas de página
 */

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  //Estado del tema: 'Light' o 'Dark'
  const [theme, setTheme] = useState(() => {
    //Al cargar intenta recuperar el tema del localStorage
    const savedTheme = localStorage.getItem('pokemon-theme')
    return savedTheme || 'light'
  })

  //Efecto para aplicar el tema al documento y guardarlo
  useEffect(() => {
    //Agregar o quitar la clase 'dark-mode' del body
    if (theme === 'dark') {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }

    //Guardar en localStorage para que persista
    localStorage.setItem('pokemon-theme', theme)
  }, [theme])

  //Funcion para alternar entre claro y oscuro
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return(
    <ThemeContext.Provider value={{ theme, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  )
}

//Hook personalizado para usar el contexto fácilmente
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}