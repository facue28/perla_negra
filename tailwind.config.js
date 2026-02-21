/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Colores base extraídos de Colores.png
                background: {
                    dark: '#000000',    // Background principal
                    alt: '#141414',     // Fondo alternativo / Cards
                },
                text: {
                    primary: '#FFFFFF', // Texto principal
                    muted: '#B1B5B4',   // Texto secundario / Bordes
                },
                accent: {
                    DEFAULT: '#3FFFC1', // Amarillo/Verde neón principal
                    hover: '#32cc9a',   // Variación apenas más oscura para hover
                    light: '#66ffcd',   // Variación más clara para efectos
                },
                border: {
                    DEFAULT: '#B1B5B4', // Para bordes con opacidad
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
            }
        },
    },
    plugins: [],
}
