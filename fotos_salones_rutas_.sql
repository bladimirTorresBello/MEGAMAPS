-- Esquema SQLite para fotos de rutas personalizadas de MegaMaps.
-- Cinco tablas, una por lugar; cada tabla incluye sus 33 salones iniciales.
PRAGMA foreign_keys = ON;

-- Catálogo de las fotos de salones que ya están dentro del proyecto.
-- Las rutas son relativas a index.html.
CREATE TABLE IF NOT EXISTS fotos_salones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
    ruta TEXT NOT NULL CHECK (length(ruta) > 0),
    creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (salon_numero, ruta)
);
CREATE INDEX IF NOT EXISTS idx_fotos_salones_numero ON fotos_salones (salon_numero);
INSERT OR IGNORE INTO fotos_salones (salon_numero, ruta) VALUES
    ('101', 'assests/Salones/salon101.jpeg'), ('102', 'assests/Salones/salon102.jpeg'),
    ('103', 'assests/Salones/salon103.jpeg'), ('104', 'assests/Salones/salon104.jpeg'),
    ('106', 'assests/Salones/salon106.jpeg'), ('107', 'assests/Salones/salon107.jpeg'),
    ('108', 'assests/Salones/salon108.jpeg'), ('109', 'assests/Salones/salon109.jpeg'),
    ('110', 'assests/Salones/salon110.jpeg'), ('111', 'assests/Salones/salon111.jpeg'),
    ('112', 'assests/Salones/salon112.jpeg'), ('113', 'assests/Salones/salon113.jpeg'),
    ('114', 'assests/Salones/salon114.jpeg'), ('115', 'assests/Salones/salon115.jpeg'),
    ('116', 'assests/Salones/salon116.jpeg'), ('117', 'assests/Salones/salon117.jpeg'),
    ('118', 'assests/Salones/salon118.jpeg'), ('201', 'assests/Salones/salon201.jpeg'),
    ('202', 'assests/Salones/salon202.jpeg'), ('203', 'assests/Salones/salon203.jpeg'),
    ('204', 'assests/Salones/salon204.jpeg'), ('206', 'assests/Salones/salon206.jpeg'),
    ('207', 'assests/Salones/salon207.jpeg'), ('208', 'assests/Salones/salon208.jpeg'),
    ('209', 'assests/Salones/salon209.jpeg'), ('210', 'assests/Salones/salon210.jpeg'),
    ('211', 'assests/Salones/salon211.jpeg'), ('212', 'assests/Salones/salon212.jpeg'),
    ('213', 'assests/Salones/salon213.jpeg'), ('214', 'assests/Salones/salon214.jpeg'),
    ('215', 'assests/Salones/salon215.jpeg');

CREATE TABLE IF NOT EXISTS fotos_entrada (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
    clave TEXT,
    paso_node_id TEXT,
    ruta TEXT,
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (clave, paso_node_id)
);
CREATE INDEX IF NOT EXISTS idx_fotos_entrada_salon ON fotos_entrada (salon_numero);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fotos_entrada_salon_vacio ON fotos_entrada (salon_numero) WHERE clave IS NULL;
INSERT OR IGNORE INTO fotos_entrada (salon_numero) VALUES
    ('101'),
    ('102'),
    ('103'),
    ('104'),
    ('105'),
    ('106'),
    ('107'),
    ('108'),
    ('109'),
    ('110'),
    ('111'),
    ('112'),
    ('113'),
    ('114'),
    ('115'),
    ('116'),
    ('117'),
    ('118'),
    ('201'),
    ('202'),
    ('203'),
    ('204'),
    ('205'),
    ('206'),
    ('207'),
    ('208'),
    ('209'),
    ('210'),
    ('211'),
    ('212'),
    ('213'),
    ('214'),
    ('215');

