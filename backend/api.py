from flask import Flask, jsonify, request
import random
from flask_cors import CORS
import os
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Разрешаем кросс-доменные запросы

client = MongoClient("mongodb+srv://nchetenov:hTneAHtiyasno@cluster0.jqonf4c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  
db = client["droplix"]
users_collection = db["users"]

# Регистрация или получение пользователя
@app.route("/api/user", methods=["POST"])
def register_or_get_user():
    data = request.json
    telegram_id = data.get("telegram_id")
    username = data.get("username", "")

    if not telegram_id:
        return jsonify({"error": "telegram_id обязателен"}), 400

    user = users_collection.find_one({"telegram_id": telegram_id})
    if user:
        # Пользователь найден — возвращаем его данные
        return jsonify({
            "telegram_id": user["telegram_id"],
            "username": user.get("username", ""),
            "balance": user.get("balance", 0),
            "history": user.get("history", [])
        })

    # Если пользователя нет — создаём с начальным балансом и пустой историей
    new_user = {
        "telegram_id": telegram_id,
        "username": username,
        "balance": 1000,
        "history": []
    }
    users_collection.insert_one(new_user)

    return jsonify(new_user)

# Эндпоинт для обновления баланса
@app.route("/api/user/balance", methods=["POST"])
def update_balance():
    data = request.json
    telegram_id = data.get("telegram_id")
    amount = data.get("amount")  # сумма, на которую изменить баланс (может быть отрицательной)

    if not telegram_id or amount is None:
        return jsonify({"error": "telegram_id и amount обязательны"}), 400

    user = users_collection.find_one({"telegram_id": telegram_id})
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    new_balance = user.get("balance", 0) + amount
    if new_balance < 0:
        return jsonify({"error": "Недостаточно средств"}), 400

    users_collection.update_one(
        {"telegram_id": telegram_id},
        {"$set": {"balance": new_balance}}
    )

    return jsonify({"balance": new_balance})

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

@app.route("/api/open-case", methods=["POST"])
def open_case():
    data = request.json
    telegram_id = data.get("telegram_id")
    case_id = data.get("case_id")

    if not telegram_id or not case_id:
        return jsonify({"error": "Данные не переданы"}), 400

    user = users_collection.find_one({"telegram_id": telegram_id})
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    case = CASES.get(case_id)
    if not case:
        return jsonify({"error": "Кейс не найден"}), 404

    choices = [p["name"] for p in case["prizes"]]
    weights = [p["chance"] for p in case["prizes"]]
    prize = random.choices(choices, weights=weights, k=1)[0]

    users_collection.update_one(
        {"telegram_id": telegram_id},
        {"$push": {
            "history": {
                "prize": prize,
                "date": datetime.utcnow().isoformat(),
                "case_id": case_id
            }
        }}
    )

    return jsonify({"prize": prize})

@app.route("/api/history/<int:telegram_id>", methods=["GET"])
def get_history(telegram_id):
    user = users_collection.find_one({"telegram_id": telegram_id})
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404

    return jsonify(user.get("history", []))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
