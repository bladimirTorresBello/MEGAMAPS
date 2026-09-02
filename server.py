"""
MEGA MAPS — Backend real con base de datos (SQLite)
----------------------------------------------------
Este servidor SÍ guarda los datos en un archivo de base de datos
(`megamaps.db`), no en memoria — así que si el administrador agrega o
edita un salón, ese cambio queda guardado de verdad y lo ve cualquiera
que consulte este servidor (a diferencia de localStorage, que es solo
para el navegador de una persona).

SQLite no necesita instalar ningún programa de base de datos aparte:
ya viene incluido en Python. El archivo `megamaps.db` se crea solo la
primera vez que corres este servidor.

## Cómo probarlo en tu computadora (antes de subirlo a internet)
    pip install flask flask-cors
    python server.py
    -> abre http://127.0.0.1:5000/api/salones en el navegador,
       deberías ver la lista completa de salones en formato JSON.

## Cómo hacer que la app (script.js) lo use
En `script.js`, cambia la constante API_BASE_URL (arriba del todo)
de "" a la URL de este servidor, por ejemplo:
    const API_BASE_URL = "://127.0.0.1:5000http";      (para probar local)
    const API_BASE_URL = "https://tu-app.onrender.com"; (ya en internet)

## Para que funcione desde el celular de cualquiera (no solo tu compu)
Necesitas subir este servidor a un hosting que lo mantenga corriendo
24/7. Uno gratis y sencillo es Render (render.com):
    1. Sube esta carpeta a GitHub (igual que hiciste con la app).
    2. En Render: "New +" -> "Web Service" -> conecta ese repositorio.
    3. Build command:  pip install -r requirements.txt
       Start command:  gunicorn server:app
    4. En "Environment", agrega la variable MEGAMAPS_ADMIN_KEY con
       una clave que tú elijas (esa es la clave real de administrador,
       reemplaza al PIN "1234" que era solo de mentiras).
    5. Render te da una URL (https://algo.onrender.com) — esa es la
       que pones en API_BASE_URL dentro de script.js.

Sin ese paso 5, el backend con base de datos existe pero no está
"encendido" en ningún lado — por eso hace falta, no es opcional si
quieres que los cambios de administrador se vean en todos los celulares.
"""

import os
import json
import sqlite3
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

DB_PATH = Path(__file__).parent / "megamaps.db"
SEED_PATH = Path(__file__).parent / "datos_salones_seed.json"



# ------------------------------------------------------------------
# FRONTEND
# ------------------------------------------------------------------

@app.route("/")
@app.route("/index.html")
def index():
    return send_from_directory(Path(__file__).parent, "index.html")

# ------------------------------------------------------------------
# Admin gate — reemplaza el PIN de mentiras del frontend por una
# clave real que solo tú conoces. Configúrala como variable de entorno
# MEGAMAPS_ADMIN_KEY en tu hosting; si no la configuras, usa una clave
# por defecto que DEBES cambiar antes de usar esto en serio.
# ------------------------------------------------------------------
ADMIN_KEY = os.environ.get("MEGAMAPS_ADMIN_KEY", "cambia-esta-clave")


def es_admin(req):
    return req.headers.get("X-Admin-Key") == ADMIN_KEY


# ------------------------------------------------------------------
# Base de datos
# ------------------------------------------------------------------
def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def init_db():
    nueva = not DB_PATH.exists()
    con = get_db()
    con.execute("""
        CREATE TABLE IF NOT EXISTS salones (
            numero TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            piso INTEGER NOT NULL DEFAULT 1,
            manana_json TEXT,
            tarde_json TEXT
        )
    """)
    con.execute("""
        CREATE TABLE IF NOT EXISTS rutas (
            clave TEXT PRIMARY KEY,
            camino_json TEXT NOT NULL,
            etiquetas_json TEXT
        )
    """)
    con.commit()

    if nueva and SEED_PATH.exists():
        with open(SEED_PATH, encoding="utf-8") as f:
            seed = json.load(f)
        for numero, d in seed.items():
            nombre = f"Salón {numero}" if numero.isdigit() else numero.replace("_", " ").title()
            con.execute(
                "INSERT OR IGNORE INTO salones (numero, nombre, piso, manana_json, tarde_json) VALUES (?,?,?,?,?)",
                (
                    numero,
                    nombre,
                    d.get("piso", 1),
                    json.dumps(d.get("manana")) if d.get("manana") else None,
                    json.dumps(d.get("tarde")) if d.get("tarde") else None,
                ),
            )
        con.commit()
        print(f"Base de datos creada con {len(seed)} salones reales.")
    con.close()


def fila_a_dict(row):
    return {
        "numero": row["numero"],
        "nombre": row["nombre"],
        "piso": row["piso"],
        "manana": json.loads(row["manana_json"]) if row["manana_json"] else None,
        "tarde": json.loads(row["tarde_json"]) if row["tarde_json"] else None,
    }


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------
@app.route("/api/salones", methods=["GET"])
def listar_salones():
    con = get_db()
    filas = con.execute("SELECT * FROM salones ORDER BY numero").fetchall()
    con.close()
    return jsonify({row["numero"]: fila_a_dict(row) for row in filas})


