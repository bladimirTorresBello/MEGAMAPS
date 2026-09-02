"""Crea megamaps.sqlite desde datos_salones_seed.json.

Las asignaturas se normalizan a partir del campo area existente.
No se inventan asignaturas para registros cuyo area es null.
"""

import json
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).parent
SEED_PATH = ROOT / "datos_salones_seed.json"
SCHEMA_PATH = ROOT / "schema.sql"
DB_PATH = ROOT / "megamaps.sqlite"


def separar_asignaturas(area):
    if not area:
        return []
    partes = re.split(r"\s*,\s*|\s+-\s+|\s+y\s+", area.strip())
    return [parte.strip() for parte in partes if parte.strip()]


def obtener_id(con, tabla, nombre):
    fila = con.execute(
        f"SELECT id FROM {tabla} WHERE nombre = ?", (nombre,)
    ).fetchone()
    if fila:
        return fila[0]
    cursor = con.execute(
        f"INSERT INTO {tabla} (nombre) VALUES (?)", (nombre,)
    )
    return cursor.lastrowid


def main():
    with SEED_PATH.open(encoding="utf-8") as archivo:
        salones = json.load(archivo)

    if DB_PATH.exists():
        DB_PATH.unlink()

    con = sqlite3.connect(DB_PATH)
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

    registros = 0
    relaciones_materia = 0
    for numero, datos in salones.items():
        nombre_salon = f"Salón {numero}" if numero.isdigit() else numero.replace("_", " ").title()
        cursor = con.execute(
            "INSERT INTO salones (numero, nombre, piso) VALUES (?, ?, ?)",
            (numero, nombre_salon, datos.get("piso", 1)),
        )
        salon_id = cursor.lastrowid

        for jornada in ("manana", "tarde"):
            docente = datos.get(jornada)
            if not docente:
                continue

            profesor_id = obtener_id(con, "profesores", docente["nombre"])
            cursor = con.execute(
                """INSERT INTO profesor_salones
                   (salon_id, profesor_id, jornada, grado, area_original)
                   VALUES (?, ?, ?, ?, ?)""",
                (
                    salon_id,
                    profesor_id,
                    jornada,
                    docente.get("grado"),
                    docente.get("area"),
                ),
            )
            profesor_salon_id = cursor.lastrowid
            registros += 1

            for asignatura in separar_asignaturas(docente.get("area")):
                asignatura_id = obtener_id(con, "asignaturas", asignatura)
                con.execute(
                    """INSERT INTO profesor_asignaturas
                       (profesor_salon_id, asignatura_id) VALUES (?, ?)""",
                    (profesor_salon_id, asignatura_id),
                )
                relaciones_materia += 1

    itinerantes = [
        ("Guido Arnoldo Rodriguez Torrente", "Informática (Inf 1)", "Sin salón fijo"),
        ("Nini Johana Salamanca Maldonado", "Informática (Inf 1)", "Sin salón fijo"),
    ]
    for nombre, area, nota in itinerantes:
        profesor_id = obtener_id(con, "profesores", nombre)
        con.execute(
            """INSERT INTO profesores_itinerantes
               (profesor_id, area_original, nota) VALUES (?, ?, ?)""",
            (profesor_id, area, nota),
        )
        for asignatura in separar_asignaturas(area):
            asignatura_id = obtener_id(con, "asignaturas", asignatura)
            con.execute(
                """INSERT INTO profesor_itinerante_asignaturas
                   (profesor_id, asignatura_id) VALUES (?, ?)""",
                (profesor_id, asignatura_id),
            )

    con.commit()
    con.close()
    print(
        f"Creada {DB_PATH.name}: {len(salones)} salones, "
        f"{registros} relaciones docente-salon y "
        f"{relaciones_materia} relaciones de asignaturas."
    )


if __name__ == "__main__":
    main()