-- Las mismas 25 fotos quedan disponibles para cada uno de los cinco lugares.
-- Cada tabla mantiene sus propias claves y puede editarse de forma independiente.
-- Cada salón de entrada recibe todas las fotos de
-- assests/fotosSalonesPersonalizadas (33 salones x 25 fotos).
WITH salones(salon_numero) AS (
    SELECT printf('%d', numero) FROM (SELECT 101 AS numero UNION ALL SELECT 102 UNION ALL SELECT 103 UNION ALL SELECT 104 UNION ALL SELECT 105 UNION ALL SELECT 106 UNION ALL SELECT 107 UNION ALL SELECT 108 UNION ALL SELECT 109 UNION ALL SELECT 110 UNION ALL SELECT 111 UNION ALL SELECT 112 UNION ALL SELECT 113 UNION ALL SELECT 114 UNION ALL SELECT 115 UNION ALL SELECT 116 UNION ALL SELECT 117 UNION ALL SELECT 118 UNION ALL SELECT 201 UNION ALL SELECT 202 UNION ALL SELECT 203 UNION ALL SELECT 204 UNION ALL SELECT 205 UNION ALL SELECT 206 UNION ALL SELECT 207 UNION ALL SELECT 208 UNION ALL SELECT 209 UNION ALL SELECT 210 UNION ALL SELECT 211 UNION ALL SELECT 212 UNION ALL SELECT 213 UNION ALL SELECT 214 UNION ALL SELECT 215)
), fotos(posicion, ruta) AS (
    VALUES
        (1, 'assests/fotosSalonesPersonalizadas/bajada rampla segundo piso.jpeg'),
        (2, 'assests/fotosSalonesPersonalizadas/baños transicion.jpeg'),
        (3, 'assests/fotosSalonesPersonalizadas/escaleras nancyyy.jpeg'),
        (4, 'assests/fotosSalonesPersonalizadas/pasillo 1 fredy.jpeg'),
        (5, 'assests/fotosSalonesPersonalizadas/pasillo 1 mary.jpeg'),
        (6, 'assests/fotosSalonesPersonalizadas/pasillo batuta.jpeg'),
        (7, 'assests/fotosSalonesPersonalizadas/pasillo baño cancha.jpeg'),
        (8, 'assests/fotosSalonesPersonalizadas/pasillo baño rampla.jpeg'),
        (9, 'assests/fotosSalonesPersonalizadas/pasillo cafeteria rampla.jpeg'),
        (10, 'assests/fotosSalonesPersonalizadas/pasillo corto  subida rampla.jpeg'),
        (11, 'assests/fotosSalonesPersonalizadas/pasillo fredy.jpeg'),
        (12, 'assests/fotosSalonesPersonalizadas/pasillo jose.jpeg'),
        (13, 'assests/fotosSalonesPersonalizadas/pasillo labolatorio.jpeg'),
        (14, 'assests/fotosSalonesPersonalizadas/pasillo mary.jpeg'),
        (15, 'assests/fotosSalonesPersonalizadas/pasillo orlando.jpeg'),
        (16, 'assests/fotosSalonesPersonalizadas/pasillo rampla bajada.jpeg'),
        (17, 'assests/fotosSalonesPersonalizadas/pasillo rampla biblioteca.jpeg'),
        (18, 'assests/fotosSalonesPersonalizadas/pasillo restuarante coordinacion.jpeg'),
        (19, 'assests/fotosSalonesPersonalizadas/pasillo restuarante.jpeg'),
        (20, 'assests/fotosSalonesPersonalizadas/pasillo rosas.jpeg'),
        (21, 'assests/fotosSalonesPersonalizadas/pasillo sulay.jpeg'),
        (22, 'assests/fotosSalonesPersonalizadas/pasillo transicion.jpeg'),
        (23, 'assests/fotosSalonesPersonalizadas/salida biblioteca.jpeg'),
        (24, 'assests/fotosSalonesPersonalizadas/subida rampla.jpeg'),
        (25, 'assests/fotosSalonesPersonalizadas/WhatsApp Image 2026-10-14 at 3.47.09 PM.jpeg')
)
INSERT OR IGNORE INTO fotos_entrada (salon_numero, clave, paso_node_id, ruta)
SELECT s.salon_numero,
       'entrada__salon_' || s.salon_numero || '__foto_' || printf('%03d', f.posicion),
       'foto_' || printf('%03d', f.posicion),
       f.ruta
FROM salones s CROSS JOIN fotos f;

CREATE TABLE IF NOT EXISTS fotos_cafeteria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
    clave TEXT,
    paso_node_id TEXT,
    ruta TEXT,
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (clave, paso_node_id)
);
CREATE INDEX IF NOT EXISTS idx_fotos_cafeteria_salon ON fotos_cafeteria (salon_numero);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fotos_cafeteria_salon_vacio ON fotos_cafeteria (salon_numero) WHERE clave IS NULL;
INSERT OR IGNORE INTO fotos_cafeteria (salon_numero) VALUES
    ('101'),
    ('102'),
    ('103'),
    ('104'),
    ('105'),
    ('106'),
    ('107'),
    ('108'),
    ('109'),
    ('110'),
    ('111'),
    ('112'),
    ('113'),
    ('114'),
    ('115'),
    ('116'),
    ('117'),
    ('118'),
    ('201'),
    ('202'),
    ('203'),
    ('204'),
    ('205'),
    ('206'),
    ('207'),
    ('208'),
    ('209'),
    ('210'),
    ('211'),
    ('212'),
    ('213'),
    ('214'),
    ('215');

