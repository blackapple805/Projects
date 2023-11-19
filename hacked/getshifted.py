# Hashes provided
hashes = [
    "$1$0$EirqXvHmIzsiAW8LmO.zN.",
    "$5$0$5GZQxJujTuSw6kCZ6/rIhOV/bzc3UsP6W1SkkhZpp29",
    "$6$0$.6eKjU5LqRhLF3anllT1tDMv6/3FZpqS89eW.DiwAoelAPBm.d7ZoXXnNb6Udbn2FQPt.ArHo6eJDm53ceJ56.",
    "$1$0$seXGF0PApUi5AX9aZh0FU/",
    "$6$N92rTy0gcbK7vsGe$9IKMOKzUulO5ViLRJd1NG.VkQ18QkH8NgMVXmDwcPbdV1EllO30zoK5Ia0nHUh.RZlKVlngCMXehjaCUuL05s1"
]

# Organize the hashes by type
hash_files = {
    'md5.txt': [],
    'sha256.txt': [],
    'sha512.txt': [],
    # Assuming some hashes may be Blowfish or yescrypt, even though none are present in the list
    'blowfish.txt': [],  
    'yescrypt.txt': []   
}

for hash_string in hashes:
    if hash_string.startswith('$1$'):
        hash_files['md5.txt'].append(hash_string)
    elif hash_string.startswith('$5$'):
        hash_files['sha256.txt'].append(hash_string)
    elif hash_string.startswith('$6$'):
        hash_files['sha512.txt'].append(hash_string)
    # No identifiable prefixes for Blowfish or yescrypt in the provided hashes

# Write each hash into its corresponding file
for filename in hash_files:
    with open(filename, 'w') as file:  # Removed the /mnt/data/ path
        for hash_string in hash_files[filename]:
            file.write(hash_string + '\n')

# Return the list of files created
list(hash_files.keys())
