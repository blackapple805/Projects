from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import os

def generate_key():
    return os.urandom(32)  # 256-bit key

def generate_iv():
    return os.urandom(16)  # 128-bit IV

def encrypt_message(key, iv, message):
    padder = padding.PKCS7(128).padder()
    padded_message = padder.update(message.encode()) + padder.finalize()
    
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    
    ciphertext = encryptor.update(padded_message) + encryptor.finalize()
    return ciphertext

if __name__ == "__main__":
    key = generate_key()
    iv = generate_iv()
    message = "This is a secret message."
    ciphertext = encrypt_message(key, iv, message)
    print(f"Encrypted message: {ciphertext}")
