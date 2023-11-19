# hash.py
import hashlib

# Function to calculate hash with a given algorithm
def calculate_hash(file_path, algorithm):
    with open(file_path, 'rb') as file:
        file_bytes = file.read()
        hash_obj = algorithm()
        hash_obj.update(file_bytes)
        return hash_obj.hexdigest()

# Path to the message file
file_path = 'message.txt'

# Calculate and print hash digests for each algorithm
print("SHA-1:", calculate_hash(file_path, hashlib.sha1))
print("SHA-224:", calculate_hash(file_path, hashlib.sha224))
print("SHA-256:", calculate_hash(file_path, hashlib.sha256))
print("SHA-384:", calculate_hash(file_path, hashlib.sha384))
print("SHA-512:", calculate_hash(file_path, hashlib.sha512))
