#!/usr/bin/python

# Standard libraries
import os

# Third-party libraries
from api.twilio import send_twilio_message
from api.chatgpt import get_gpt_response
from api.logger import log_info, log_error
from flask import Flask, request, jsonify
from twilio.rest import Client
from dotenv import load_dotenv
from flask import render_template
import openai

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
TWILIO_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
openai.api_key = OPENAI_API_KEY

@app.route('/send_text', methods=['POST'])
def send_text():
    data = request.json
    if not data:
        log_error("No data received on /send_text endpoint")  # Logging
        return jsonify({"error": "No data provided!"}), 400

    phone_number = data.get('phone_number')
    message = data.get('message')
    if not phone_number or not message:
        log_error("Missing phone number or message in /send_text request")  # Logging
        return jsonify({"error": "Missing phone number or message!"}), 400

    # Use the function from twilio.py to send the message
    message_sid = send_twilio_message(phone_number, message)
    
    if message_sid:
        log_info(f"Message sent successfully with SID: {message_sid}")  # Logging
    else:
        log_error("Failed to send message via Twilio")  # Logging

    return jsonify({"message": "Text sent successfully!", "sid": message_sid})

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('input')

    if not user_input:
        return jsonify({"error": "input is required"}), 400

    chat_response = get_gpt_response(user_input)

    return jsonify({"response": chat_response})

@app.route('/')
def index():
    return render_template('chat_template.html')

if __name__ == '__main__':
    app.run()