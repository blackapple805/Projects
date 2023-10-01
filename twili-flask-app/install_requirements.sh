#!/bin/bash

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "pip could not be found. Exiting."
    exit 1
fi

# Update pip
pip install --upgrade pip

# Loop through each line in requirements.txt
while IFS= read -r p; do
    # Try to install the package. If it fails, log the failure.
    if pip install --no-cache-dir "$p"; then
        echo "Successfully installed $p"
    else
        echo "Failed to install $p, skipping..."
    fi
done < "requirements.txt"