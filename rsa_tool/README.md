# RSA Encryption/Decryption Tool

This project demonstrates RSA encryption and decryption using Python.

## Requirements

- Python 3.x
- pip (Python package installer)
- `cryptography` library

## Setup

1. Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

2. Install dependencies:
    ```bash
    pip install cryptography
    ```

## Usage

1. Run the `main.py` script:
    ```bash
    python main.py
    ```

This will generate RSA keys, encrypt a message, and then decrypt it.

## Files

- `encryption.py`: Contains functions for generating keys and encrypting messages.
- `decryption.py`: Contains functions for loading keys and decrypting messages.
- `main.py`: Integrates the encryption and decryption functions.
