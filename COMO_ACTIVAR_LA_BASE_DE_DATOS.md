# Cómo hacer que los cambios de administrador se vean en todos los celulares

Ahora mismo tienes DOS partes separadas:
1. **La app** (`index.html` + `style.css` + `script.js` + `nodos.js` +
   `aristas.js` + `sitios.js`) — ya funciona sola, sin nada más.
2. **El servidor con base de datos** (`server.py`) — existe, guarda tanto
   los **salones** como las **rutas personalizadas** que edites, pero
   necesita estar "encendido" en algún lugar de internet para que sirva
   de algo. Si nunca lo enciendes, no pasa nada malo: la app sigue
   funcionando igual que hasta ahora, solo que el modo administrador
   vuelve a guardar los cambios únicamente en el celular de quien los hizo.

## Paso 1 — Pruébalo en tu computadora primero (opcional pero recomendado)
```bash
pip install -r requirements.txt
python server.py
```
Abre en el navegador: `http://127.0.0.1:5000/api/salones` — si ves una
lista larga de salones en formato de texto raro (eso es JSON, es normal),
funciona. También puedes probar `http://127.0.0.1:5000/api/rutas`.

## Paso 2 — Ponlo en internet de verdad (para que sirva desde cualquier celular)
La forma más simple y gratis es **Render**:
1. Sube esta carpeta completa a GitHub (como ya hiciste con la app).
2. Entra a https://render.com, crea cuenta, "New +" → "Web Service".
3. Conecta tu repositorio de GitHub.
4. Configura:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn server:app`
5. En "Environment Variables" agrega:
   - **Key:** `MEGAMAPS_ADMIN_KEY`
   - **Value:** la clave real que tú quieras (ej. `elprogreso2026`) —
     esta reemplaza al PIN "1234" de mentiras que tenía la app antes.
     A partir de este momento, ese es el PIN que hay que escribir en
     "Acceso administrador" para que los cambios se guarden de verdad
     en el servidor (si escribes cualquier otra cosa, la app te deja
     entrar igual para no romper la demo, pero el servidor rechazará
     el guardado con un aviso de "Clave de administrador incorrecta").
6. Espera a que termine de desplegar. Te da una URL parecida a
   `https://megamaps-xxxx.onrender.com`.

## Paso 3 — Conecta la app a ese servidor
Abre `script.js`, busca esta línea cerca del principio:
```js
const API_BASE_URL = ""; // ej: "https://tu-app.onrender.com"
```
Y cámbiala por tu URL real:
```js
const API_BASE_URL = "https://megamaps-xxxx.onrender.com";
```
Vuelve a subir ese archivo a GitHub Pages (o donde tengas la app).

## Ya con eso:
- Cuando el administrador entre con la clave real (`MEGAMAPS_ADMIN_KEY`)
  y agregue o edite un salón, **o edite el texto de una ruta**, ese
  cambio queda guardado en la base de datos del servidor — **todos**
  los que abran la app después lo van a ver, sin importar desde qué
  celular lo hayan editado.
- Si el servidor está apagado o no hay internet, la app **no se rompe**:
  sigue funcionando con los últimos datos que ya tenía guardados en
  ese celular.

## Nota honesta sobre Render gratis
El plan gratuito de Render "se duerme" si nadie lo usa por un rato, y la
primera carga después de dormido tarda unos 30-50 segundos en responder.
Para una app de colegio que se usa varias veces al día esto normalmente
no es grave, pero si te molesta, los planes pagos (~7 USD/mes) evitan
ese problema. No hace falta que pagues para probarlo funcionando.

## Verificación que ya se hizo (antes de entregarte esto)
Se probó este flujo completo con un servidor Flask real corriendo:
un "dispositivo A" editó el texto de la ruta del Salón 107 con la
clave real del servidor, y un "dispositivo B" —un navegador
completamente aparte, sin ninguna cookie ni dato compartido con el
A— abrió la app después y vio exactamente esa misma ruta editada.
La sincronización entre dispositivos ya funciona en el código; lo
único que falta es que tú completes el Paso 2 (subir `server.py` a
un hosting real), porque eso requiere crear una cuenta que solo tú
puedes crear.

