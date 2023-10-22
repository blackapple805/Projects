import os
import PyPDF2
import openai
from dotenv import load_dotenv
from time import sleep

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI API
openai.api_key = os.getenv('OPENAI_API_KEY')

def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfFileReader(file)
        text = ""
        for page_num in range(reader.numPages):
            text += reader.getPage(page_num).extractText()
    return text

def count_tokens(text):
    return len(text) // 4

def seconds_to_hms(seconds):
    """Convert seconds into hours, minutes, and seconds."""
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    return h, m, s

def iterative_summarize_text(text):
    retry_interval = 60  # start with 60 seconds
    max_retry_interval = 3600  # cap it at an hour, adjust as needed
    while True:
        try:
            response = openai.Completion.create(
                engine="curie",
                prompt=f"Summarize the following text:\n{text}",
                max_tokens=150
            )
            return response.choices[0].text.strip()
        except openai.error.RateLimitError:
            h, m, s = seconds_to_hms(retry_interval)
            if h:
                print(f"Hit rate limit. Waiting for {h} hours, {m} minutes, and {s} seconds before retrying...")
            elif m:
                print(f"Hit rate limit. Waiting for {m} minutes and {s} seconds before retrying...")
            else:
                print(f"Hit rate limit. Waiting for {s} seconds before retrying...")
            sleep(retry_interval)
            retry_interval = min(2 * retry_interval, max_retry_interval)
        except Exception as e:
            print(f"An error occurred: {e}. Retrying in 60 seconds...")
            sleep(60)

def prepare_text_for_openai(text, max_tokens=4090):
    tokens = count_tokens(text)
    while tokens > max_tokens:
        text = text[:len(text) // 2]  # Consider using a more intelligent method if needed.
        tokens = count_tokens(text)
    return text

def split_into_sections(text, words_per_section=1000):
    words = text.split()
    sections = [' '.join(words[i:i + words_per_section]) for i in range(0, len(words), words_per_section)]
    return sections

def main():
    file_path = 'Lab 3_RC4_rev1 - Tagged.pdf'
    
    # Clearing the output file at the start
    with open("summary.txt", "w") as f:
        f.write("")

    pdf_text = extract_text_from_pdf(file_path)
    sections = split_into_sections(pdf_text)

    summaries = []
    for idx, section in enumerate(sections):
        prepared_text = prepare_text_for_openai(section)
        summary = iterative_summarize_text(prepared_text)
        if summary:
            summaries.append(summary)
            print(f"Successfully summarized section {idx + 1} out of {len(sections)}")
        else:
            print(f"Failed to summarize section {idx + 1}")
        sleep(2)  # Adding a delay to avoid rate limits
    
    # Print summaries
    for idx, summary in enumerate(summaries, 1):
        print(f"Summary {idx}:\n{summary}\n")
        # Save each summary to a file
        with open("summary.txt", "a") as f:
            f.write(f"Summary {idx}:\n{summary}\n\n")
            
    print("Summarization process completed successfully!")

if __name__ == "__main__":
    main()
