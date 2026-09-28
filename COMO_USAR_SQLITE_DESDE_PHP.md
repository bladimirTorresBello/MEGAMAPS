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

## Guardar y compartir rutas personalizadas

Abre MegaMaps desde Apache, por ejemplo `http://localhost/megamaps/`, para que
`api.php` pueda guardar las rutas en `megamaps.sqlite`. Al iniciar, la página
carga las rutas guardadas en SQLite; al guardar una edición desde el panel de
administración, la ruta se sincroniza para que otros navegadores que abran esa
misma dirección vean la corrección.

El formulario para subir una foto JPEG de un salón está dentro de
**Administrador → Gestionar fotos de rutas**. Los cambios de docentes y salones
hechos en **Gestionar salones y docentes** se guardan también en la tabla
`salones_aplicacion` de la misma base SQLite, y se cargan al abrir la aplicación
desde otro navegador. El panel ya no muestra un acceso separado para la subida:
el formulario está integrado sobre la lista de salones y rutas. Ambos guardados
del administrador requieren que se haya iniciado sesión en el panel; abrir
`index.html` directamente solo conserva los cambios en el navegador actual.

El inicio de sesión del servidor utiliza el PIN de demostración `1234`, igual
que el panel actual. Este PIN es solo para uso local; antes de publicar la
aplicación en una red pública, configura autenticación segura en el servidor y
cambia el mecanismo de acceso. Si abres `index.html` como archivo (`file://`),
no se ejecuta PHP y las rutas solo se guardan en ese navegador.

## Guardar fotos JPEG de salones

Abre el proyecto mediante Apache (no directamente con `file://`) y visita
`http://localhost/megamaps/subir_foto.html`. El formulario permite elegir uno de
los salones y subir una imagen JPEG de hasta 5 MB. El archivo queda en
`fotos/salones/` y su ruta relativa se registra en `fotos_salones` dentro de
`megamaps.sqlite`; la base de datos guarda la ruta, no los bytes de la imagen.

`guardar_foto.php` crea la tabla e índice automáticamente. También se incluye
`fotos_salones.sql` por si quieres crear la misma tabla manualmente en SQLite.
Para consultar las fotos de un salón:

```sql
SELECT salon_numero, ruta, creada_en
FROM fotos_salones
WHERE salon_numero = '205'
ORDER BY creada_en DESC;
```

La subida está pensada para un servidor local o protegido. No publiques el
formulario en Internet sin añadir autenticación del lado del servidor.

## Regenerar la base

Si cambia `datos_salones_seed.json`, ejecuta:

```bash
python crear_base_datos.py
```

El script reemplaza `megamaps.sqlite` y conserva las áreas originales en `area_original`. Cuando el origen no registra un área, el profesor y su salón sí se conservan, pero no se inventa ninguna asignatura.
