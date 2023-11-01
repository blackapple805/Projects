from Crypto.Signature import pss
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA

message = b'This is a signed message.'
key_pem = open('pr.pem', 'rb').read()
key = RSA.import_key(key_pem, passphrase='dees')
h = SHA256.new(message)
signer = pss.new(key)
signature = signer.sign(h)
open('signature.bin', 'wb').write(signature)
