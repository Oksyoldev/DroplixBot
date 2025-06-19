from flask import Flask, jsonify
import random
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Включаем CORS для путей /api/*

@app.route("/")
def home():
    return "DroplixBot API is running"

PRIZES = [
    {"name": "Мишка 🧸", "chance": 50},
    {"name": "Telegram Premium 🎁", "chance": 5},
    {"name": "Пусто 🙁", "chance": 45}
]

@app.route("/api/open-case", methods=["GET"])
def open_case():
    choices = [p["name"] for p in PRIZES]
    weights = [p["chance"] for p in PRIZES]
    prize = random.choices(choices, weights=weights, k=1)[0]
    return jsonify({"prize": prize})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
