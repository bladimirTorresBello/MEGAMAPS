# Base SQLite para PHP

La base de datos normalizada es `megamaps.sqlite`. PHP puede abrirla con PDO y la extensión `pdo_sqlite`; no requiere MySQL ni un servidor de base de datos separado.

```php
<?php
$pdo = new PDO('sqlite:' . __DIR__ . '/megamaps.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA foreign_keys = ON');

$stmt = $pdo->prepare(
    'SELECT salon, piso, jornada, grado, profesor, asignatura
     FROM vista_salones_asignaturas
     WHERE salon = :salon
     ORDER BY jornada, asignatura'
);
$stmt->execute(['salon' => '205']);
$datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json; charset=utf-8');
echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
```

## Tablas principales

- `salones`: número, nombre y piso.
- `profesores`: catálogo único de profesores.
- `asignaturas`: catálogo único de asignaturas.
- `profesor_salones`: profesor asignado a un salón, jornada y grado. Incluye docentes sin asignatura registrada.
- `profesor_asignaturas`: relación de cada asignación con sus asignaturas.
- `profesores_itinerantes`: docentes sin salón fijo.
- `profesor_itinerante_asignaturas`: asignaturas de docentes sin salón fijo.

Las vistas `vista_salones_docentes` y `vista_salones_asignaturas` simplifican las consultas desde PHP.

## Regenerar la base

Si cambia `datos_salones_seed.json`, ejecuta:

```bash
python crear_base_datos.py
```

El script reemplaza `megamaps.sqlite` y conserva las áreas originales en `area_original`. Cuando el origen no registra un área, el profesor y su salón sí se conservan, pero no se inventa ninguna asignatura.
