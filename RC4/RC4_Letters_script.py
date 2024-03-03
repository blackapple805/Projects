def format_hex_string(s, chars_per_line=32):
    """Formats a long hex string into lines with a fixed number of characters."""
    return '\n'.join([s[i:i+chars_per_line] for i in range(0, len(s), chars_per_line)])


def XOR(plain_text, key_stream):
    """Helper function to perform the XOR operation."""
    return [byte ^ ks for byte, ks in zip(plain_text, key_stream)]


def encryption(plain_text_hex, key_hex):
    # Convert plaintext and key to byte arrays
    plain_text = bytes.fromhex(plain_text_hex)
    key = bytes.fromhex(key_hex)

    # Displaying the plain text and key
    print(f"Plain text (in hexadecimal): {plain_text_hex}")
    print(f"Key (in hexadecimal): {key_hex}\n")

    # Initialize S and T
    S = [i for i in range(256)]
    T = [key[i % len(key)] for i in range(256)]

    # KSA
    j = 0
    for i in range(256):
        j = (j + S[i] + T[i]) % 256
        S[i], S[j] = S[j], S[i]

    # Displaying S after KSA
    formatted_S = format_hex_string(''.join(f'{i:02X}' for i in S))
    print(f"Initial S after KSA (in hexadecimal):\n{formatted_S}\n")

    T_hex = ''.join(f'{i:02X}' for i in T).upper()
    formatted_T_hex = format_hex_string(T_hex)
    print("Initial T based on the key:")
    print(formatted_T_hex)
    print("")  

    # PGRA (Stream Generation)
    key_stream = []
    i = j = 0
    for byte in plain_text:
        i = (i + 1) % 256
        j = (j + S[i]) % 256
        S[i], S[j] = S[j], S[i]
        t = (S[i] + S[j]) % 256
        key_stream.append(S[t])

    # Displaying the Key Stream
    print(f"Key Stream (in hexadecimal): {''.join(f'{i:02X}' for i in key_stream)}\n")

    cipher_text = XOR(plain_text, key_stream)
    print(f"Cipher text (in hexadecimal): {''.join(f'{i:02X}' for i in cipher_text)}")

    return cipher_text, key_stream

def decryption(cipher_text_hex, key_stream):
    cipher_text = bytes.fromhex(cipher_text_hex)
    decrypted_text = bytes(XOR(cipher_text, key_stream))
    print(f"\nDecrypted text (in hexadecimal): {decrypted_text.hex().upper()}")


if __name__ == "__main__":
    print("Encryption:")
    cipher_text, key_stream = encryption("AABBCCDDEEFF", "456789")

    print("\n---------------------------------------------------------")
    decryption(''.join(f'{i:02X}' for i in cipher_text), key_stream)
