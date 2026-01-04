#!/bin/bash

# Setup script for filesystem-level encryption on VPS
# This script helps set up LUKS encryption for MongoDB data directory
# Run this on your VPS before deploying MongoDB

set -e

echo "🔐 MongoDB Encryption at Rest Setup (Filesystem Level)"
echo "======================================================"
echo ""
echo "This script will help you set up LUKS encryption for MongoDB data."
echo "WARNING: This will format the specified device/partition!"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Prompt for device
read -p "Enter the device/partition to encrypt (e.g., /dev/sdb1): " DEVICE

if [ ! -b "$DEVICE" ]; then
    echo "❌ Error: $DEVICE is not a valid block device"
    exit 1
fi

# Prompt for mount point
read -p "Enter mount point for encrypted volume (default: /var/lib/mongodb): " MOUNT_POINT
MOUNT_POINT=${MOUNT_POINT:-/var/lib/mongodb}

# Prompt for volume name
read -p "Enter name for encrypted volume (default: mongodb-encrypted): " VOLUME_NAME
VOLUME_NAME=${VOLUME_NAME:-mongodb-encrypted}

echo ""
echo "⚠️  WARNING: This will format $DEVICE and encrypt it!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

# Create encrypted volume
echo ""
echo "📦 Creating encrypted volume..."
cryptsetup luksFormat "$DEVICE"
cryptsetup luksOpen "$DEVICE" "$VOLUME_NAME"

# Format filesystem
echo ""
echo "📝 Formatting filesystem..."
mkfs.ext4 "/dev/mapper/$VOLUME_NAME"

# Create mount point
mkdir -p "$MOUNT_POINT"

# Mount encrypted volume
echo ""
echo "🔗 Mounting encrypted volume..."
mount "/dev/mapper/$VOLUME_NAME" "$MOUNT_POINT"

# Set permissions
chown -R 999:999 "$MOUNT_POINT"  # MongoDB user (UID 999 in Docker)
chmod 700 "$MOUNT_POINT"

# Add to /etc/fstab for auto-mount
echo ""
echo "💾 Adding to /etc/fstab for auto-mount..."
UUID=$(blkid -s UUID -o value "/dev/mapper/$VOLUME_NAME")
echo "/dev/mapper/$VOLUME_NAME $MOUNT_POINT ext4 defaults 0 2" >> /etc/fstab

# Create key file for auto-unlock (optional, more secure)
echo ""
read -p "Do you want to create a keyfile for auto-unlock on boot? (yes/no): " CREATE_KEYFILE

if [ "$CREATE_KEYFILE" == "yes" ]; then
    KEYFILE="/etc/mongodb/luks-keyfile"
    mkdir -p "$(dirname "$KEYFILE")"
    dd if=/dev/urandom of="$KEYFILE" bs=512 count=1
    chmod 400 "$KEYFILE"
    
    # Add keyfile to LUKS
    cryptsetup luksAddKey "$DEVICE" "$KEYFILE"
    
    echo ""
    echo "✅ Keyfile created at $KEYFILE"
    echo "⚠️  IMPORTANT: Backup this keyfile securely! You'll need it to unlock the volume."
fi

echo ""
echo "✅ Encryption setup complete!"
echo ""
echo "Next steps:"
echo "1. Update docker-compose.yml to mount MongoDB data to: $MOUNT_POINT"
echo "2. Test unlocking: cryptsetup luksOpen $DEVICE $VOLUME_NAME"
echo "3. Test mounting: mount /dev/mapper/$VOLUME_NAME $MOUNT_POINT"
echo ""
echo "To unlock on boot, you'll need to:"
echo "- Enter the passphrase manually, OR"
echo "- Use the keyfile (if created) with crypttab configuration"

