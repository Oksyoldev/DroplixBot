import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # ← сначала путь

from config import BOT_TOKEN  # ← потом импортировать

from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackContext

WEBAPP_URL = "https://inquisitive-kheer-9ad9db.netlify.app/" 

async def start(update: Update, context: CallbackContext):
    keyboard = [
        [InlineKeyboardButton("🚀 Открыть кейсы", web_app=WebAppInfo(WEBAPP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "Привет! Нажми кнопку, чтобы открыть DroplixBot кейсы.",
        reply_markup=reply_markup
    )

def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.run_polling()

if __name__ == "__main__":
    main()
