from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes

def load_private_key(filepath='private_key.pem'):
    with open(filepath, 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
        )
    return private_key

def decrypt_message(private_key, ciphertext):
    plaintext = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return plaintext.decode()

if __name__ == "__main__":
    private_key = load_private_key()
    # Assuming you have the ciphertext from the encryption script
    ciphertext = b'...'  # Paste the ciphertext here
    plaintext = decrypt_message(private_key, ciphertext)
    print(f"Decrypted message: {plaintext}")
