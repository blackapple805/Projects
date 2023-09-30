#!/bin/python

from flask import Flask, request, jsonify
from twilio.rest import Client
import openai
import os  # Import the os module to read environment variables

app = Flask(__name__)

# Twilio Credentials from Environment Variables
account_sid = os.environ.get('TWILIO_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
twilio_phone_number = os.environ.get('TWILIO_PHONE_NUMBER')  # Add this line
client = Client(account_sid, auth_token)

# OpenAI API key from Environment Variables
openai.api_key = os.environ.get('OPEN_API_KEY')  # Changed to read from environment variables

@app.route('/send_text', methods=['POST'])
def send_text():
    data = request.json
    phone_number = data.get('phone_number')
    message = data.get('message')

    # Sending message using Twilio
    message = client.messages.create(
        body=message,
        from_=twilio_phone_number,  # Changed to read from environment variable
        to=phone_number
    )
    return jsonify({"message": "Text sent successfully!"})

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('input')

    # Using OpenAI API to get ChatGPT response
    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=user_input,
        max_tokens=150
    )

    chat_response = response['choices'][0]['text'].strip()

    return jsonify({"response": chat_response})

if __name__ == '__main__':
    app.run()