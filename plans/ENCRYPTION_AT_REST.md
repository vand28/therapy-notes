# Encryption at Rest for MongoDB

## Important: MongoDB Community Edition Limitation

MongoDB Community Edition **does not support encryption at rest**. This feature is only available in MongoDB Enterprise Edition, which requires a paid license.

## Recommended Solution: Filesystem-Level Encryption

Since we're using MongoDB Community Edition, encryption at rest should be handled at the **filesystem level** on your VPS. This provides the same security benefits without requiring MongoDB Enterprise.

## Implementation Options

### Option 1: LUKS/dm-crypt (Linux VPS - Recommended)

Encrypt the entire disk or a specific partition where MongoDB data is stored:

```bash
# 1. Create encrypted volume
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup luksOpen /dev/sdb1 mongodb-encrypted

# 2. Format and mount
sudo mkfs.ext4 /dev/mapper/mongodb-encrypted
sudo mount /dev/mapper/mongodb-encrypted /var/lib/mongodb

# 3. Update /etc/fstab for auto-mount on boot
echo "/dev/mapper/mongodb-encrypted /var/lib/mongodb ext4 defaults 0 2" | sudo tee -a /etc/fstab

# 4. Update docker-compose volume path
# Point MongoDB data volume to /var/lib/mongodb
```

### Option 2: Docker Volume Encryption

Use Docker's volume encryption plugins (if available on your VPS provider):

```bash
# Example with Docker volume encryption plugin
docker volume create --driver local \
  --opt type=tmpfs \
  --opt device=tmpfs \
  --opt o=encryption=luks \
  mongodb-encrypted
```

### Option 3: VPS Provider Encryption

Many VPS providers offer encrypted storage options:

- **DigitalOcean**: Encrypted volumes
- **AWS EC2**: EBS encryption
- **Linode**: Encrypted block storage
- **Vultr**: Encrypted volumes

Check your VPS provider's documentation for encrypted storage options.

## For Development (Local)

For local development, MongoDB encryption is optional. The data is already protected by:
- Local filesystem permissions
- Docker container isolation
- Network isolation (not exposed to internet)

## Security Best Practices

1. **Use filesystem encryption** on production VPS
2. **Enable MongoDB authentication** (username/password)
3. **Use TLS/SSL** for connections (if MongoDB is exposed to network)
4. **Regular backups** of encrypted volumes
5. **Secure key management** - Store encryption keys securely (not in code)

## Current Configuration

The MongoDB configuration file (`docker/mongodb/mongod.conf`) has been updated to work with Community Edition. The encryption key file references have been removed.

## Migration Path (If Upgrading to Enterprise Later)

If you decide to upgrade to MongoDB Enterprise Edition in the future:

1. Install MongoDB Enterprise Edition
2. Generate encryption key: `openssl rand -base64 32 > /etc/mongodb/keyfile`
3. Update `mongod.conf` to include:
   ```yaml
   storage:
     wiredTiger:
       engineConfig:
         encryptionKeyFile: /etc/mongodb/keyfile
   ```
4. Restart MongoDB

## References

- [MongoDB Encryption at Rest (Enterprise)](https://www.mongodb.com/docs/manual/core/security-encryption-at-rest/)
- [LUKS Disk Encryption Guide](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_a_non-root_file_system)
- [Docker Volume Encryption](https://docs.docker.com/storage/volumes/)

