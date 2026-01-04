#!/bin/bash

# Generate MongoDB encryption key file
# This script generates a 256-bit (32-byte) key for MongoDB WiredTiger encryption

KEYFILE_PATH="${1:-docker/mongodb/keyfile}"

# Create directory if it doesn't exist
mkdir -p "$(dirname "$KEYFILE_PATH")"

# Generate random 32-byte key and convert to base64
# MongoDB expects the keyfile to contain a base64-encoded key
openssl rand -base64 32 > "$KEYFILE_PATH"

# Set proper permissions (read-only for owner)
chmod 600 "$KEYFILE_PATH"

echo "MongoDB encryption key generated at: $KEYFILE_PATH"
echo "IMPORTANT: Backup this key file securely. You'll need it to restore encrypted data."
echo "Never commit this file to version control!"

