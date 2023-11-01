from Crypto.Signature import pss
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA

message = b'This is a signed message.'
signature = open('signature.bin', 'rb').read()
key = RSA.import_key(open('pu.pem', 'rb').read())
h = SHA256.new(message)
verifier = pss.new(key)

try:
    verifier.verify(h, signature)
    print("The signature is valid")
except (ValueError, TypeError):
    print("The signature is not valid")
