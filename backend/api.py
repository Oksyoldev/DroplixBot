from flask import Flask, jsonify, request
import random
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Разрешаем кросс-доменные запросы

# Несколько кейсов с призами и шансами
CASES = {
    "case1": {
        "name": "Мягкие игрушки",
        "prizes": [
            {"name": "Мишка 🧸", "chance": 50},
            {"name": "Кролик 🐰", "chance": 30},
            {"name": "Пусто 🙁", "chance": 20}
        ]
    },
    "case2": {
        "name": "Премиум кейс",
        "prizes": [
            {"name": "Telegram Premium 🎁", "chance": 5},
            {"name": "Подарочная карта 💳", "chance": 15},
            {"name": "Пусто 🙁", "chance": 80}
        ]
    },
    "case3": {
        "name": "Фруктовый кейс",
        "prizes": [
            {"name": "Яблоко 🍎", "chance": 40},
            {"name": "Банан 🍌", "chance": 30},
            {"name": "Апельсин 🍊", "chance": 20},
            {"name": "Пусто 🙁", "chance": 10}
        ]
    }
}

@app.route("/")
def home():
    return "DroplixBot API is running"

@app.route("/api/cases", methods=["GET"])
def get_cases():
    # Вернуть список кейсов с id и именами
    cases_list = [{"id": case_id, "name": case["name"]} for case_id, case in CASES.items()]
    return jsonify(cases_list)

@app.route("/api/open-case", methods=["GET"])
def open_case():
    case_id = request.args.get("case_id")
    if not case_id or case_id not in CASES:
        return jsonify({"error": "Кейс не найден"}), 404

    prizes = CASES[case_id]["prizes"]
    choices = [p["name"] for p in prizes]
    weights = [p["chance"] for p in prizes]
    prize = random.choices(choices, weights=weights, k=1)[0]
    return jsonify({"prize": prize})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
