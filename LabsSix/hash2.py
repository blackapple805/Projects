import hashlib
import os

# Function to hash a password with a given salt
def hash_password(password, salt):
    return hashlib.sha256(salt.encode() + password.encode()).hexdigest()

# Define the same password for two users
password = "userPassword"

# Generate two different salt values
salt1 = os.urandom(16).hex()  # Generates a random salt
salt2 = os.urandom(16).hex()  # Generates a different random salt

# Hash the password with each salt
hash1 = hash_password(password, salt1)
hash2 = hash_password(password, salt2)

print(f"Hash with salt1: {hash1}")
print(f"Hash with salt2: {hash2}")
