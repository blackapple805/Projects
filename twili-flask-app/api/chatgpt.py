from flask import Flask, request, jsonify
import openai
from decouple import config

app = Flask(__name__)

# Using python-decouple to get OpenAI configuration from .env
OPENAI_API_KEY = config('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY

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

# If you plan to run this script separately, make sure to add the app runner
if __name__ == "__main__":
    app.run()
