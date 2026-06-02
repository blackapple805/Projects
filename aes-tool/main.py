from aes_encryption import generate_key, generate_iv, encrypt_message
from aes_decryption import decrypt_message

def main():
    key = generate_key()
    iv = generate_iv()
    
    message = input("Enter the message you want to encrypt: ")
    ciphertext = encrypt_message(key, iv, message)
    print(f"Encrypted message: {ciphertext}")
    
    decrypted_message = decrypt_message(key, iv, ciphertext)
    print(f"Decrypted message: {decrypted_message}")

if __name__ == "__main__":
    main()
