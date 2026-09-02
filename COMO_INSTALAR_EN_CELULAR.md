# Cómo tener MEGA MAPS en tu celular

## 1. Sube el proyecto a GitHub
1. Crea una cuenta en https://github.com si no tienes.
2. Crea un repositorio nuevo, por ejemplo `megamaps`.
3. Sube TODOS los archivos de esta carpeta (`index.html`, `style.css`,
   `script.js`, `manifest.json`, `sw.js`, la carpeta `assets/`, etc.) —
   arrástralos a la página del repositorio en GitHub, o usa Git:
   ```bash
   cd megamaps
   git init
   git add .
   git commit -m "Primera versión de MEGA MAPS"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/megamaps.git
   git push -u origin main
   ```

## 2. Activa GitHub Pages
1. En tu repositorio, ve a **Settings → Pages**.
2. En "Source" elige la rama `main` y la carpeta `/ (root)`.
3. Guarda. GitHub te da una URL como:
   `https://TU_USUARIO.github.io/megamaps/`
   (tarda 1-2 minutos en activarse la primera vez)

## 3. Ábrela en tu celular y agrégala a la pantalla de inicio
**Android (Chrome):**
1. Abre la URL de GitHub Pages en Chrome.
2. Toca los tres puntos (⋮) arriba a la derecha.
3. "Agregar a pantalla de inicio" → confirmar.

**iPhone (Safari):**
1. Abre la URL en Safari (tiene que ser Safari, no Chrome — en iPhone
   solo Safari puede instalar en la pantalla de inicio).
2. Toca el botón de compartir (el cuadrito con la flecha hacia arriba).
3. "Agregar a pantalla de inicio" → confirmar.

Después de esto te va a quedar un ícono con el escudo del colegio que
abre la app a pantalla completa, sin la barra del navegador — se siente
como una app normal.

## Notas honestas
- **No es una app "de verdad" en Play Store / App Store** — es una PWA
  (Progressive Web App). Funciona muy parecido, pero no pasa por ninguna
  tienda de aplicaciones. Si más adelante quieres publicarla en las
  tiendas, eso ya requiere herramientas distintas (Capacitor, React
  Native, etc.) — este proyecto no está armado para eso todavía.
- El **service worker** (que permite que abra rápido y funcione con mala
  señal) solo se activa cuando la sirves por HTTPS real (como GitHub
  Pages) — si solo abres el archivo `index.html` con doble clic desde tu
  computadora (`file://...`), esa parte no se activa. No es un error,
  es una restricción normal de seguridad de los navegadores.
- Los cambios que hagas en el **modo administrador** se guardan con
  `localStorage`, que es **por navegador y por dispositivo** — si editas
  salones desde tu celular, esos cambios no aparecen automáticamente en
  la computadora de otra persona. Para que todos vean los mismos datos
  actualizados, se necesita el backend real (`server.py`) con una base
  de datos compartida, no solo el frontend.
