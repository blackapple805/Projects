import openai
from decouple import config

# Using python-decouple to get OpenAI configuration from .env
OPENAI_API_KEY = config('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY

def get_gpt_response(user_input):
    try:
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=user_input,
            max_tokens=150
        )
        chat_response = response['choices'][0]['text'].strip()
        return chat_response
    except Exception as e:
        return str(e)





