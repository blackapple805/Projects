import logging

# Configure logging
logging.basicConfig(filename='app.log', level=logging.DEBUG)

def log_info(message):
    logging.info(message)

def log_error(message):
    logging.error(message)