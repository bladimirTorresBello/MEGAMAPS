<?php
// API PHP para consultar la base SQLite de MegaMaps.
header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = new PDO('sqlite:' . __DIR__ . DIRECTORY_SEPARATOR . 'megamaps.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA foreign_keys = ON');

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
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo consultar la base de datos.']);
}
