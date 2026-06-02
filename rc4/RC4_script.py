# Python3 program for the above approach
# f RC4 algorithm
def binary_to_hex(binary_string):
    # Pad the binary string to make its length a multiple of 4
    while len(binary_string) % 4 != 0:
        binary_string = '0' + binary_string

    # Create a mapping from binary to hexadecimal
    bin_to_hex = {
        '0000': '0', '0001': '1', '0010': '2', '0011': '3',
        '0100': '4', '0101': '5', '0110': '6', '0111': '7',
        '1000': '8', '1001': '9', '1010': 'A', '1011': 'B',
        '1100': 'C', '1101': 'D', '1110': 'E', '1111': 'F'
    }

    hex_string = ''
    # Iterate through the binary string, 4 bits at a time
    for i in range(0, len(binary_string), 4):
        # Extract the next 4 bits
        bits = binary_string[i:i+4]
        # Look up the hexadecimal representation and add it to the result
        hex_string += bin_to_hex[bits]

    return hex_string

def binary_to_octal(binary_string):
    # Pad the binary string to make its length a multiple of 3
    while len(binary_string) % 3 != 0:
        binary_string = '0' + binary_string

    # Create a mapping from binary to octal
    bin_to_oct = {
        '000': '0',
        '001': '1',
        '010': '2',
        '011': '3',
        '100': '4',
        '101': '5',
        '110': '6',
        '111': '7'
    }

    octal_string = ''
    # Iterate through the binary string, 3 bits at a time
    for i in range(0, len(binary_string), 3):
        # Extract the next 3 bits
        bits = binary_string[i:i+3]
        # Look up the octal representation and add it to the result
        octal_string += bin_to_oct[bits]

    return octal_string

# Function for encryption
def encryption():
 
    global key, plain_text, n
 
    # Given text and key
    plain_text = "001010010010111010011000"
    key = "1010010000011101"
 
    # n is the no: of bits to
    # be considered at a time
    n = 3
 
    print("Plain text : ", plain_text)
    print("Key : ", key)
    print("n : ", n)
 
    print(" ")
 
    # The initial state vector array
    S = [i for i in range(0, 2**n)]
    S_octal = [oct(i)[2:] for i in S]  # Convert each element to octal
    S_hex = [hex(i)[2:].upper() for i in S]  # Convert each element to Hexadecimal
    print("Initial S (decimal): [", end="")
    print(", ".join(map(str, S)), end="]\n")

    print("Initial S (octal): [", end="")
    print(", ".join(S_octal), end="]\n")

    print("Initial S (in hexadecimal): [", end="")
    print(", ".join(S_hex), end="]\n")

    print(" ")
    
    key_list = [key[i:i + n] for i in range(0, len(key), n)]
    # Convert to key_stream to decimal
    for i in range(len(key_list)):
        key_list[i] = int(key_list[i], 2)
 
    # Convert to plain_text to decimal
    global pt
 
    pt = [plain_text[i:i + n] for i in range(0, len(plain_text), n)]
 
    for i in range(len(pt)):
        pt[i] = int(pt[i], 2)
 
    print("Plain text ( in array form ): ", pt)
    print(" ")
    # Making key_stream equal
    # to length of state vector
    diff = int(len(S)-len(key_list))

    if diff != 0:
        for i in range(0, diff):
            key_list.append(key_list[i])
 
    key_list_octal = [oct(i)[2:] for i in key_list]  # Convert each element to octal
    key_list_hex = [hex(i)[2:].upper() for i in key_list] #Convert each element to Hexadecimal
    print("T (Key list in decimal): [", end="")
    print(", ".join(map(str, key_list)), end="]\n")

    print("T (Key list in octal): [", end="")
    print(", ".join(key_list_octal), end="]\n")

    print("T (Key list in hexadecimal): [", end="")
    print(", ".join(key_list_hex), end="]\n")

    print(" ")

    # Perform the KSA algorithm
    def KSA():
        j = 0
        N = len(S)
         
        # Iterate over the range [0, N]
        for i in range(0, N):
           
            # Find the key
            j = (j + S[i]+key_list[i]) % N
             
            # Update S[i] and S[j]
            S[i], S[j] = S[j], S[i]
            print(i, " ", end ="")
             
            # Print S
            print(S)
 
        initial_permutation_array = S
         
        print(" ")
        print("The initial permutation array is : ",
              initial_permutation_array)
 
    print("KSA iterations : ")
    print(" ")
    KSA()
    print(" ")
 
    # Perform PGRA algorithm
    def PGRA():
 
        N = len(S)
        i = j = 0
        global key_stream
        key_stream = []
 
        # Iterate over [0, length of pt]
        for k in range(0, len(pt)):
            i = (i + 1) % N
            j = (j + S[i]) % N
             
            # Update S[i] and S[j]
            S[i], S[j] = S[j], S[i]
            print(k, " ", end ="")
            print(S)
            t = (S[i]+S[j]) % N
            key_stream.append(S[t])
 
        print(" ")
        # Print the key stream
        print("Key stream : ", key_stream)
        key_stream_octal = [oct(i)[2:] for i in key_stream]  # Convert each element to octal
        key_stream_hex = [hex(i)[2:].upper() for i in key_stream] # Convert each element to Hexadecimal
        print("Key stream (in octal): [", end="")
        print(", ".join(key_stream_octal), end="]\n")

        print("Key stream (in hexadecimal): [", end="")
        print(", ".join(key_stream_hex), end="]\n")

        print(" ")
 
    print("PGRA iterations : ")
    print(" ")
    PGRA()
 
    # Performing XOR between generated
    # key stream and plain text
    def XOR():
        global cipher_text
        cipher_text = []
        for i in range(len(pt)):
            c = key_stream[i] ^ pt[i]
            cipher_text.append(c)
 
    XOR()
 
    # Convert the encrypted text to
    # bits form
    encrypted_to_bits = ""
    for i in cipher_text:
        encrypted_to_bits += '0'*(n-len(bin(i)[2:]))+bin(i)[2:]
 
    print(" ")
    print("Cipher text : ", encrypted_to_bits)
    
    # Convert binary ciphertext to octal and print
    octal_ciphertext = binary_to_octal(encrypted_to_bits)
    print("Cipher text (in octal):", octal_ciphertext)

    # Convert binary ciphertext to hexadecimal and print
    hexadecimal_ciphertext = binary_to_hex(encrypted_to_bits)
    print("Cipher text (in hexadecimal):", hexadecimal_ciphertext)

encryption()
print("---------------------------------------------------------")
 # Function for decryption of data
def decryption():
    # Function for decryption of data

    # Perform XOR between generated
    # key stream  and cipher text
    def do_XOR():
        global original_text
        original_text = []
        for i in range(len(cipher_text)):
            p = key_stream[i] ^ cipher_text[i]
            original_text.append(p)
 
    do_XOR()
 
    # convert the decrypted text to
    # the bits form
    decrypted_to_bits = ""
    for i in original_text:
        decrypted_to_bits += '0'*(n-len(bin(i)[2:]))+bin(i)[2:]
 
    print(" ")
    print("Decrypted text : ",
          decrypted_to_bits)
 
# Driver Code
decryption()

