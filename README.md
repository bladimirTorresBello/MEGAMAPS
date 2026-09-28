# MEGA MAPS — Megacolegio El Progreso

Aplicativo web de navegación y búsqueda de salones para el Megacolegio El Progreso, Yopal, Casanare.

## 📱 Cómo usar

1. **Abre `index.html`** en cualquier navegador (desktop o mobile); para compartir rutas editadas, sirve el proyecto mediante Apache/XAMPP y abre su dirección `http://localhost/...`
2. La aplicación funciona **sin internet** (offline)
3. Los datos locales se guardan en **localStorage**; las rutas personalizadas pueden compartirse entre navegadores mediante PHP y SQLite cuando se usa Apache/XAMPP

## 🎯 Modos

### Usuario
- Selecciona tu ubicación actual
- Busca un salón por número o nombre de docente
- Recibe ruta paso a paso con fotos reales
- Ve información de docentes, grados y áreas

### Administrador
- PIN: `1234`
- Gestiona salones y docentes
- Gestiona fotos por salón y por ruta
- Sube fotos JPEG de salones desde «Gestionar fotos de rutas» en el servidor con PHP y SQLite (requiere XAMPP/Apache)
- Guarda los cambios de salones y docentes en SQLite para compartirlos entre navegadores cuando se usa XAMPP
- Consulta las zonas y los profesores con el asistente de voz; puede leer en voz alta los pasos de navegación
- La guía de voz prefiere voces femeninas en español disponibles en el dispositivo y acompaña las instrucciones con mensajes motivadores
- Selecciona uno de los 5 lugares de inicio y visualiza el paso a paso completo
- Sube o cambia la foto de cada paso; las fotos quedan guardadas para esa ruta
- Edita rutas personalizadas

## 🏢 Estructura

- **31 salones** (101-118, 201-215)
- **40+ espacios** mapeados
- **Grafo BFS** para cálculo automático de rutas
- **5 zonas principales** con fotos reales

## 📊 Datos

- Docentes, grados y áreas actualizados
- Pisos 1 y 2
- Planos del colegio
- Fotos de entrada, cafetería, transición, coordinación y biblioteca

## ⚙️ Tecnología

- HTML + CSS + JavaScript
- Sin dependencias externas
- Responsive (desktop y mobile)

---

**Proyecto SENA** — Técnica en programación de software
**Megacolegio El Progreso** — Yopal, Casanare, Colombia
