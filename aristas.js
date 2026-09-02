const ARISTAS = [
  ["parqueadero","sala_juegos"],["sala_juegos","sala_profesores"],
  ["sala_profesores","oficina_inclusion"],["coordinacion","cafeteria"],
  ["cafeteria","restaurante"],["restaurante","entrada"],
  ["entrada","salon_118"],["salon_118","salon_117"],["salon_117","salon_116"],
  ["salon_116","pasillo_der"],["pasillo_der","salon_114"],["salon_114","salon_113"],
  ["salon_113","salon_112"],["salon_112","salon_111"],
  ["pasillo_der","jardin"],
  ["pasillo_der","transicion"],
  ["sala_juegos","escaleras_izq"],
  ["coordinacion","cancha_central"],["cancha_central","escaleras_principales"],
  ["escaleras_izq","salon_101"],["salon_101","salon_102"],["salon_102","salon_103"],
  ["salon_103","salon_104"],["salon_104","salon_105"],["salon_105","salon_106"],
  ["salon_106","salon_107"],["salon_107","escaleras_principales"],
  ["escaleras_principales","salon_108"],["salon_108","salon_109"],
  ["salon_109","salon_110"],["salon_110","salon_115"],
  ["escaleras_principales","pasillo_piso2"],
  ["pasillo_piso2","biblioteca"],["biblioteca","salon_207"],
  ["pasillo_piso2","salon_201"],["salon_201","salon_203"],["salon_203","salon_204"],
  ["salon_204","salon_205"],["salon_205","salon_206"],["salon_206","salon_207"],
  ["salon_207","salon_209"],["salon_209","salon_210"],["salon_210","salon_211"],
  ["salon_211","salon_212"],["salon_212","salon_213"],["salon_213","salon_214"],
  ["salon_214","salon_215"],
];

const GRAFO = {};
Object.keys(NODOS).forEach(n => GRAFO[n] = []);
ARISTAS.forEach(([a,b]) => {
  if(GRAFO[a] && GRAFO[b]){ GRAFO[a].push(b); GRAFO[b].push(a); }
});
