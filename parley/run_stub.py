import os
# Make it look like the real local Ollama setup
os.environ['LLM_BASE_URL'] = 'http://localhost:11434/v1'
os.environ['LLM_API_KEY'] = ''
os.environ['LLM_MODEL'] = 'llama3.2'
import app as application
import llm
def fake_chat(history):
    last = history[-1]['content'].lower()
    if 'tuple' in last or 'list' in last:
        return ("Great question! The main difference is **mutability**:\n\n"
                "- A **list** can be changed after creation (add, remove, reorder).\n"
                "- A **tuple** is immutable — once made, it can't change.\n\n"
                "```python\nnums = [1, 2, 3]      # list\nnums.append(4)        # works\n\n"
                "point = (4, 5)        # tuple\npoint[0] = 9          # TypeError!\n```\n\n"
                "Use a tuple when the data shouldn't change (like coordinates), "
                "and a list when it should.")
    return "How can I help you today?"
llm.chat = fake_chat
llm.is_configured = lambda: True
llm.provider_label = lambda: "Ollama (local)"
application.app.run(host='127.0.0.1', port=5056, debug=False, use_reloader=False)
