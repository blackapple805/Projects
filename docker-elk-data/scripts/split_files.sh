#!/bin/bash

DIRECTORY="/media/sf_GreatVm/harhar"
CHUNK_SIZE=10000
CHUNK_DIR="${DIRECTORY}/chunks"

# Create the chunks directory if it doesn't exist
mkdir -p "$CHUNK_DIR"

for file in "$DIRECTORY"/*.csv; do
    # Extract the base name of the file without the directory to prefix the split file
    BASENAME=$(basename "$file" .csv)
    # Split the file
    split -l $CHUNK_SIZE "$file" "${CHUNK_DIR}/${BASENAME}_chunk_"
    
    # Rename the chunk files to have .csv extension
    for chunk in "${CHUNK_DIR}/${BASENAME}_chunk_"*; do
        mv "$chunk" "$chunk.csv"
    done
    
    # Remove the original file after splitting
    rm "$file"
done
