# Que la app funcione SIN internet en el celular

## Lo que ya está listo en el código
- Los datos principales (salones, lugares y directorio de docentes)
  están disponibles en el cliente y la navegación funciona sin servidor.
- Si se abre con Apache/XAMPP, las rutas personalizadas se sincronizan
  con `megamaps.sqlite`; al abrir el archivo directamente, solo se
  guardan en el almacenamiento local de ese navegador.
- `manifest.json` + `sw.js` (service worker) → permiten que el
  celular guarde una copia completa de la app la primera vez que la
  abre, y la siga usando después sin señal.

## El único paso real que falta: la PRIMERA apertura sí necesita internet
Esto es física de cómo funcionan los navegadores, no algo que se pueda
evitar: la primerísima vez que alguien abre la app, el celular tiene
que **descargarla** de algún lado (no puede instalar lo que nunca ha
visto). Después de esa primera vez, ya no vuelve a necesitar señal.

Dos formas de hacer esa primera entrega:

### Opción A — con internet una sola vez (recomendada)
1. Sube la carpeta a GitHub Pages (como ya vimos antes).
2. La persona abre la URL **una vez, con datos o wifi**.
3. Sigue el paso de "Agregar a pantalla de inicio" (está en
   `COMO_INSTALAR_EN_CELULAR.md`).
4. Desde ahí en adelante, abre el ícono normal — **ya no necesita
   internet nunca más**, ni siquiera para actualizarla (a menos que tú
   subas cambios nuevos).

### Opción B — sin usar internet en ningún momento
Si de verdad nunca va a haber wifi/datos disponibles ni siquiera una vez:
1. Copia la carpeta completa (`index.html`, `style.css`, `script.js`,
   `manifest.json`, `sw.js`, `assets/`) directo al celular por USB o
   Bluetooth.
2. Ábrela con un navegador desde el explorador de archivos del celular
   (tocando `index.html`).
3. **Aviso honesto:** en este caso el service worker (`sw.js`) NO se
   activa — los navegadores lo bloquean por seguridad cuando abres un
   archivo local (`file://`) en vez de una página real. La app va a
   funcionar igual (porque todos los datos ya están en `script.js`,
   no dependen de internet), pero no vas a poder "instalarla" con
   ícono en la pantalla de inicio — cada vez hay que abrirla desde el
   explorador de archivos.

## Resumen en una frase
**Los datos y la lógica ya no dependen de internet para nada** — lo
único que puede llegar a necesitar señal es la entrega inicial del
archivo al celular, una sola vez, y solo si eliges la Opción A.


mira al momento de editar en la aplicacion web en el apartado de administrador, y edito las rutas, en visual studio code aparece la correcion pero al momento de abrilo en el index.html no.
quiero que corrijas eso manito