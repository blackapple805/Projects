# AES-CBC Encryption/Decryption Tool

This project demonstrates AES-CBC encryption and decryption using Python.

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

This will generate an AES key and IV, encrypt a user-inputted message, and then decrypt it.

## Files

- `aes_encryption.py`: Contains functions for generating keys and IVs, and encrypting messages.
- `aes_decryption.py`: Contains functions for decrypting messages.
- `main.py`: Integrates the encryption and decryption functions.
