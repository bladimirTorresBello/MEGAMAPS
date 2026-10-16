CREATE TABLE IF NOT EXISTS fotos_salones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
    ruta TEXT NOT NULL UNIQUE CHECK (length(ruta) > 0),
    creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fotos_salones_numero
    ON fotos_salones (salon_numero);

-- Imágenes que ya están incluidas en el proyecto. Las rutas son relativas
-- a index.html y usan / para funcionar igual en Windows y en el servidor.
INSERT OR IGNORE INTO fotos_salones (salon_numero, ruta) VALUES
    ('101', 'assests/Salones/salon101.jpeg'),
    ('102', 'assests/Salones/salon102.jpeg'),
    ('103', 'assests/Salones/salon103.jpeg'),
    ('104', 'assests/Salones/salon104.jpeg'),
    ('106', 'assests/Salones/salon106.jpeg'),
    ('107', 'assests/Salones/salon107.jpeg'),
    ('108', 'assests/Salones/salon108.jpeg'),
    ('109', 'assests/Salones/salon109.jpeg'),
    ('110', 'assests/Salones/salon110.jpeg'),
    ('111', 'assests/Salones/salon111.jpeg'),
    ('112', 'assests/Salones/salon112.jpeg'),
    ('113', 'assests/Salones/salon113.jpeg'),
    ('114', 'assests/Salones/salon114.jpeg'),
    ('115', 'assests/Salones/salon115.jpeg'),
    ('116', 'assests/Salones/salon116.jpeg'),
    ('117', 'assests/Salones/salon117.jpeg'),
    ('118', 'assests/Salones/salon118.jpeg'),
    ('201', 'assests/Salones/salon201.jpeg'),
    ('202', 'assests/Salones/salon202.jpeg'),
    ('203', 'assests/Salones/salon203.jpeg'),
    ('204', 'assests/Salones/salon204.jpeg'),
    ('206', 'assests/Salones/salon206.jpeg'),
    ('207', 'assests/Salones/salon207.jpeg'),
    ('208', 'assests/Salones/salon208.jpeg'),
    ('209', 'assests/Salones/salon209.jpeg'),
    ('210', 'assests/Salones/salon210.jpeg'),
    ('211', 'assests/Salones/salon211.jpeg'),
    ('212', 'assests/Salones/salon212.jpeg'),
    ('213', 'assests/Salones/salon213.jpeg'),
    ('214', 'assests/Salones/salon214.jpeg'),
    ('215', 'assests/Salones/salon215.jpeg');