CREATE TABLE IF NOT EXISTS fotos_transicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
    clave TEXT,
    paso_node_id TEXT,
    ruta TEXT,
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (clave, paso_node_id)
);
CREATE INDEX IF NOT EXISTS idx_fotos_transicion_salon ON fotos_transicion (salon_numero);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fotos_transicion_salon_vacio ON fotos_transicion (salon_numero) WHERE clave IS NULL;
INSERT OR IGNORE INTO fotos_transicion (salon_numero) VALUES
    ('101'),
    ('102'),
    ('103'),
    ('104'),
    ('105'),
    ('106'),
    ('107'),
    ('108'),
    ('109'),
    ('110'),
    ('111'),
    ('112'),
    ('113'),
    ('114'),
    ('115'),
    ('116'),
    ('117'),
    ('118'),
    ('201'),
    ('202'),
    ('203'),
    ('204'),
    ('205'),
    ('206'),
    ('207'),
    ('208'),
    ('209'),
    ('210'),
    ('211'),
    ('212'),
    ('213'),
    ('214'),
    ('215');

CREATE TABLE IF NOT EXISTS fotos_coordinacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
    clave TEXT,
    paso_node_id TEXT,
    ruta TEXT,
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (clave, paso_node_id)
);
CREATE INDEX IF NOT EXISTS idx_fotos_coordinacion_salon ON fotos_coordinacion (salon_numero);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fotos_coordinacion_salon_vacio ON fotos_coordinacion (salon_numero) WHERE clave IS NULL;
INSERT OR IGNORE INTO fotos_coordinacion (salon_numero) VALUES
    ('101'),
    ('102'),
    ('103'),
    ('104'),
    ('105'),
    ('106'),
    ('107'),
    ('108'),
    ('109'),
    ('110'),
    ('111'),
    ('112'),
    ('113'),
    ('114'),
    ('115'),
    ('116'),
    ('117'),
    ('118'),
    ('201'),
    ('202'),
    ('203'),
    ('204'),
    ('205'),
    ('206'),
    ('207'),
    ('208'),
    ('209'),
    ('210'),
    ('211'),
    ('212'),
    ('213'),
    ('214'),
    ('215');

CREATE TABLE IF NOT EXISTS fotos_biblioteca (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
    clave TEXT,
    paso_node_id TEXT,
    ruta TEXT,
    actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (clave, paso_node_id)
);
CREATE INDEX IF NOT EXISTS idx_fotos_biblioteca_salon ON fotos_biblioteca (salon_numero);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fotos_biblioteca_salon_vacio ON fotos_biblioteca (salon_numero) WHERE clave IS NULL;
INSERT OR IGNORE INTO fotos_biblioteca (salon_numero) VALUES
    ('101'),
    ('102'),
    ('103'),
    ('104'),
    ('105'),
    ('106'),
    ('107'),
    ('108'),
    ('109'),
    ('110'),
    ('111'),
    ('112'),
    ('113'),
    ('114'),
    ('115'),
    ('116'),
    ('117'),
    ('118'),
    ('201'),
    ('202'),
    ('203'),
    ('204'),
    ('205'),
    ('206'),
    ('207'),
    ('208'),
    ('209'),
    ('210'),
    ('211'),
    ('212'),
    ('213'),
    ('214'),
    ('215');

-- Las mismas 25 fotos quedan disponibles para cada uno de los cinco lugares.
-- Cada tabla mantiene sus propias claves y puede editarse de forma independiente.
INSERT OR IGNORE INTO fotos_cafeteria (salon_numero, clave, paso_node_id, ruta)
SELECT salon_numero, replace(clave, 'entrada__', 'cafeteria__'), paso_node_id, ruta
FROM fotos_entrada WHERE clave IS NOT NULL;
INSERT OR IGNORE INTO fotos_transicion (salon_numero, clave, paso_node_id, ruta)
SELECT salon_numero, replace(clave, 'entrada__', 'transicion__'), paso_node_id, ruta
FROM fotos_entrada WHERE clave IS NOT NULL;
INSERT OR IGNORE INTO fotos_coordinacion (salon_numero, clave, paso_node_id, ruta)
SELECT salon_numero, replace(clave, 'entrada__', 'coordinacion__'), paso_node_id, ruta
FROM fotos_entrada WHERE clave IS NOT NULL;
INSERT OR IGNORE INTO fotos_biblioteca (salon_numero, clave, paso_node_id, ruta)
SELECT salon_numero, replace(clave, 'entrada__', 'biblioteca__'), paso_node_id, ruta
FROM fotos_entrada WHERE clave IS NOT NULL;


