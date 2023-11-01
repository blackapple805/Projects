#Run this after testing out the hacker keygen example to set valid signature.
from Crypto.PublicKey import RSA

# Generate an RSA key pair
key = RSA.generate(4096)

# Export the private key to a file with a passphrase
with open('pr.pem', 'wb') as f:
    pem = key.export_key(format='PEM', passphrase='dees')
    f.write(pem)

# Export the public key to a file
with open('pu.pem', 'wb') as f:
    pub_key = key.publickey()
    pub_pem = pub_key.export_key(format='PEM')
    f.write(pub_pem)

print("RSA key pair generated and saved to 'pr.pem' and 'pu.pem'.")
