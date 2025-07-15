from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
from pymongo import MongoClient # type: ignore
import bcrypt
import jwt as pyjwt
import datetime
from bson.objectid import ObjectId # type: ignore
from register_blockchain import registrar_receita
from grpc_client import grpc_register_music, grpc_play_music, grpc_list_musics
from dotenv import load_dotenv
import os

load_dotenv()
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
jwt_secret = os.getenv("JWT_SECRET", "tunechain_super_secreto_123")

app = Flask(__name__)
CORS(app, supports_credentials=True)

client = MongoClient(mongo_uri)
db = client["tunechain"]
users_col = db["users"]
musics_col = db["musics"]

def generate_token(username, role="user"):
    payload = {
        "user": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = pyjwt.encode(payload, jwt_secret, algorithm="HS256")
    return token.decode("utf-8") if isinstance(token, bytes) else token

def decode_token(token):
    try:
        return pyjwt.decode(token, jwt_secret, algorithms=["HS256"])
    except pyjwt.ExpiredSignatureError:
        return None
    except pyjwt.InvalidTokenError:
        return None

@app.route("/user/register", methods=["POST", "OPTIONS"])
def register_user():
    if request.method == "OPTIONS":
        return '', 200 

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "user")

    if not username or not password:
        return jsonify({ "success": False, "message": "Campos obrigatórios ausentes." }), 400

    if users_col.find_one({ "username": username }):
        return jsonify({ "success": False, "message": "Usuário já existe." }), 409

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users_col.insert_one({ "username": username, "password": hashed_pw, "role": role })

    return jsonify({ "success": True, "message": "Usuário criado com sucesso." }), 201

@app.route("/user/login", methods=["POST"])
def login_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = users_col.find_one({ "username": username })
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({ "message": "Credenciais inválidas." }), 403

    token = generate_token(username, user["role"])
    return jsonify({ "token": token, "role": user["role"] })

@app.route("/register", methods=["POST"])
def register_music():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({ "success": False, "message": "Token ausente ou inválido" }), 401

    token = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded or decoded.get("role") != "admin":
        return jsonify({ "success": False, "message": "Apenas administradores podem registrar músicas." }), 403

    data = request.get_json()
    title = data.get("title")
    artist = data.get("artist")
    producer = data.get("producer")
    revenue_split = data.get("revenue_split", 0)

    if not title or not artist or not producer:
        return jsonify({ "success": False, "message": "Campos obrigatórios ausentes." }), 400

    success, message = grpc_register_music(title, artist, producer, revenue_split)
    status = 201 if success else 500
    return jsonify({ "success": success, "message": message }), status

@app.route("/musics", methods=["GET"])
def list_musics():
    return jsonify(grpc_list_musics())

@app.route("/play/<music_id>", methods=["POST"])
def play_music(music_id):
    music = musics_col.find_one({ "_id": ObjectId(music_id) })
    if not music:
        return jsonify({ "success": False, "message": "Música não encontrada." }), 404

    data = request.get_json() or {}
    vezes = int(data.get("vezes", 1))

    success, message = grpc_play_music(music["title"], vezes)
    status = 200 if success else 500
    return jsonify({ "success": success, "message": message }), status

@app.route("/buy/<music_id>", methods=["POST"])
def buy_music(music_id):
    return process_revenue(music_id, "buy", 1.29)

@app.route("/license/<music_id>", methods=["POST"])
def license_music(music_id):
    return process_revenue(music_id, "license", 10000.0)

def process_revenue(music_id, tipo, valor_unit):
    music = musics_col.find_one({ "_id": ObjectId(music_id) })
    if not music:
        return jsonify({ "success": False, "message": "Música não encontrada." }), 404

    data = request.get_json() or {}
    vezes = int(data.get("vezes", 1))
    split = music.get("revenue_split", 0)
    receita_artista = valor_unit * vezes * split / 100
    total_revenue = music.get("artist_revenue", 0.0) + receita_artista

    update = {
        "artist_revenue": total_revenue,
        "history": music.get("history", []) + [{
            "type": tipo,
            "value": receita_artista,
            "quantidade": vezes
        }]
    }
    if tipo == "buy":
        update["sales"] = music.get("sales", 0) + vezes
    elif tipo == "license":
        update["licenses"] = music.get("licenses", 0) + vezes

    musics_col.update_one({ "_id": ObjectId(music_id) }, { "$set": update })
    return jsonify({ "success": True, "message": f"{vezes} {tipo}(s) registrados com sucesso." })

@app.route("/register_music/<music_id>", methods=["POST"])
def register_music_blockchain(music_id):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({ "success": False, "message": "Token ausente ou inválido" }), 401

    token = auth_header.split(" ")[1]
    decoded = decode_token(token)
    if not decoded or decoded.get("role") != "admin":
        return jsonify({ "success": False, "message": "Apenas administradores podem registrar na blockchain." }), 403

    music = musics_col.find_one({ "_id": ObjectId(music_id) })
    if not music:
        return jsonify({ "success": False, "message": "Música não encontrada." }), 404

    try:
        receipt = registrar_receita(
            music["title"],
            music["artist"],
            music["plays"],
            int(music["artist_revenue"] * 100)
        )

        musics_col.update_one({ "_id": music["_id"] }, {
            "$set": { "plays": 0, "artist_revenue": 0.0 },
            "$push": {
                "history": {
                    "type": "blockchain",
                    "value": music["artist_revenue"],
                    "timestamp": datetime.datetime.now().isoformat(),
                    "tx_hash": receipt.transactionHash.hex()
                }
            }
        })

        return jsonify({ "success": True, "tx_hash": receipt.transactionHash.hex() })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({ "success": False, "message": str(e) }), 500


@app.route("/stats", methods=["GET"])
def get_stats():
    musicas = list(musics_col.find({}))
    total_plays = sum(m.get("plays", 0) for m in musicas)
    total_revenue = sum(m.get("artist_revenue", 0) for m in musicas)
    num_registros = sum(len(m.get("history", [])) for m in musicas)
    return jsonify({
        "total_plays": total_plays,
        "total_revenue": round(total_revenue, 2),
        "registros_blockchain": num_registros
    })

@app.route("/close-period", methods=["POST"])
def close_period():
    musicas = list(musics_col.find())
    registros = []

    for musica in musicas:
        if musica.get("plays", 0) <= 0 and musica.get("artist_revenue", 0.0) <= 0:
            continue

        try:
            receipt = registrar_receita(
                musica["title"],
                musica["artist"],
                musica["plays"],
                int(musica["artist_revenue"] * 100)
            )
            registros.append({
                "title": musica["title"],
                "artist": musica["artist"],
                "tx_hash": receipt.transactionHash.hex()
            })

            musics_col.update_one({ "_id": musica["_id"] }, {
                "$set": { "plays": 0, "artist_revenue": 0.0 },
                "$push": {
                    "history": {
                        "type": "blockchain",
                        "value": musica["artist_revenue"],
                        "timestamp": datetime.datetime.now().isoformat(),
                        "tx_hash": receipt.transactionHash.hex()
                    }
                }
            })
        except Exception as e:
            print(f"Erro ao registrar na blockchain: {e}")

    return jsonify({ "success": True, "message": f"{len(registros)} músicas registradas.", "registros": registros })

if __name__ == "__main__":
    app.run(port=8000)
