CREATE TABLE IF NOT EXISTS fotos_salones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
    ruta TEXT NOT NULL UNIQUE,
    creada_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fotos_salones_numero
    ON fotos_salones (salon_numero);