@app.route("/api/salones/<numero>", methods=["GET"])
def obtener_salon(numero):
    con = get_db()
    row = con.execute("SELECT * FROM salones WHERE numero = ?", (numero,)).fetchone()
    con.close()
    if not row:
        return jsonify({"error": f"No existe el salón {numero}"}), 404
    return jsonify(fila_a_dict(row))


@app.route("/api/salones", methods=["POST"])
def crear_salon():
    if not es_admin(request):
        return jsonify({"error": "No autorizado. Falta o es incorrecto el header X-Admin-Key."}), 401
    data = request.get_json(force=True) or {}
    numero = data.get("numero")
    if not numero:
        return jsonify({"error": "Falta 'numero'"}), 400

    con = get_db()
    con.execute(
        "INSERT OR REPLACE INTO salones (numero, nombre, piso, manana_json, tarde_json) VALUES (?,?,?,?,?)",
        (
            numero,
            data.get("nombre", f"Salón {numero}"),
            data.get("piso", 1),
            json.dumps(data.get("manana")) if data.get("manana") else None,
            json.dumps(data.get("tarde")) if data.get("tarde") else None,
        ),
    )
    con.commit()
    row = con.execute("SELECT * FROM salones WHERE numero = ?", (numero,)).fetchone()
    con.close()
    return jsonify(fila_a_dict(row)), 201


@app.route("/api/salones/<numero>", methods=["PUT"])
def editar_salon(numero):
    if not es_admin(request):
        return jsonify({"error": "No autorizado. Falta o es incorrecto el header X-Admin-Key."}), 401
    con = get_db()
    row = con.execute("SELECT * FROM salones WHERE numero = ?", (numero,)).fetchone()
    if not row:
        con.close()
        return jsonify({"error": f"El salón {numero} no existe"}), 404

    data = request.get_json(force=True) or {}
    nombre = data.get("nombre", row["nombre"])
    piso = data.get("piso", row["piso"])
    manana = json.dumps(data["manana"]) if "manana" in data and data["manana"] else row["manana_json"]
    tarde = json.dumps(data["tarde"]) if "tarde" in data and data["tarde"] else row["tarde_json"]

    con.execute(
        "UPDATE salones SET nombre=?, piso=?, manana_json=?, tarde_json=? WHERE numero=?",
        (nombre, piso, manana, tarde, numero),
    )
    con.commit()
    row = con.execute("SELECT * FROM salones WHERE numero = ?", (numero,)).fetchone()
    con.close()
    return jsonify(fila_a_dict(row))


@app.route("/api/salones/<numero>", methods=["DELETE"])
def borrar_salon(numero):
    if not es_admin(request):
        return jsonify({"error": "No autorizado. Falta o es incorrecto el header X-Admin-Key."}), 401
    con = get_db()
    con.execute("DELETE FROM salones WHERE numero = ?", (numero,))
    con.commit()
    con.close()
    return jsonify({"ok": True})


# ------------------------------------------------------------------
# Rutas personalizadas — mismo principio que los salones: si el
# administrador edita el texto de una ruta, queda guardado aquí para
# que TODOS los dispositivos la vean, no solo el suyo.
# La "clave" combina el sitio de partida y el salón de llegada,
# ej: "entrada__salon_205".
# ------------------------------------------------------------------
@app.route("/api/rutas", methods=["GET"])
def listar_rutas():
    con = get_db()
    filas = con.execute("SELECT * FROM rutas").fetchall()
    con.close()
    resultado = {}
    for row in filas:
        resultado[row["clave"]] = {
            "camino": json.loads(row["camino_json"]),
            "etiquetas": json.loads(row["etiquetas_json"]) if row["etiquetas_json"] else None,
        }
    return jsonify(resultado)


@app.route("/api/rutas/<clave>", methods=["PUT"])
def guardar_ruta(clave):
    if not es_admin(request):
        return jsonify({"error": "No autorizado. Falta o es incorrecto el header X-Admin-Key."}), 401
    data = request.get_json(force=True) or {}
    camino = data.get("camino")
    if not camino:
        return jsonify({"error": "Falta 'camino'"}), 400
    con = get_db()
    con.execute(
        "INSERT OR REPLACE INTO rutas (clave, camino_json, etiquetas_json) VALUES (?,?,?)",
        (clave, json.dumps(camino), json.dumps(data.get("etiquetas")) if data.get("etiquetas") else None),
    )
    con.commit()
    con.close()
    return jsonify({"ok": True})


@app.route("/api/rutas/<clave>", methods=["DELETE"])
def borrar_ruta(clave):
    if not es_admin(request):
        return jsonify({"error": "No autorizado. Falta o es incorrecto el header X-Admin-Key."}), 401
    con = get_db()
    con.execute("DELETE FROM rutas WHERE clave = ?", (clave,))
    con.commit()
    con.close()
    return jsonify({"ok": True})


@app.route("/api/salud", methods=["GET"])
def salud():
    """Para probar rápido que el servidor está vivo."""
    return jsonify({"status": "ok", "mensaje": "MEGA MAPS backend corriendo"})


init_db()

if __name__ == "__main__":
    app.run(debug=True)
