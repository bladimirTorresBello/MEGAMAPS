PRAGMA foreign_keys = ON;

CREATE TABLE salones (
    id INTEGER PRIMARY KEY,
    numero TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    piso INTEGER NOT NULL CHECK (piso > 0)
);

CREATE TABLE profesores (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE asignaturas (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE profesor_salones (
    id INTEGER PRIMARY KEY,
    salon_id INTEGER NOT NULL REFERENCES salones(id) ON DELETE CASCADE,
    profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    jornada TEXT NOT NULL CHECK (jornada IN ('manana', 'tarde')),
    grado TEXT,
    area_original TEXT,
    UNIQUE (salon_id, jornada)
);

CREATE TABLE profesor_asignaturas (
    profesor_salon_id INTEGER NOT NULL REFERENCES profesor_salones(id) ON DELETE CASCADE,
    asignatura_id INTEGER NOT NULL REFERENCES asignaturas(id) ON DELETE CASCADE,
    PRIMARY KEY (profesor_salon_id, asignatura_id)
);

CREATE TABLE profesores_itinerantes (
    profesor_id INTEGER PRIMARY KEY REFERENCES profesores(id) ON DELETE CASCADE,
    area_original TEXT,
    nota TEXT
);

CREATE TABLE profesor_itinerante_asignaturas (
    profesor_id INTEGER NOT NULL REFERENCES profesores_itinerantes(profesor_id) ON DELETE CASCADE,
    asignatura_id INTEGER NOT NULL REFERENCES asignaturas(id) ON DELETE CASCADE,
    PRIMARY KEY (profesor_id, asignatura_id)
);

CREATE INDEX idx_profesor_salones_profesor ON profesor_salones(profesor_id);
CREATE INDEX idx_profesor_asignaturas_asignatura ON profesor_asignaturas(asignatura_id);

CREATE VIEW vista_salones_docentes AS
SELECT
    s.numero AS salon,
    s.nombre AS salon_nombre,
    s.piso,
    ps.jornada,
    ps.grado,
    p.nombre AS profesor,
    ps.area_original
FROM profesor_salones ps
JOIN salones s ON s.id = ps.salon_id
JOIN profesores p ON p.id = ps.profesor_id;

CREATE VIEW vista_resumen_salones AS
SELECT
    s.numero AS salon,
    s.nombre AS nombre_salon,
    s.piso,
    p.nombre AS nombre_profesor,
    ps.grado,
    CASE ps.jornada
        WHEN 'manana' THEN 'Mañana'
        WHEN 'tarde' THEN 'Tarde'
        ELSE ps.jornada
    END AS sesion
FROM profesor_salones ps
JOIN salones s ON s.id = ps.salon_id
JOIN profesores p ON p.id = ps.profesor_id;

CREATE VIEW vista_salones_asignaturas AS
SELECT
    s.numero AS salon,
    s.nombre AS salon_nombre,
    s.piso,
    ps.jornada,
    ps.grado,
    p.nombre AS profesor,
    a.nombre AS asignatura
FROM profesor_asignaturas pa
JOIN profesor_salones ps ON ps.id = pa.profesor_salon_id
JOIN salones s ON s.id = ps.salon_id
JOIN profesores p ON p.id = ps.profesor_id
JOIN asignaturas a ON a.id = pa.asignatura_id;
