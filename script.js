
/** Quita tildes/mayúsculas/símbolos para que la búsqueda no dependa de escribir bien */
function normalizar(s){
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

function bfsPath(origen, destino){
  if(!GRAFO[origen] || !GRAFO[destino]) return null;
  const visitados = new Set([origen]);
  const cola = [[origen]];
  while(cola.length){
    const camino = cola.shift();
    const nodo = camino[camino.length-1];
    if(nodo === destino) return camino;
    for(const vecino of GRAFO[nodo]){
      if(!visitados.has(vecino)){
        visitados.add(vecino);
        cola.push([...camino, vecino]);
      }
    }
  }
  return null;
}

function generarPasos(camino){
  if(!camino || camino.length < 2) return [];
  const pts = camino.map(id => NODOS[id]);
  const pasos = [];
  pasos.push({ ic:"🚶🏻‍♂️", txt:`Sal de ${pts[0].label} y sigue por el pasillo.` });

  for(let i=1; i<pts.length-1; i++){
    const a = pts[i-1], b = pts[i], c = pts[i+1];
    if((b.piso||1) !== (a.piso||1)){
      pasos.push({ ic:"🪜", txt:`Sube al piso ${b.piso} por ${b.label}.` });
      continue;
    }
    const v1 = {x:b.x-a.x, y:b.y-a.y};
    const v2 = {x:c.x-b.x, y:c.y-b.y};
    const cross = v1.x*v2.y - v1.y*v2.x;
    const dot = v1.x*v2.x + v1.y*v2.y;
    const mag1 = Math.hypot(v1.x,v1.y)||1, mag2 = Math.hypot(v2.x,v2.y)||1;
    const cos = Math.max(-1, Math.min(1, dot/(mag1*mag2)));
    const angulo = Math.acos(cos) * (180/Math.PI);
    let ic="⬆️", txt=`Sigue derecho hasta ${b.label}.`;
    if(angulo > 25){
      if(cross > 0){ ic="➡️"; txt=`Gira a la derecha en ${b.label}.`; }
      else { ic="⬅️"; txt=`Gira a la izquierda en ${b.label}.`; }
    }
    pasos.push({ ic, txt });
  }
  pasos.push({ ic:"🟩", txt:`Has llegado: ${pts[pts.length-1].label}.` });
  return pasos;
}

/** Detecta el emoji correcto según las palabras clave que use el
    administrador al escribir/editar un paso a mano, siguiendo esta
    tabla fija (acordada y validada antes):
      Gira a la izquierda        -> ⬅️
      Gira a la derecha          -> ➡️
      Dirígete... / Sal de...    -> 🚶🏻‍♂️
      Sube las escaleras         -> 🪜
      Baja la rampa/rampla       -> ⬇️
      Sigue derecho/recto,
      Sube la rampa/rampla,
      Pasa por...                -> ⬆️
    Si el texto no coincide con ninguna palabra clave, devuelve null
    y se conserva el ícono que ya tenía el paso. */
function iconoPorTexto(txt){
  if(!txt) return null;
  const n = normalizar(txt);
  if(n.includes('izquierda')) return '⬅️';
  if(n.includes('derecha')) return '➡️';
  if(n.includes('dirigete') || n.includes('sal de')) return '🚶🏻‍♂️';
  if(n.includes('escalera')) return '🪜';
  if(n.includes('baja') && (n.includes('rampa') || n.includes('rampla'))) return '⬇️';
  if(n.includes('rampa') || n.includes('rampla') || n.includes('derecho') || n.includes('recto') || n.includes('pasa')) return '⬆️';
  return null;
}

/* ============================================================
   DIRECTORIO REAL — extraído de las dos planillas de directores
   de grado 2026 (jornada mañana y jornada tarde).

   ⚠️ El campo "area" de jornada mañana viene de una columna
   escrita a mano y parcialmente ilegible: revísala con
   coordinación antes de confiar en ella al 100%.
   ============================================================ */
const DATOS_SALONES_BASE = {
  "101":{piso:1, manana:{grado:"—",nombre:"Jesus David Villamizar Valencia",area:"Matemáticas"}},
  "102":{piso:1, manana:{grado:"6B", nombre:"Magda Lisbeth Riaño Vargas", area:null}, tarde:{grado:"3-A", nombre:"Nidia Yaneth Mondragon Piñeros", area:"Informática"}},
  "103":{piso:1, manana:null, tarde:{grado:"3-B", nombre:"Nayibe Estepa Lopez", area:"Plan Lector, Ética y Religión"}},
  "104":{piso:1, manana:{grado:"6C", nombre:"Ana Sulay Arcos Pacheco", area:"Sociales - C. Políticas"}, tarde:{grado:"3-C", nombre:"Ana Gertrudis Cardenas Cardenas", area:"Inglés - Ciencias Naturales"}},
  "105":{piso:1, tarde:{grado:"3-D",nombre:"Hector Alirio Motavita Sanchez",area:null}, manana:{grado:"6E",nombre:"Marcela Correa Higuera",area:null}},
  "106":{piso:1, tarde:{grado:"4-A",nombre:"Doris Mayer Davila Alfonso",area:null}, manana:{grado:"8A",nombre:"Jose Leonardo Rosas Chaparro",area:"Inglés"}},
  "107":{piso:1, manana:{grado:"7B", nombre:"Olga Milena Restrepo Lopez", area:"Inglés"}, tarde:{grado:"4-B", nombre:"Yaneth Garzon Beltran", area:"Lengua Castellana, Artes, Ética"}},
  "108":{piso:1, manana:{grado:"10C", nombre:"Darly Ximena Silva Fetecua", area:null}, tarde:{grado:"4-C", nombre:"Hernando Garcia Silva", area:"Educación Física, Sociales"}},
  "109":{piso:1, manana:{grado:"8B", nombre:"Fabio Acosta Rivera", area:"Sociales"}, tarde:{grado:"4-D", nombre:"Zulaima Ayde Medina Mojica", area:"Matemáticas, Estadística"}},
  "110":{piso:1, manana:{grado:"9B",nombre:"Johan Fernando Vega Gomez",area:"Filosofía"}},
  "111":{piso:1, manana:{grado:"—", nombre:"Mayra Lizeth Gutierrez Fonseca", area:null}, tarde:{grado:"1-A", nombre:"Doris Marlen Plazas Mora", area:null}},
  "112":{piso:1, tarde:{grado:"1-B",nombre:"Claudia Patricia Cristancho Perez",area:null}, manana:{grado:"CR A",nombre:"Judit Xiomara Leon Pedraza",area:null}},
  "113":{piso:1, manana:{grado:"CR B", nombre:"Johana Nazareth Lopez Florez", area:null}, tarde:{grado:"1-C", nombre:"Samirna del Carmen Gonzalez V.", area:null}},
  "114":{piso:1, manana:{grado:"—", nombre:"Juan Jose Arias Giraldo", area:"Matemáticas"}, tarde:{grado:"1-D", nombre:"Mery Vastid Sánchez Velandia", area:null}},
  "115":{piso:1, manana:{grado:"—", nombre:"Criss Dahiana Laverde Torres", area:"Español"}, tarde:{grado:"2-A", nombre:"Dency Maria Torres Murillo", area:null}},
  "116":{piso:1, tarde:{grado:"2-B",nombre:"Ana Lizbeth Velandia Fuentes",area:null}, manana:{grado:"10A",nombre:"Diana Marcela Rodriguez Suarez",area:"Español"}},
  "117":{piso:1, tarde:{grado:"2-C",nombre:"Nelly Esmeralda Gutierrez Ceron",area:null}, manana:{grado:"9C",nombre:"Carlos Eduardo Ramirez Duarte",area:"Español"}},
  "118":{piso:1, manana:{grado:"7E",nombre:"Eliana Yulieth Cuervo Higuera",area:null}},

  "201":{piso:2, manana:{grado:"11B",nombre:"Diego Alfonso Avila Moreno",area:"Ética - Religión"}},
  "203":{piso:2, manana:{grado:"—", nombre:"Jose Alberto Silva Gil", area:"Ética - Religión"}, tarde:{grado:"5-A", nombre:"Gilma Ines Cely Avila", area:"Ética y Religión - Informática"}},
  "204":{piso:2, manana:{grado:"7D", nombre:"Fabian Alexander Morales Rodriguez", area:"Ética - Religión"}, tarde:{grado:"5-B", nombre:"Maria Mercedes Reyes Sanchez", area:"Sociales, Inglés, Artes"}},
  "205":{piso:2, manana:{grado:"6D", nombre:"Arcely Ortiz Gualdron", area:null}, tarde:{grado:"5-C", nombre:"Gonzalo Mendoza Rojas", area:"Matemáticas, Geometría, Estadística"}},
  "206":{piso:2, manana:{grado:"9A", nombre:"Rolando Enrique Acosta Perez", area:"Física"}, tarde:{grado:"5-D", nombre:"Camilo Murillo Asprilla", area:"Naturales, Educación Física"}},
  "207":{piso:2, manana:{grado:"11A",nombre:"Nancy Fabiola Chaparro Lopez",area:"Naturales - Química"}},
  "209":{piso:2, manana:{grado:"8C",nombre:"Felix Riaches Chaparro",area:"Artes"}},
  "210":{piso:2, manana:{grado:"7C",nombre:"Fabio Andres Ampudia Castillo",area:"C. Políticas - Sociales"}},
  "211":{piso:2, manana:{grado:"AC A",nombre:"Ana Elsa Sepulveda Caro",area:null}},
  "212":{piso:2, manana:{grado:"AC B",nombre:"Carolina Martinez Cardona",area:null}},
  "213":{piso:2, manana:{grado:"7A",nombre:"Marinelba Oropeza Hernandez",area:"Física - Matemáticas"}},
  "214":{piso:2, manana:{grado:"—", nombre:"Viviana Marcela Angel Paramo", area:"Matemáticas"}, tarde:null},
  "215":{piso:2, manana:{grado:"10B",nombre:"Freddy Antonio Chacon Peña",area:"Matemáticas"}},


};

const DOCENTES_ITINERANTES = [
  { nombre:"Guido Arnoldo Rodriguez Torrente", area:"Informática (Inf 1)", nota:"Sin salón fijo" },
  { nombre:"Nini Johana Salamanca Maldonado", area:"Informática (Inf 1)", nota:"Sin salón fijo" },
];

/* ============================================================
   sandbox de artifacts de claude.ai). Si no, se queda en memoria
   y se pierde al recargar (aceptable como demo).
   ============================================================ */
/* ============================================================
   Backend real (opcional) — si tienes server.py corriendo en algún
   lado, pon aquí su URL y la app va a usar la base de datos de verdad
   en vez de guardar los cambios solo en este navegador.
   Déjalo vacío ("") para seguir funcionando 100% sin servidor.
   ============================================================ */
const API_BASE_URL = ""; // ej: "https://tu-app.onrender.com"

async function sincronizarConServidor(){
  if(!API_BASE_URL) return false;
  let huboServidor = false;
  try{
    const res = await fetch(`${API_BASE_URL}/api/salones`);
    if(res.ok){
      const data = await res.json();
      Object.entries(data).forEach(([numero, r])=>{
        SALONES[numero] = {
          nombre: r.nombre,
          nodeId: NODOS[`salon_${numero}`] ? `salon_${numero}` : (NODOS[numero] ? numero : `salon_${numero}`),
          piso: r.piso,
          manana: r.manana,
          tarde: r.tarde
        };
      });
      guardarSalones(SALONES);
      huboServidor = true;
    }
  }catch(e){ /* sin servidor disponible, seguimos con los datos locales */ }

  try{
    const res = await fetch(`${API_BASE_URL}/api/rutas`);
    if(res.ok){
      const remotas = await res.json();
      // El servidor es la fuente compartida: sus rutas reemplazan las
      // que este navegador tuviera guardadas para las mismas claves,
      // así todos los dispositivos terminan viendo lo mismo.
      Object.assign(RUTAS_PERSONALIZADAS, remotas);
      guardarRutasPersonalizadas(RUTAS_PERSONALIZADAS);
      huboServidor = true;
    }
  }catch(e){ /* sin servidor disponible, seguimos con las rutas locales */ }

  return huboServidor;
}

const STORAGE_KEY = "megamaps_salones_v3";

/* Lugares que ya no existen — se limpian aunque el navegador tuviera
   una copia vieja guardada en localStorage con ellos todavía adentro. */
const LUGARES_ELIMINADOS = [
  "biblioteca","taller_manualidades","laboratorio2","almacen_pedagogico",
  "enfermeria","rectoria","sala_academicos","aula_multiple","aula_ingles",
  "aula_class","idi_clase","idi_lounge","banos_116"
];

function cargarSalones(){
  let data = null;
  try{
    const guardado = localStorage.getItem(STORAGE_KEY);
    if(guardado) data = JSON.parse(guardado);
  }catch(e){ /* localStorage no disponible en este contexto */ }

  if(!data){
    data = {};
    Object.entries(DATOS_SALONES_BASE).forEach(([num,d])=>{
      data[num] = {
        nombre: /^\d+$/.test(num) ? `Salón ${num}` : NODOS[d.nodeIdOverride]?.label || num,
        nodeId: d.nodeIdOverride || `salon_${num}`,
        piso: d.piso,
        manana: d.manana || null,
        tarde: d.tarde || null
      };
    });
  }

  let huboLimpieza = false;
  LUGARES_ELIMINADOS.forEach(id => {
    if(data[id]){ delete data[id]; huboLimpieza = true; }
  });
  if(huboLimpieza) guardarSalones(data); // deja guardada la limpieza para que no vuelva a pasar

  return data;
}

function guardarSalones(data){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch(e){ /* no persiste en este contexto, sigue funcionando en memoria */ }
}

let SALONES = cargarSalones();

/* ============================================================
   Rutas personalizadas por administrador — se guardan por par
   (sitio de origen -> salón destino). Si existe una ruta guardada
   para ese par exacto, se usa en vez de calcularla con BFS.
   ============================================================ */
const RUTAS_STORAGE_KEY = "megamaps_rutas_v1";

function cargarRutasPersonalizadas(){
  try{
    const guardado = localStorage.getItem(RUTAS_STORAGE_KEY);
    if(guardado) return JSON.parse(guardado);
  }catch(e){ /* localStorage no disponible en este contexto */ }
  return {};
}
function guardarRutasPersonalizadas(data){
  try{
    localStorage.setItem(RUTAS_STORAGE_KEY, JSON.stringify(data));
    return true;
  }catch(e){
    alert('No se pudo guardar en este navegador (' + e.message + '). La ruta va a funcionar solo mientras no cierres/recargues esta pestaña.');
    return false;
  }
}
let RUTAS_PERSONALIZADAS = cargarRutasPersonalizadas();
function claveRuta(origenId, destinoNodeId){ return `${origenId}__${destinoNodeId}`; }

/** Lee una ruta guardada normalizando el formato (soporta el formato viejo, solo array de ids) */
function obtenerRutaGuardada(clave){
  const r = RUTAS_PERSONALIZADAS[clave];
  if(!r) return null;
  if(Array.isArray(r)) return { camino: r, etiquetas: null }; // formato viejo
  return r; // formato nuevo: {camino, etiquetas}
}

/** Genera los pasos combinando el ícono automático (según ángulos reales) con el texto
    que el administrador escribió a mano, si existe */
function combinarPasos(camino, etiquetas){
  const auto = generarPasos(camino);
  if(!etiquetas) return auto;
  return auto.map((p,i) => {
    if(!etiquetas[i]) return p;
    const icDetectado = iconoPorTexto(etiquetas[i]);
    return { ic: icDetectado || p.ic, txt: etiquetas[i] };
  });
}

/* Planos oficiales reales por piso (imágenes estáticas, sin ninguna
   línea de ruta dibujada encima — esa animación fue eliminada por
   decisión explícita del equipo). */

/* Contador para ubicar salones nuevos agregados por el admin */
let extPiso1 = 0, extPiso2 = 0;
function crearNodoParaSalonNuevo(numero, piso){
  const id = `salon_${numero}`;
  if(NODOS[id]) return id;
  if(piso === 2){
    extPiso2++;
    NODOS[id] = { label:`Salón ${numero}`, x:0.15+extPiso2*0.05, y:0.98, piso:2 };
    GRAFO[id] = [];
    ARISTAS.push(["pasillo_piso2", id]);
    GRAFO["pasillo_piso2"].push(id); GRAFO[id].push("pasillo_piso2");
  } else {
    extPiso1++;
    NODOS[id] = { label:`Salón ${numero}`, x:0.15+extPiso1*0.05, y:0.98, piso:1 };
    GRAFO[id] = [];
    ARISTAS.push(["escaleras_principales", id]);
    GRAFO["escaleras_principales"].push(id); GRAFO[id].push("escaleras_principales");
  }
  return id;
}

let state = {
  view:"landing",
  modo:null,          // "usuario" | "admin"
  origenId:null,
  origenLabel:null,
  salonBuscado:null,
  ruta:null,
  pasos:null,
  pasoActual:0,
  adminEditando:null,   // número de salón que se está editando, o null = nuevo
  adminRutaSalon:null,  // número de salón cuya ruta se está editando
  adminRutaOrigen:null, // id del sitio de partida elegido para esa ruta
  adminRutaCamino:null,  // array de ids de nodos: la ruta en edición (para las coordenadas del mapa)
  adminRutaEtiquetas:null, // array de textos libres por paso (lo que el admin escribe, se muestra tal cual)
  adminRutaSnapshot:null, // copia de la ruta antes de entrar a modo edición, para poder cancelar
  adminRutaEditando:false // false = mostrar el paso a paso tal cual; true = modo edición manual
};

const screenEl = document.getElementById('screen');
const homeBtn = document.getElementById('homeBtn');
homeBtn.addEventListener('click', ()=> go('landing'));

function render(){
  screenEl.innerHTML = views[state.view]();
  homeBtn.classList.toggle('hidden', state.view === 'landing');
  attachHandlers(state.view);
}
function go(view){ state.view = view; render(); }

/* ============================================================
   VISTAS
   ============================================================ */
const views = {

  landing: () => `
    <div class="fade">
      <div class="logo-wrap"><img src="assets/logo_megamaps.png" alt="MEGA MAPS — Tu ruta, tu destino, sin perderte nunca"></div>

      <div class="feature-chips">
        <span>🗺️ Rutas en tiempo real</span>
        <span>🧑‍🏫 Directorio real</span>
        <span>📶 Funciona sin señal</span>
      </div>

      <button class="btn btn-primary land-btn" style="margin-bottom:10px;animation-delay:.55s;" data-go="sitio">
        <span class="land-btn-ic">🎒</span> Usuario
      </button>
      <button class="btn btn-ghost land-btn" style="animation-delay:.68s;" data-go="adminPin">
        <span class="land-btn-ic">🛠️</span> Administrador
      </button>
    </div>
  `,

  sitio: () => `
    <div class="fade">
      <h2 class="search-title">¿Dónde te encuentras ahora?</h2>
      <p class="search-sub">Elige el sitio más cercano a ti.</p>
      ${SITIOS.map(s => `
        <div class="menu-item" data-sitio="${s.id}">
          <div class="menu-ic">${s.icon}</div><div class="menu-txt">${s.label}</div>
        </div>`).join('')}
    </div>
  `,

  home: () => `
    <div class="fade">
      <div class="location-pill"><span class="dot-green"></span>Usted está en: ${state.origenLabel}</div>
      <h2 class="search-title">¿Qué salón buscas?</h2>
      <p class="search-sub">Escribe el número de salón (ej. 107) o, si no lo sabes,
        el nombre del profesor o profesora (ej. "Yaneth Garzon").</p>
      <input type="text" class="room-input" id="roomInput" placeholder="Salón o nombre del docente" style="font-size:17px;" maxlength="40" autocomplete="off" name="roomInput_nocache">
      <div class="error-text" id="errText">No encontramos ningún salón ni docente con ese dato.</div>
      <div id="resultadosLista"></div>
      <div class="chip-row">
        ${["107","205","Biblioteca","Enfermería"].map(r=>`<span class="chip" data-quick="${r}">${r}</span>`).join('')}
      </div>
      <button class="btn btn-primary" id="buscarBtn">Buscar</button>
    </div>
    ${bottomNav('inicio')}
  `,

  info: () => {
    const r = SALONES[state.salonBuscado];
    const jornadaBlock = (j, label) => j ? `
      <div class="info-row"><div class="info-ic">🕐</div><div class="info-txt">
        <small>${label}</small>
        <strong>${j.grado !== "—" ? "Grado "+j.grado+" · " : ""}${j.nombre}</strong>
        ${j.area ? `<div style="color:var(--muted);font-size:12px;margin-top:2px;">${j.area}</div>` : ''}
      </div></div>` : '';
    return `
    <div class="fade">
      <div class="room-hero"><h2>${r.nombre}</h2><span>Piso ${r.piso}</span></div>
      <div class="card">
        ${jornadaBlock(r.manana, "Jornada mañana")}
        ${jornadaBlock(r.tarde, "Jornada tarde")}
        ${(!r.manana && !r.tarde) ? '<div class="info-row"><div class="info-txt"><strong>Sin docente asignado registrado</strong></div></div>' : ''}
      </div>
      <div style="height:16px"></div>
      <button class="btn btn-primary" id="irBtn">Ir</button>
    </div>
    ${bottomNav('inicio')}
    `;
  },

  confirm: () => {
    const r = SALONES[state.salonBuscado];
    return `
    <div class="confirm-wrap fade">
      <div class="pin-big">📍</div>
      <h2>¿Deseas ir al ${r.nombre}?</h2>
      <p>Desde: ${state.origenLabel}</p>
      <button class="btn btn-primary" style="margin-bottom:10px" data-go="mapa">Sí, ir</button>
      <button class="btn btn-ghost" data-go="home">Cancelar</button>
    </div>
    ${bottomNav('mapa')}
    `;
  },

  mapa: () => {
    const destino = SALONES[state.salonBuscado];
    const origenPiso = NODOS[state.origenId]?.piso || 1;
    const destinoPiso = destino.piso || 1;

    const plano1 = `<img src="assets/plano_piso1.jpg" alt="Plano Piso 1" style="width:100%;border-radius:12px;display:block;">`;
    const plano2 = `<img src="assets/plano_piso2.jpg" alt="Plano Piso 2" style="width:100%;border-radius:12px;display:block;">`;

    let imgs;
    if (origenPiso === destinoPiso) {
      // Todo el recorrido queda en un solo piso: se muestra solo ese plano.
      imgs = origenPiso === 2 ? plano2 : plano1;
    } else {
      // El recorrido cruza de piso: se muestran los dos, en el orden en que
      // se caminan — el piso de salida primero, el piso de llegada después.
      const primero = origenPiso === 2 ? plano2 : plano1;
      const segundo = origenPiso === 2 ? plano1 : plano2;
      imgs = `${primero}<div style="height:10px"></div>${segundo}`;
    }

    return `
    <div class="fade">
      <div class="map-canvas-wrap" style="padding:8px;">${imgs}</div>
      <p class="search-sub" style="margin-top:10px;">Desde: <b>${state.origenLabel}</b> · Hasta: <b>${destino.nombre}</b> (Piso ${destino.piso})</p>
      <button class="btn btn-primary" data-go="pasos">Ver indicaciones paso a paso</button>
    </div>
    ${bottomNav('mapa')}
    `;
  },

  pasos: () => `
    <div class="fade">
      <h3 style="margin:0 0 12px;color:var(--ink);font-size:17px;">Indicaciones paso a paso</h3>
      <div class="card">
        ${state.pasos.map((p,i)=>`
          <div class="step-item">
            <div class="step-num">${i+1}</div><div class="step-ic">${p.ic}</div>
            <div class="step-text">${p.txt}</div>
          </div>`).join('')}
      </div>
      <div style="height:16px"></div>
      <button class="btn btn-primary" data-go="flechas">Iniciar navegación</button>
    </div>
    ${bottomNav('mapa')}
  `,

  flechas: () => {
    const p = state.pasos[state.pasoActual];
    const total = state.pasos.length;
    return `
    <div class="arrow-scene fade">
      <div class="progress-label">Paso ${state.pasoActual+1} de ${total}</div>
      <div class="arrow-big">${p.ic}</div>
      <div class="arrow-instruction">${p.txt}</div>
      <div class="progress-dots">
        ${state.pasos.map((_,i)=>`<span class="pdot ${i<state.pasoActual?'done':''} ${i===state.pasoActual?'active':''}"></span>`).join('')}
      </div>
      <button class="btn btn-primary" id="nextStepBtn">${state.pasoActual===total-1 ? 'Llegué' : 'Siguiente'}</button>
    </div>
    ${bottomNav('mapa')}
    `;
  },

  llegada: () => {
    const r = SALONES[state.salonBuscado];
    return `
    <div class="arrival fade">
      ${['🎉','🎊','⭐','🎈','✨'].map((e,i)=>`<span class="confetti" style="left:${10+i*18}%;animation-delay:${i*0.08}s;">${e}</span>`).join('')}
      <div class="check-circle">✓</div><h2>¡Has llegado!</h2><p>Estás en el ${r.nombre}</p>
      <button class="btn btn-primary" data-go="sitio" id="finBtn">Finalizar</button>
    </div>
    ${bottomNav('inicio')}
    `;
  },

  menu: () => `
    <div class="fade">
      <h3 style="margin:0 0 14px;color:var(--ink);font-size:17px;">Zonas del colegio</h3>
      ${SITIOS.map(s=>`<div class="menu-item"><div class="menu-ic">${s.icon}</div><div class="menu-txt">${s.label}</div></div>`).join('')}
      <div class="menu-item" data-go="directorio"><div class="menu-ic">🧑‍🏫</div><div class="menu-txt">Directorio de docentes</div></div>
    </div>
    ${bottomNav('ayuda')}
  `,

  directorio: () => `
    <div class="fade">
      <h3 style="margin:0 0 12px;color:var(--ink);font-size:17px;">Docentes sin salón fijo</h3>
      <div class="card">
        ${DOCENTES_ITINERANTES.map(d=>`
          <div class="info-row"><div class="info-ic">🧑‍🏫</div><div class="info-txt">
            <small>${d.area}</small><strong>${d.nombre}</strong>
          </div></div>`).join('')}
      </div>
      <div style="height:14px"></div>
      <button class="btn btn-ghost" data-go="menu">Volver</button>
    </div>
    ${bottomNav('ayuda')}
  `,

  /* ---------------- ADMIN ---------------- */
  adminPin: () => `
    <div class="fade" style="text-align:center;padding-top:40px;">
      <div style="font-size:40px;margin-bottom:10px;">🔒</div>
      <h2 style="font-size:19px;color:var(--ink);margin:0 0 6px;">Acceso administrador</h2>
      <p style="color:var(--muted);font-size:12.5px;margin:0 0 20px;line-height:1.5;">
        Esto es solo un candado de interfaz para la demo — <b>no es seguridad real</b>.
        Para producción, la validación debe hacerse en <code>server.py</code>.
      </p>
      <input type="password" class="room-input" id="pinInput" placeholder="PIN (demo: 1234)" style="text-align:center;">
      <div class="error-text" id="pinErr">PIN incorrecto.</div>
      <button class="btn btn-primary" id="pinBtn">Entrar</button>
      <div style="height:8px"></div>
      <button class="btn btn-ghost" data-go="landing">Volver</button>
    </div>
  `,

  adminPanel: () => `
    <div class="fade">
      <h2 class="search-title">Panel de administración</h2>
      <p class="search-sub">${Object.keys(SALONES).length} salones registrados.</p>
      <button class="btn btn-primary" style="margin-bottom:14px;" data-go="adminForm">+ Agregar salón</button>
      <div class="card" style="max-height:420px;overflow-y:auto;">
        ${Object.entries(SALONES).map(([num,r])=>`
          <div class="info-row" data-edit="${num}" style="cursor:pointer;">
            <div class="info-ic">🏫</div>
            <div class="info-txt"><small>Piso ${r.piso}</small><strong>${r.nombre}</strong></div>
          </div>`).join('')}
      </div>
      <div style="height:14px"></div>
      <button class="btn btn-ghost" data-go="landing">Salir del modo administrador</button>
    </div>
  `,

  adminForm: () => {
    const editando = state.adminEditando;
    const r = editando ? SALONES[editando] : null;
    return `
    <div class="fade">
      <h2 class="search-title">${editando ? 'Editar ' + r.nombre : 'Agregar salón nuevo'}</h2>
      <p class="search-sub">Completa los datos del salón y su(s) docente(s).</p>

      <input class="room-input" id="fNumero" placeholder="Número de salón (ej. 220)"
        style="font-size:16px;" value="${editando || ''}" ${editando ? 'disabled' : ''}>
      <div style="height:10px"></div>
      <input class="room-input" id="fPiso" placeholder="Piso (1 o 2)" style="font-size:16px;"
        value="${r ? r.piso : ''}">

      <h3 style="font-size:14px;color:var(--ink);margin:16px 0 8px;">Jornada mañana</h3>
      <input class="room-input" id="fGradoM" placeholder="Grado (ej. 6A)" style="font-size:14px;" value="${r?.manana?.grado || ''}">
      <div style="height:8px"></div>
      <input class="room-input" id="fNombreM" placeholder="Nombre del docente" style="font-size:14px;" value="${r?.manana?.nombre || ''}">
      <div style="height:8px"></div>
      <input class="room-input" id="fAreaM" placeholder="Área que dicta" style="font-size:14px;" value="${r?.manana?.area || ''}">

      <h3 style="font-size:14px;color:var(--ink);margin:16px 0 8px;">Jornada tarde</h3>
      <input class="room-input" id="fGradoT" placeholder="Grado (ej. 3-A)" style="font-size:14px;" value="${r?.tarde?.grado || ''}">
      <div style="height:8px"></div>
      <input class="room-input" id="fNombreT" placeholder="Nombre del docente" style="font-size:14px;" value="${r?.tarde?.nombre || ''}">
      <div style="height:8px"></div>
      <input class="room-input" id="fAreaT" placeholder="Área que dicta" style="font-size:14px;" value="${r?.tarde?.area || ''}">

      <div style="height:16px"></div>
      <button class="btn btn-primary" id="guardarBtn">Guardar</button>
      <div style="height:8px"></div>
      ${editando ? `<button class="btn btn-ghost" id="editarRutaBtn">🧭 Editar Ruta</button><div style="height:8px"></div>` : ''}
      <button class="btn btn-ghost" data-go="adminPanel">Cancelar</button>
    </div>
    `;
  },

  adminRuta: () => {
    const salon = SALONES[state.adminRutaSalon];

    if(!state.adminRutaOrigen){
      return `
      <div class="fade">
        <h2 class="search-title">Ruta hacia ${salon.nombre}</h2>
        <p class="search-sub">Elige desde qué sitio quieres ver/editar la ruta. Cada sitio de partida tiene su propia ruta guardada.</p>
        ${SITIOS.map(s => `
          <div class="menu-item" data-origen-ruta="${s.id}">
            <div class="menu-ic">${s.icon}</div><div class="menu-txt">${s.label}</div>
          </div>`).join('')}
        <div style="height:8px"></div>
        <button class="btn btn-ghost" data-go="adminForm">Volver</button>
      </div>
      `;
    }

    const camino = state.adminRutaCamino;
    const rutaGuardadaInfo = obtenerRutaGuardada(claveRuta(state.adminRutaOrigen, salon.nodeId));
    const tieneGuardada = !!rutaGuardadaInfo;
    const pasosActuales = combinarPasos(camino, rutaGuardadaInfo?.etiquetas);

    /* ---- Modo lectura: el paso a paso tal cual se ve hoy en la app ---- */
    if(!state.adminRutaEditando){
      return `
      <div class="fade">
        <h2 class="search-title">Ruta hacia ${salon.nombre}</h2>
        <p class="search-sub">Desde: ${NODOS[state.adminRutaOrigen].label} ${tieneGuardada ? '· <span style="color:var(--green-dark);font-weight:700;">ruta personalizada</span>' : '· ruta automática'}</p>

        <div class="card" style="margin-bottom:14px;">
          ${pasosActuales.map((p,i)=>`
            <div class="step-item">
              <div class="step-num">${i+1}</div>
              <div class="step-ic">${p.ic}</div>
              <div class="step-text">${p.txt}</div>
            </div>`).join('')}
        </div>

        <button class="btn btn-primary" id="editarPasoAPasoBtn" style="margin-bottom:10px;">✏️ Editar</button>
        <button class="btn btn-ghost" data-go="adminForm">Volver</button>
      </div>
      `;
    }

    /* ---- Modo edición: cambiar manualmente los puntos de la ruta ---- */
    return `
    <div class="fade">
      <h2 class="search-title">Editando ruta hacia ${salon.nombre}</h2>
      <p class="search-sub">Desde: ${NODOS[state.adminRutaOrigen].label} — escribe cada paso tal como quieres que lo lea el estudiante, en orden.</p>

      <div class="card" style="margin-bottom:10px;">
        ${camino.map((id, i) => `
          <div class="step-item" style="align-items:center;">
            <div class="step-num">${i+1}</div>
            <input class="room-input paso-input" data-paso="${i}" autocomplete="off" style="font-size:13px;padding:8px 10px;flex:1;"
              value="${state.adminRutaEtiquetas[i] ?? (NODOS[id]?.label || id)}">
            <button class="mini-btn" data-quitar="${i}" ${camino.length<=2?'disabled':''}>✕</button>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-ghost" id="agregarPasoBtn" style="margin-bottom:16px;">+ Agregar punto</button>

      <button class="btn btn-primary" id="guardarRutaBtn" style="margin-bottom:10px;">Guardar ruta personalizada</button>
      <button class="btn btn-ghost" id="cancelarEdicionBtn" style="margin-bottom:10px;">Cancelar edición</button>
    </div>
    `;
  }
};

function bottomNav(activeKey){
  const items = [
    {key:'inicio', ic:'🏠', label:'Inicio', view:'home'},
    {key:'mapa', ic:'🗺️', label:'Mapa', view:'mapa'},
    {key:'salones', ic:'🏫', label:'Salones', view:'home'},
    {key:'ayuda', ic:'❓', label:'Ayuda', view:'menu'}
  ];
  return `<div class="bottomnav">
    ${items.map(it=>`<button class="navitem ${it.key===activeKey?'active':''}" data-navgo="${it.view}">
      <span class="navic">${it.ic}</span>${it.label}</button>`).join('')}
  </div>`;
}

/* ============================================================
   HANDLERS
   ============================================================ */
function attachHandlers(view){
  document.querySelectorAll('[data-go]').forEach(el=>{
    el.addEventListener('click', ()=> go(el.dataset.go));
  });
  document.querySelectorAll('[data-navgo]').forEach(el=>{
    el.addEventListener('click', ()=> go(el.dataset.navgo));
  });

  if(view === 'sitio'){
    document.querySelectorAll('[data-sitio]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const id = el.dataset.sitio;
        state.origenId = id; state.origenLabel = NODOS[id].label;
        go('home');
      });
    });
  }

  if(view === 'home'){
    const input = document.getElementById('roomInput');
    const err = document.getElementById('errText');
    const resultadosDiv = document.getElementById('resultadosLista');

    const irASalon = (numero) => { state.salonBuscado = numero; go('info'); };

    const mostrarResultados = (matches) => {
      resultadosDiv.innerHTML = matches.map(([num,r])=>{
        const docente = r.manana?.nombre || r.tarde?.nombre || '';
        return `
        <div class="menu-item" data-resultado="${num}">
          <div class="menu-ic">🏫</div>
          <div class="menu-txt">${r.nombre}${docente ? ` · ${docente}` : ''}</div>
        </div>`;
      }).join('');
      resultadosDiv.querySelectorAll('[data-resultado]').forEach(el=>{
        el.addEventListener('click', ()=> irASalon(el.dataset.resultado));
      });
    };

    const buscar = ()=>{
      err.style.display = 'none';
      resultadosDiv.innerHTML = '';
      const raw = input.value.trim();
      if(!raw) return;

      // 1) coincidencia exacta por número o código de salón
      const val = raw.toUpperCase().replace(/\s+/g,'');
      const key = val.startsWith('P0') ? val.toLowerCase() :
                  val.startsWith('INF') ? val.toLowerCase().replace(/\s/g,'') : val;
      if(SALONES[key]) return irASalon(key);
      if(SALONES[val]) return irASalon(val);

      // 2) coincidencia por nombre de lugar o de docente (sin tildes, sin mayúsculas)
      const q = normalizar(raw);
      if(q.length < 3){ err.style.display = 'block'; return; }

      const matches = Object.entries(SALONES).filter(([num, r])=>{
        const nombreLugar = normalizar(r.nombre);
        const nombreM = normalizar(r.manana?.nombre || '');
        const nombreT = normalizar(r.tarde?.nombre || '');
        return nombreLugar.includes(q) || nombreM.includes(q) || nombreT.includes(q);
      });

      if(matches.length === 1) return irASalon(matches[0][0]);
      if(matches.length > 1) return mostrarResultados(matches);
      err.style.display = 'block';
    };
    document.getElementById('buscarBtn').addEventListener('click', buscar);
    input.addEventListener('keydown', e=>{ if(e.key==='Enter') buscar(); });
    document.querySelectorAll('[data-quick]').forEach(chip=>{
      chip.addEventListener('click', ()=>{ input.value = chip.dataset.quick; buscar(); });
    });
  }

  if(view === 'info'){
    document.getElementById('irBtn').addEventListener('click', ()=> go('confirm'));
  }

  if(view === 'mapa'){
    const salon = SALONES[state.salonBuscado];
    const destinoNode = salon.nodeId;
    const rutaGuardadaInfo = obtenerRutaGuardada(claveRuta(state.origenId, destinoNode));
    const camino = (rutaGuardadaInfo && rutaGuardadaInfo.camino.every(id => NODOS[id]))
      ? rutaGuardadaInfo.camino
      : bfsPath(state.origenId, destinoNode);
    state.ruta = camino ? camino.map(id => [NODOS[id].x, NODOS[id].y]) : [[0.5,0.9],[0.5,0.1]];
    state.pasos = camino
      ? combinarPasos(camino, rutaGuardadaInfo?.etiquetas)
      : [{ic:"🟩", txt:"Ruta no disponible entre estos dos puntos."}];
    state.pasoActual = 0;
  }

  if(view === 'flechas'){
    document.getElementById('nextStepBtn').addEventListener('click', ()=>{
      const total = state.pasos.length;
      if(state.pasoActual < total - 1){ state.pasoActual++; render(); }
      else { go('llegada'); }
    });
  }

  if(view === 'adminPin'){
    const tryPin = ()=>{
      const val = document.getElementById('pinInput').value;
      if(val === '1234' || (API_BASE_URL && val.length > 0)){
        state.modo = 'admin';
        state.adminKey = val; // se usa como X-Admin-Key si hay servidor real configurado
        go('adminPanel');
      } else { document.getElementById('pinErr').style.display = 'block'; }
    };
    document.getElementById('pinBtn').addEventListener('click', tryPin);
    document.getElementById('pinInput').addEventListener('keydown', e=>{ if(e.key==='Enter') tryPin(); });
  }

  if(view === 'adminPanel'){
    document.querySelectorAll('[data-edit]').forEach(el=>{
      el.addEventListener('click', ()=>{ state.adminEditando = el.dataset.edit; go('adminForm'); });
    });
  }

  if(view === 'adminForm'){
    if(!state.adminEditando){
      // formulario "agregar" limpio
      state.adminEditando = null;
    }
    const editarRutaBtn = document.getElementById('editarRutaBtn');
    if(editarRutaBtn){
      editarRutaBtn.addEventListener('click', ()=>{
        state.adminRutaSalon = state.adminEditando;
        state.adminRutaOrigen = null;
        state.adminRutaCamino = null;
        state.adminRutaEditando = false;
        go('adminRuta');
      });
    }
    document.getElementById('guardarBtn').addEventListener('click', async ()=>{
      const numero = state.adminEditando || document.getElementById('fNumero').value.trim();
      if(!numero){ alert('Escribe un número de salón.'); return; }
      const piso = parseInt(document.getElementById('fPiso').value) || 1;

      const gradoM = document.getElementById('fGradoM').value.trim();
      const nombreM = document.getElementById('fNombreM').value.trim();
      const areaM = document.getElementById('fAreaM').value.trim();
      const gradoT = document.getElementById('fGradoT').value.trim();
      const nombreT = document.getElementById('fNombreT').value.trim();
      const areaT = document.getElementById('fAreaT').value.trim();

      const nuevoRegistro = {
        nombre: `Salón ${numero}`,
        piso,
        manana: nombreM ? {grado:gradoM||"—", nombre:nombreM, area:areaM||null} : null,
        tarde: nombreT ? {grado:gradoT||"—", nombre:nombreT, area:areaT||null} : null,
      };

      if(API_BASE_URL){
        const metodo = state.adminEditando ? 'PUT' : 'POST';
        const url = state.adminEditando ? `${API_BASE_URL}/api/salones/${numero}` : `${API_BASE_URL}/api/salones`;
        try{
          const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type':'application/json', 'X-Admin-Key': state.adminKey || '' },
            body: JSON.stringify({ numero, ...nuevoRegistro })
          });
          if(res.status === 401){ alert('Clave de administrador incorrecta en el servidor.'); return; }
          if(!res.ok){ alert('El servidor respondió con un error. Se guarda solo localmente por ahora.'); }
        }catch(e){
          alert('No se pudo contactar al servidor (¿está encendido?). Se guarda solo en este navegador por ahora.');
        }
      }

      const nodeId = SALONES[numero]?.nodeId || crearNodoParaSalonNuevo(numero, piso);
      SALONES[numero] = { ...nuevoRegistro, nodeId };
      guardarSalones(SALONES);
      state.adminEditando = null;
      go('adminPanel');
    });
  }

  if(view === 'adminRuta'){
    if(!state.adminRutaOrigen){
      document.querySelectorAll('[data-origen-ruta]').forEach(el=>{
        el.addEventListener('click', ()=>{
          const origenId = el.dataset.origenRuta;
          const salon = SALONES[state.adminRutaSalon];
          const guardado = obtenerRutaGuardada(claveRuta(origenId, salon.nodeId));
          const automatica = bfsPath(origenId, salon.nodeId);
          state.adminRutaOrigen = origenId;
          state.adminRutaCamino = guardado?.camino || automatica || [origenId, salon.nodeId];
          state.adminRutaEditando = false;
          render();
        });
      });
      return;
    }

    const salon = SALONES[state.adminRutaSalon];

    /* ---- Modo lectura ---- */
    if(!state.adminRutaEditando){
      const editarBtn = document.getElementById('editarPasoAPasoBtn');
      if(editarBtn){
        editarBtn.addEventListener('click', ()=>{
          state.adminRutaSnapshot = [...state.adminRutaCamino]; // por si cancela
          const guardado = obtenerRutaGuardada(claveRuta(state.adminRutaOrigen, salon.nodeId));
          state.adminRutaEtiquetas = guardado?.etiquetas
            ? [...guardado.etiquetas]
            : state.adminRutaCamino.map(id => NODOS[id]?.label || id);
          state.adminRutaEditando = true;
          render();
        });
      }
      return;
    }

    /* ---- Modo edición ---- */
    function buscarNodoPorLabel(texto){
      const limpio = texto.trim().toLowerCase();
      const match = Object.entries(NODOS).find(([id,n]) => n.label.toLowerCase() === limpio);
      return match ? match[0] : null;
    }

    // Escribe libremente: se guarda tal cual, sin borrar ni validar mientras escribes.
    // Si el texto coincide con un lugar real del mapa, se actualiza también la coordenada
    // (en silencio, sin interrumpir) para que el mapa siga dibujando bien esa ruta.
    document.querySelectorAll('.paso-input').forEach(el=>{
      el.addEventListener('input', ()=>{
        const i = parseInt(el.dataset.paso);
        state.adminRutaEtiquetas[i] = el.value;
        const idEncontrado = buscarNodoPorLabel(el.value);
        if(idEncontrado) state.adminRutaCamino[i] = idEncontrado;
        // sin render() aquí: así no se interrumpe mientras se sigue escribiendo
      });
    });

    document.querySelectorAll('[data-quitar]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const i = parseInt(el.dataset.quitar);
        if(state.adminRutaCamino.length <= 2) return; // siempre debe quedar origen y destino
        state.adminRutaCamino.splice(i, 1);
        state.adminRutaEtiquetas.splice(i, 1);
        render();
      });
    });

    document.getElementById('agregarPasoBtn').addEventListener('click', ()=>{
      // se inserta antes del último punto (el destino se queda siempre al final)
      const sugerido = state.adminRutaCamino[state.adminRutaCamino.length - 2] || state.adminRutaOrigen;
      state.adminRutaCamino.splice(state.adminRutaCamino.length - 1, 0, sugerido);
      state.adminRutaEtiquetas.splice(state.adminRutaEtiquetas.length - 1, 0, NODOS[sugerido]?.label || sugerido);
      render();
    });

    document.getElementById('cancelarEdicionBtn').addEventListener('click', ()=>{
      state.adminRutaCamino = state.adminRutaSnapshot || state.adminRutaCamino;
      state.adminRutaEditando = false;
      render();
    });

    document.getElementById('guardarRutaBtn').addEventListener('click', async ()=>{
      const camino = state.adminRutaCamino;
      const clave = claveRuta(state.adminRutaOrigen, salon.nodeId);
      const registro = { camino: [...camino], etiquetas: [...state.adminRutaEtiquetas] };

      if(API_BASE_URL){
        try{
          const res = await fetch(`${API_BASE_URL}/api/rutas/${encodeURIComponent(clave)}`, {
            method: 'PUT',
            headers: { 'Content-Type':'application/json', 'X-Admin-Key': state.adminKey || '' },
            body: JSON.stringify(registro)
          });
          if(res.status === 401){ alert('Clave de administrador incorrecta en el servidor. La ruta se guarda solo en este celular por ahora.'); }
          else if(!res.ok){ alert('El servidor respondió con un error. La ruta se guarda solo en este celular por ahora.'); }
        }catch(e){
          alert('No se pudo contactar al servidor (¿está encendido?). La ruta se guarda solo en este celular por ahora.');
        }
      }

      RUTAS_PERSONALIZADAS[clave] = registro;
      guardarRutasPersonalizadas(RUTAS_PERSONALIZADAS);
      state.adminRutaEditando = false;
      alert('Ruta guardada. Ya se va a usar esa ruta cuando alguien busque este salón desde ' + NODOS[state.adminRutaOrigen].label + '.');
      render();
    });
  }
}

/* Init */
go('landing');
sincronizarConServidor().then(huboServidor => {
  if(huboServidor) render(); // repinta con los datos reales del servidor si llegaron
});

/* Registro del service worker (funciona una vez subida a un hosting real
   con HTTPS o localhost — no funciona abriendo el archivo directo con
   file://, eso es una limitación normal del navegador, no un error). */
if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
