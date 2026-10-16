<?php
// API PHP para consultar datos y sincronizar rutas personalizadas de MegaMaps.
header('Content-Type: application/json; charset=utf-8');

$https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'httponly' => true,
    'secure' => $https,
    'samesite' => 'Strict',
]);
session_start();

function responder(int $estado, array $datos): void
{
    http_response_code($estado);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function identificadorValido($valor): bool
{
    return is_string($valor) && preg_match('/^[a-zA-Z0-9_-]{1,80}$/', $valor) === 1;
}

function rutaValida($ruta): bool
{
    if (!is_array($ruta)
        || !isset($ruta['camino'])
        || !is_array($ruta['camino'])
        || count($ruta['camino']) < 2
        || count($ruta['camino']) > 80) {
        return false;
    }

    foreach ($ruta['camino'] as $nodo) {
        if (!identificadorValido($nodo)) {
            return false;
        }
    }

    if (!array_key_exists('etiquetas', $ruta) || $ruta['etiquetas'] === null) {
        return true;
    }

    if (!is_array($ruta['etiquetas'])
        || count($ruta['etiquetas']) !== count($ruta['camino'])) {
        return false;
    }

    foreach ($ruta['etiquetas'] as $etiqueta) {
        if (!is_string($etiqueta) || trim($etiqueta) === '' || strlen($etiqueta) > 500) {
            return false;
        }
    }

    return true;
}

function validarSalones($salones): ?array
{
    if (!is_array($salones) || count($salones) > 200) {
        return null;
    }

    $limpios = [];
    foreach ($salones as $numero => $salon) {
        $numero = (string) $numero;
        if (preg_match('/^\d{1,4}$/', $numero) !== 1
            || !is_array($salon)
            || !isset($salon['nombre'], $salon['nodeId'], $salon['piso'])
            || !is_string($salon['nombre'])
            || trim($salon['nombre']) === ''
            || strlen($salon['nombre']) > 100
            || !identificadorValido($salon['nodeId'])
            || !is_int($salon['piso'])
            || $salon['piso'] < 1
            || $salon['piso'] > 20) {
            return null;
        }

        $registro = [
            'nombre' => trim($salon['nombre']),
            'nodeId' => $salon['nodeId'],
            'piso' => $salon['piso'],
        ];

        foreach (['manana', 'tarde'] as $jornada) {
            $docente = $salon[$jornada] ?? null;
            if ($docente === null) {
                $registro[$jornada] = null;
                continue;
            }

            if (!is_array($docente)
                || !isset($docente['nombre'])
                || !is_string($docente['nombre'])
                || trim($docente['nombre']) === ''
                || strlen($docente['nombre']) > 120) {
                return null;
            }

            foreach (['grado' => 40, 'area' => 160] as $campo => $maximo) {
                if (isset($docente[$campo])
                    && (!is_string($docente[$campo]) || strlen($docente[$campo]) > $maximo)) {
                    return null;
                }
            }

            $registro[$jornada] = [
                'nombre' => trim($docente['nombre']),
                'grado' => $docente['grado'] ?? null,
                'area' => $docente['area'] ?? null,
            ];
        }

        $limpios[$numero] = $registro;
    }

    return $limpios;
}

try {
    $pdo = new PDO('sqlite:' . __DIR__ . DIRECTORY_SEPARATOR . 'megamaps.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA foreign_keys = ON');

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS rutas_personalizadas (
            clave TEXT PRIMARY KEY,
            camino_json TEXT NOT NULL,
            etiquetas_json TEXT,
            actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )'
    );
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS salones_aplicacion (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            datos_json TEXT NOT NULL,
            actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )'
    );

    $lugarFotos = isset($_GET['lugar']) && is_string($_GET['lugar']) ? $_GET['lugar'] : '';
    $tablasFotos = [
        'entrada' => 'fotos_entrada',
        'cafeteria' => 'fotos_cafeteria',
        'transicion' => 'fotos_transicion',
        'coordinacion' => 'fotos_coordinacion',
        'biblioteca' => 'fotos_biblioteca',
    ];
    if ($lugarFotos !== '' && isset($tablasFotos[$lugarFotos])) {
        $pdo = new PDO('sqlite:' . __DIR__ . DIRECTORY_SEPARATOR . 'fotos_rutas_personalidas.sqlite');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('PRAGMA journal_mode = WAL');
        $pdo->exec('PRAGMA busy_timeout = 5000');
        foreach ($tablasFotos as $tablaInicial) {
            $pdo->exec("CREATE TABLE IF NOT EXISTS {$tablaInicial} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                salon_numero TEXT NOT NULL CHECK (length(salon_numero) = 3),
                clave TEXT,
                paso_node_id TEXT,
                ruta TEXT,
                actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (clave, paso_node_id)
            )");
            $pdo->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_{$tablaInicial}_salon_vacio
                ON {$tablaInicial} (salon_numero) WHERE clave IS NULL");
            $stmtInicial = $pdo->prepare("INSERT OR IGNORE INTO {$tablaInicial} (salon_numero) VALUES (:salon)");
            foreach (array_merge(range(101, 118), range(201, 215)) as $numeroSalon) {
                $stmtInicial->execute(['salon' => (string) $numeroSalon]);
            }
            $pdo->exec("CREATE INDEX IF NOT EXISTS idx_{$tablaInicial}_salon ON {$tablaInicial} (salon_numero)");
        }
        $tablaFoto = $tablasFotos[$lugarFotos];
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $pdo->query("SELECT clave, ruta FROM {$tablaFoto} WHERE clave IS NOT NULL ORDER BY salon_numero, clave");
            responder(200, ['fotos' => $stmt->fetchAll(PDO::FETCH_KEY_PAIR)]);
        }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Allow: GET, POST');
            responder(405, ['error' => 'Método no permitido.']);
        }
        if (empty($_SESSION['megamaps_admin'])) {
            responder(401, ['error' => 'Inicia sesión como administrador para guardar fotos.']);
        }
        $entradaFoto = json_decode(file_get_contents('php://input'), true);
        $claveFoto = is_array($entradaFoto) && isset($entradaFoto['clave']) && is_string($entradaFoto['clave'])
            ? $entradaFoto['clave'] : '';
        $pasoFoto = is_array($entradaFoto) && isset($entradaFoto['paso']) && is_string($entradaFoto['paso'])
            ? $entradaFoto['paso'] : '';
        $contenidoFoto = is_array($entradaFoto) && isset($entradaFoto['foto']) && is_string($entradaFoto['foto'])
            ? $entradaFoto['foto'] : '';
        if (!preg_match('/^' . preg_quote($lugarFotos, '/') . '__salon_(\d{3})__salon_\d{3}$/', $claveFoto, $coincidencia)
            || !identificadorValido($pasoFoto)
            || !preg_match('/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+\/=]+)$/', $contenidoFoto, $imagen)) {
            responder(400, ['error' => 'La foto o su salón no tienen un formato válido.']);
        }
        $binario = base64_decode($imagen[2], true);
        if ($binario === false || strlen($binario) < 1 || strlen($binario) > 5 * 1024 * 1024) {
            responder(400, ['error' => 'La foto debe pesar hasta 5 MB.']);
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($binario);
        $extensiones = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!isset($extensiones[$mime]) || getimagesizefromstring($binario) === false) {
            responder(400, ['error' => 'El archivo no es una imagen válida.']);
        }
        $directorioFotos = __DIR__ . DIRECTORY_SEPARATOR . 'fotos_rutas';
        if (!is_dir($directorioFotos) && !mkdir($directorioFotos, 0755, true) && !is_dir($directorioFotos)) {
            throw new RuntimeException('No se pudo crear fotos_rutas.');
        }
        $nombreFoto = $lugarFotos . '-' . $coincidencia[1] . '-' . hash('sha256', $claveFoto . '|' . $pasoFoto) . '.' . $extensiones[$mime];
        $rutaRelativa = 'fotos_rutas/' . $nombreFoto;
        if (file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . $rutaRelativa, $binario, LOCK_EX) === false) {
            throw new RuntimeException('No se pudo guardar la imagen.');
        }
        $stmt = $pdo->prepare("INSERT INTO {$tablaFoto} (salon_numero, clave, paso_node_id, ruta, actualizado_en)
            VALUES (:salon, :clave, :paso, :ruta, CURRENT_TIMESTAMP)
            ON CONFLICT(clave, paso_node_id) DO UPDATE SET ruta = excluded.ruta, actualizado_en = CURRENT_TIMESTAMP");
        $stmt->execute(['salon' => $coincidencia[1], 'clave' => $claveFoto, 'paso' => $pasoFoto, 'ruta' => $rutaRelativa]);
        responder(200, ['ok' => true, 'ruta' => $rutaRelativa]);
    }

    $accion = isset($_GET['action']) && is_string($_GET['action'])
        ? $_GET['action']
        : '';

    if ($accion === 'admin-login') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Allow: POST');
            responder(405, ['error' => 'Método no permitido.']);
        }

        $entrada = json_decode(file_get_contents('php://input'), true);
        if (!is_array($entrada)
            || !isset($entrada['pin'])
            || !is_string($entrada['pin'])
            || !hash_equals('1234', $entrada['pin'])) {
            responder(401, ['error' => 'PIN de administrador incorrecto.']);
        }

        session_regenerate_id(true);
        $_SESSION['megamaps_admin'] = true;
        responder(200, ['ok' => true]);
    }

    if ($accion === 'admin-logout') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Allow: POST');
            responder(405, ['error' => 'Método no permitido.']);
        }

        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $cookie = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $cookie['path'],
                'domain' => $cookie['domain'],
                'secure' => $cookie['secure'],
                'httponly' => $cookie['httponly'],
                'samesite' => 'Strict',
            ]);
        }
        session_destroy();
        responder(200, ['ok' => true]);
    }

    if ($accion === 'salones') {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $pdo->query('SELECT datos_json FROM salones_aplicacion WHERE id = 1');
            $fila = $stmt->fetch(PDO::FETCH_ASSOC);
            $salones = $fila
                ? validarSalones(json_decode($fila['datos_json'], true))
                : [];
            if ($salones === null) {
                responder(500, ['error' => 'Los datos de salones guardados en SQLite no son válidos.']);
            }
            responder(200, ['salones' => (object) $salones]);
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Allow: GET, POST');
            responder(405, ['error' => 'Método no permitido.']);
        }

        if (empty($_SESSION['megamaps_admin'])) {
            responder(401, ['error' => 'Inicia sesión como administrador para guardar salones y docentes.']);
        }

        $entrada = json_decode(file_get_contents('php://input'), true);
        $salones = is_array($entrada) && array_key_exists('salones', $entrada)
            ? validarSalones($entrada['salones'])
            : null;
        if ($salones === null) {
            responder(400, ['error' => 'Los datos de salones o docentes no tienen un formato válido.']);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO salones_aplicacion (id, datos_json, actualizado_en)
             VALUES (1, :datos, CURRENT_TIMESTAMP)
             ON CONFLICT(id) DO UPDATE SET
                datos_json = excluded.datos_json,
                actualizado_en = CURRENT_TIMESTAMP'
        );
        $stmt->execute(['datos' => json_encode($salones, JSON_UNESCAPED_UNICODE)]);
        responder(200, ['ok' => true]);
    }

    if ($accion === 'routes') {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $rutas = [];
            $stmt = $pdo->query(
                'SELECT clave, camino_json, etiquetas_json
                 FROM rutas_personalizadas
                 ORDER BY clave'
            );

            foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $fila) {
                $camino = json_decode($fila['camino_json'], true);
                $etiquetas = $fila['etiquetas_json'] === null
                    ? null
                    : json_decode($fila['etiquetas_json'], true);
                $ruta = ['camino' => $camino, 'etiquetas' => $etiquetas];
                $partesClave = explode('__', $fila['clave']);
                if (count($partesClave) === 2
                    && identificadorValido($partesClave[0])
                    && identificadorValido($partesClave[1])
                    && rutaValida($ruta)) {
                    $rutas[$fila['clave']] = $ruta;
                }
            }

            responder(200, ['rutas' => $rutas]);
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Allow: GET, POST');
            responder(405, ['error' => 'Método no permitido.']);
        }

        if (empty($_SESSION['megamaps_admin'])) {
            responder(401, ['error' => 'Inicia sesión como administrador para guardar rutas.']);
        }

        $entrada = json_decode(file_get_contents('php://input'), true);
        if (!is_array($entrada)
            || !isset($entrada['clave'])
            || !is_string($entrada['clave'])
            || !isset($entrada['ruta'])
            || !rutaValida($entrada['ruta'])) {
            responder(400, ['error' => 'La ruta enviada no tiene un formato válido.']);
        }

        $partesClave = explode('__', $entrada['clave']);
        if (count($partesClave) !== 2
            || !identificadorValido($partesClave[0])
            || !identificadorValido($partesClave[1])) {
            responder(400, ['error' => 'El origen o destino de la ruta no es válido.']);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO rutas_personalizadas
                (clave, camino_json, etiquetas_json, actualizado_en)
             VALUES (:clave, :camino, :etiquetas, CURRENT_TIMESTAMP)
             ON CONFLICT(clave) DO UPDATE SET
                camino_json = excluded.camino_json,
                etiquetas_json = excluded.etiquetas_json,
                actualizado_en = CURRENT_TIMESTAMP'
        );
        $stmt->execute([
            'clave' => $entrada['clave'],
            'camino' => json_encode($entrada['ruta']['camino'], JSON_UNESCAPED_UNICODE),
            'etiquetas' => $entrada['ruta']['etiquetas'] === null
                ? null
                : json_encode($entrada['ruta']['etiquetas'], JSON_UNESCAPED_UNICODE),
        ]);

        responder(200, ['ok' => true]);
    }

    $salon = isset($_GET['salon']) ? trim($_GET['salon']) : '';
    $sql = 'SELECT salon, salon_nombre, piso, jornada, grado, profesor, asignatura
            FROM vista_salones_asignaturas';
    $params = [];

    if ($salon !== '') {
        $sql .= ' WHERE salon = :salon';
        $params['salon'] = $salon;
    }

    $sql .= ' ORDER BY salon, jornada, profesor, asignatura';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $error) {
    error_log('Error en la API de MegaMaps: ' . $error->getMessage());
    responder(500, ['error' => 'No se pudo completar la operación con la base de datos.']);
}
