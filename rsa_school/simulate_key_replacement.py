import shutil

# Backup the original pu.pem
shutil.copy2('pu.pem', 'pu_backup.pem')

# Copy hacker's public key to pu.pem
shutil.copy2('hacker_public.pem', 'pu.pem')

# After performing the required operations, restore the original pu.pem comment this line out for testing
shutil.copy2('pu_backup.pem', 'pu.pem')