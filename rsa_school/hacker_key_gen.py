from Crypto.PublicKey import RSA

def generate_hacker_keys():
    new_key = RSA.generate(2048)
    with open("hacker_private.pem", "wb") as private_file:
        private_file.write(new_key.export_key())
    with open("hacker_public.pem", "wb") as public_file:
        public_file.write(new_key.publickey().export_key())
    print("Hacker's keys generated successfully!")

if __name__ == "__main__":
    generate_hacker_keys()
