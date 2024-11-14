# src/transcriber.py
import whisper
import nltk
import language_tool_python

# Ensure NLTK data is downloaded
nltk.download('punkt', quiet=True)

def transcribe_audio(audio_path, model_name="tiny"):  # Changed to "tiny"
    model = whisper.load_model(model_name)
    result = model.transcribe(audio_path)
    raw_text = result["text"]
    # Format the text
    formatted_text = format_text(raw_text)
    return formatted_text

def format_text(text):
    # Tokenize the text into sentences
    sentences = nltk.tokenize.sent_tokenize(text)
    # Capitalize the first letter of each sentence
    sentences = [sentence.strip().capitalize() for sentence in sentences]
    # Join sentences back into a single string with proper spacing
    formatted_text = ' '.join(sentences)
    
    # Initialize Language Tool for grammar and punctuation correction
    tool = language_tool_python.LanguageTool('en-US')
    # Check for mistakes
    matches = tool.check(formatted_text)
    # Correct the text
    corrected_text = language_tool_python.utils.correct(formatted_text, matches)
    
    return corrected_text
