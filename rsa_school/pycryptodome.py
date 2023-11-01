from Crypto.Cipher import PKCS1_OAEP
from Crypto.PublicKey import RSA

def generate_keys():
    passphrase = "test"
    key = RSA.generate(4096)
    with open("private.pem", "wb") as private_file:
        private_file.write(key.export_key(passphrase=passphrase.encode()))
    with open("public.pem", "wb") as public_file:
        public_file.write(key.publickey().export_key())
    print("Keys generated successfully!")

def encrypt_message(message, public_key_file="public.pem"):
    with open(public_key_file, 'rb') as key_file:
        pub_key = RSA.import_key(key_file.read())
    cipher = PKCS1_OAEP.new(pub_key)
    ciphertext = cipher.encrypt(message.encode())
    with open("ciphertext.bin", "wb") as ct_file:
        ct_file.write(ciphertext)
    print("Message encrypted successfully!")

def decrypt_message(private_key_file="private.pem"):
    passphrase = input("Enter passphrase to decrypt the message: ").strip()
    with open("ciphertext.bin", "rb") as ct_file:
        ciphertext = ct_file.read()
    with open(private_key_file, "rb") as key_file:
        priv_key = RSA.import_key(key_file.read(), passphrase=passphrase)
    cipher = PKCS1_OAEP.new(priv_key)
    decrypted_message = cipher.decrypt(ciphertext).decode()
    return decrypted_message

if __name__ == "__main__":
    # Generate RSA keys
    generate_keys()

    # Encrypt a message
    message = "how about this one?"
    encrypt_message(message)

    # Decrypt the message
    try:
        decrypted = decrypt_message()
        print(f"Decrypted message: {decrypted}")
    except ValueError:
        print("Incorrect passphrase. Decryption failed.")

