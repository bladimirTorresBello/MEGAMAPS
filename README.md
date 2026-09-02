# MEGA MAPS — Megacolegio El Progreso

## Mapas por piso (versión actual)

- La pantalla de mapa ya no dibuja una ruta animada sobre una foto
  única del colegio. Ahora muestra el plano oficial del piso (o los
  pisos) que realmente se recorren a pie, usando dos imágenes fijas:
  `assets/plano_piso1.jpg` y `assets/plano_piso2.jpg`.
- Regla para decidir qué plano(s) mostrar, según el piso de origen y
  el piso de destino:
  - Origen y destino en el mismo piso → se muestra solo ese piso.
  - Origen y destino en pisos distintos → se muestran los dos,
    **en el orden en que se caminan** (el piso de salida primero, el
    piso de llegada después). Por ejemplo: desde "Biblioteca" (piso 2)
    hacia un salón del piso 1, se muestra primero el plano del Piso 2
    y luego el del Piso 1.
- Ya no existe ningún dibujo de línea de ruta ni animación sobre el
  mapa (se eliminaron por completo `drawMap`, el `<canvas>` y todo el
  código relacionado). La guía visual del camino ahora vive solo en
  "Indicaciones paso a paso" (con emojis) y en "Iniciar navegación"
  (modo de flecha grande paso a paso).
- El *service worker* (`sw.js`) se corrigió para guardar en caché
  `plano_piso1.jpg` y `plano_piso2.jpg` — antes seguía apuntando al
  archivo `plano_nivel1.png` ya eliminado, lo que podía romper la
  instalación de la app la primera vez que alguien la abría sin haber
  limpiado su caché anterior.

## Corrección del plano del Piso 1
- Se reemplazó `assets/plano_piso1.jpg` por la versión corregida
  enviada, que ahora marca la ubicación real de la rampla (junto a
  los salones 104-107 y junto a los salones 111-118).
- Se subió la versión de caché del service worker para que los
  celulares que ya tenían la app instalada descarguen el plano
  corregido.

## Corrección: barra inferior tapaba los últimos pasos en rutas largas
- La barra de navegación inferior (Inicio/Mapa/Salones/Ayuda) usaba
  `position:absolute`, lo que la dejaba pegada visualmente al fondo
  de la pantalla pero **fuera del flujo real del contenido**. En
  rutas con más de 9 pasos, al deslizar hasta el final, la barra
  terminaba tapando los últimos pasos en vez de quedar debajo.
- Se cambió a `position:sticky`, que reserva su propio espacio en el
  contenido y nunca se superpone a los elementos anteriores. Se
  probó con una ruta de 16 pasos (Entrada → Salón 215): ahora se
  puede deslizar y ver el último paso, el botón "Iniciar navegación"
  y la barra, todos visibles sin taparse.

## Emojis de las rutas restaurados
- Este `script.js` había sido subido desde una copia anterior a la
  tabla de emojis que se acordó (usaba 🚶 genérico y "Sigue recto").
  Se restauró completa: 🚶🏻‍♂️ para salir/dirigirse, ⬅️➡️ para girar,
  ⬆️ para seguir derecho/rampla/pasar, ⬇️ para bajar rampla, 🪜 para
  escaleras (subir o bajar). También se restauró `iconoPorTexto()`,
  que recalcula el emoji automáticamente cuando el administrador edita
  el texto de un paso a mano.
