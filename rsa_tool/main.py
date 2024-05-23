from encryption import generate_keys, save_keys, encrypt_message
from decryption import load_private_key, decrypt_message

def main():
    private_key, public_key = generate_keys()
    save_keys(private_key, public_key)
    
    message = input("Enter the message you want to encrypt: ")
    ciphertext = encrypt_message(public_key, message)
    print(f"Encrypted message: {ciphertext}")
    
    private_key = load_private_key()
    plaintext = decrypt_message(private_key, ciphertext)
    print(f"Decrypted message: {plaintext}")

if __name__ == "__main__":
    main()
