from flask import Flask, request, jsonify
from twilio.rest import Client
from decouple import config

app = Flask(__name__)

# Using python-decouple to get Twilio configuration from .env
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER')

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@app.route('/send_text', methods=['POST'])
def send_text():
    data = request.json
    phone_number = data.get('phone_number')
    message = data.get('message')

    # Sending message using Twilio
    message = client.messages.create(
        body=message,
        from_=TWILIO_PHONE_NUMBER,
        to=phone_number
    )

    return jsonify({"message": "Text sent successfully!"})

# Make sure to run the app if this script is executed
if __name__ == "__main__":
    app.run()
