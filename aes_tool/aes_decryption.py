from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

def decrypt_message(key, iv, ciphertext):
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    
    padded_message = decryptor.update(ciphertext) + decryptor.finalize()
    
    unpadder = padding.PKCS7(128).unpadder()
    message = unpadder.update(padded_message) + unpadder.finalize()
    return message.decode()

if __name__ == "__main__":
    # Use the same key and IV from the encryption script for testing
    key = b'...'  # Paste the key here
    iv = b'...'   # Paste the IV here
    ciphertext = b'...'  # Paste the ciphertext here
    message = decrypt_message(key, iv, ciphertext)
    print(f"Decrypted message: {message}")
