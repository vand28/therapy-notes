---
name: Regulie Rebranding and MongoDB Encryption Plan
overview: Rebrand from TherapyNotes to Regulie, implement MongoDB encryption at rest, then deploy to VPS
todos: []
---

# Regulie Rebranding and MongoDB Encryption Plan

## Part 1: Code Changes

### 1. Tagline for Regulie

**Official Tagline:**

- "Regulie (reh-gyoo-lee)"
- "Regulie — Helping kids find their calm, step by step"

**Usage:**

- Full tagline: "Regulie — Helping kids find their calm, step by step"
- Short form: "Regulie (reh-gyoo-lee)" - for pronunciation guidance
- Brand name: "Regulie" - standalone usage

### 2. Rebranding: Therapy-Notes to Regulie (Code Changes)

#### Backend C# Namespaces and Projects

- Rename solution: `TherapyNotes.sln` → `Regulie.sln`
- Rename projects:
- `TherapyNotes.API` → `Regulie.API`
- `TherapyNotes.Core` → `Regulie.Core`
- `TherapyNotes.Infrastructure` → `Regulie.Infrastructure`
- `TherapyNotes.Tests` → `Regulie.Tests`
- Update all namespace declarations from `TherapyNotes.*` to `Regulie.*`
- Update all `using` statements across C# files
- Update `.csproj` files with new project names
- Update solution file references

#### Configuration Files

- `backend/TherapyNotes.API/appsettings.json` - Update database name, bucket name, email addresses
- `backend/TherapyNotes.API/appsettings.Development.json` - Update database name, bucket name
- `docker-compose.yml` - Update container names, database names, bucket names, network names
- `docker-compose.prod.yml` - Update container names, database names, network names

#### Frontend Files

- `frontend/app/layout.tsx` - Update title and metadata
- `frontend/app/page.tsx` - Update branding text and tagline
- `frontend/app/login/page.tsx` - Update title
- `frontend/app/signup/page.tsx` - Update title
- `frontend/app/parent/request-access/page.tsx` - Update text
- `frontend/components/MfaSetupModal.tsx` - Update backup codes filename
- `frontend/app/dashboard/reports/page.tsx` - Update export filename
- `frontend/public/manifest.json` - Update app name and description

#### Documentation Files

- `README.md` - Update title, descriptions, references
- `FEATURES_IMPLEMENTED.md` - Update title and references
- `IMPLEMENTATION.md` - Update title and references
- `frontend/README.md` - Update title and references
- `MOBILE_QUICK_ENTRY_PLAN.md` - Update references
- All other `.md` files

#### Email Templates

- `backend/TherapyNotes.API/appsettings.json` - Update `Resend:FromEmail` from "TherapyNotes <noreply@therapynotes.app>" to "Regulie <noreply@regulie.com>"

#### Docker Configuration Updates

- Container names: `therapynotes-*` → `regulie-*`
- Database name: `therapynotes` → `regulie`
- Bucket name: `therapy-notes` → `regulie`
- Network name: `therapynotes-network` → `regulie-network`

#### Environment Variables

- Update all references in documentation and example files
- Database connection strings
- Storage bucket names

### 3. MongoDB Encryption at Rest (Code Changes)

#### Current State

- Using MongoDB Community Edition 7.0
- No encryption at rest configured
- **Deployment:** VPS (single server initially)

#### Encryption Strategy

**Encryption at Rest (REQUIRED)**

**IMPORTANT:** MongoDB Community Edition does NOT support encryption at rest. This feature is Enterprise-only.

**Solution:** Use filesystem-level encryption (LUKS/dm-crypt) on the VPS instead.

**Why Essential:**

- Protects data if VPS is compromised
- Protects data at rest (disk backups, snapshots)
- Required for compliance and security best practices
- Minimal performance impact

#### Files to Create

**New Files (Required for Encryption at Rest):**

- `docker/mongodb/mongod.conf` - MongoDB configuration file (Community Edition compatible)
- `ENCRYPTION_AT_REST.md` - Documentation for filesystem-level encryption setup
- `scripts/setup-vps-encryption.sh` - Script to set up LUKS encryption on VPS

**Note:** MongoDB Community Edition does NOT support WiredTiger encryption. Use filesystem-level encryption instead.

#### Files to Modify

- `docker-compose.yml` - Add mongod.conf volume mount
- `docker-compose.prod.yml` - Add mongod.conf volume mount
- `.gitignore` - Already configured (no MongoDB keyfile needed)
- `README.md` - Document encryption setup process
- `DOCKER.md` - Document encryption configuration

#### MongoDB Configuration Details

**MongoDB Community Edition Configuration:**

```yaml
# Basic MongoDB configuration (no encryption options)
storage:
  dbPath: /data/db
  journal:
    enabled: true

net:
  port: 27017
  bindIp: 0.0.0.0
```

**Encryption:** Handled at filesystem level using LUKS/dm-crypt on VPS (see `ENCRYPTION_AT_REST.md`)

**Connection String:**

- **VPS (localhost, no TLS):** `mongodb://localhost:27017` or `mongodb://127.0.0.1:27017`

#### Security Considerations

1. **Filesystem Encryption (VPS Level):**

- Use LUKS/dm-crypt to encrypt the disk/partition where MongoDB data is stored
- Mount encrypted volume at `/var/lib/mongodb` or similar
- Configure auto-unlock on boot (optional, using keyfile)
- Backup encryption keys securely (separate from database backups)

2. **Backup Strategy:**

- Backups will be encrypted automatically (stored on encrypted filesystem)
- Store LUKS passphrase/keyfile backup separately from database backups
- Document key recovery process

3. **Alternative Options:**

- Use VPS provider's encrypted storage (DigitalOcean encrypted volumes, AWS EBS encryption, etc.)
- Use Docker volume encryption plugins (if available)

#### Implementation Steps (Code Changes)

1. ✅ Create `docker/mongodb/mongod.conf` configuration file (Community Edition compatible)
2. ✅ Update `docker-compose.yml` to mount mongod.conf (removed keyfile reference)
3. ✅ Update `docker-compose.prod.yml` to mount mongod.conf (removed keyfile reference)
4. ✅ Create `ENCRYPTION_AT_REST.md` documentation
5. ✅ Create `scripts/setup-vps-encryption.sh` helper script
6. ✅ Update documentation files

### 4. GitHub Repository Rename

**Yes, GitHub project can be renamed.** Steps:

1. Go to repository Settings → General
2. Scroll to "Repository name" section
3. Change from `therapy-notes` to `regulie`
4. GitHub will automatically:

- Update the repository URL
- Redirect old URLs to new ones
- Update clone URLs

**Important Notes:**

- Update local git remote: `git remote set-url origin https://github.com/vand28/regulie.git`
- Update any CI/CD configurations that reference the old name
- Update documentation with new repository URLs
- Notify team members to update their local remotes

## Part 2: VPS Deployment

### 5. Domain and Subdomain Configuration

#### Domain Setup

- **Landing Page:** `regulie.com` (root domain)
- **Application:** `app.regulie.com` (subdomain)
- **Domain Provider:** Namecheap.com

#### Namecheap DNS Configuration

**Yes, subdomains are fully supported with Namecheap.** Steps:

1. **Access Namecheap DNS Management:**

- Log into Namecheap account
- Go to Domain List → Click "Manage" next to regulie.com
- Navigate to "Advanced DNS" tab

2. **Configure DNS Records:**

**For Landing Page (regulie.com):**

- Type: `A Record`
- Host: `@` (or leave blank)
- Value: Your VPS IP address
- TTL: Automatic (or 300 seconds)

**For Application (app.regulie.com):**

- Type: `A Record`
- Host: `app`
- Value: Your VPS IP address (same as root domain)
- TTL: Automatic (or 300 seconds)

**Optional - WWW Redirect:**

- Type: `CNAME Record`
- Host: `www`
- Value: `regulie.com`
- TTL: Automatic

3. **DNS Propagation:**

- Changes take 15 minutes to 48 hours to propagate globally
- Use `dig regulie.com` or `nslookup app.regulie.com` to verify

### 6. SSL Certificate Setup (Namecheap)

#### SSL Certificate Configuration

**Using Namecheap SSL Certificate:**

- SSL certificate purchased from Namecheap for `regulie.com`
- Certificate type determines subdomain coverage:
- **Single Domain:** Only covers `regulie.com` (need separate cert or wildcard for `app.regulie.com`)
- **Wildcard:** Covers `*.regulie.com` (includes `app.regulie.com`)
- **Multi-Domain:** Covers multiple specific domains

#### Certificate Installation Steps

1. **Download Certificate from Namecheap:**

- Log into Namecheap account
- Go to SSL Certificates section
- Download certificate files:
    - Certificate file (`.crt` or `.cer`)
    - Private key file (`.key`)
    - Certificate chain/intermediate certificate (`.ca-bundle`)

2. **Upload to VPS:**

- Create directory: `/etc/ssl/regulie/`
- Upload certificate files with secure permissions:
     ```bash
          chmod 600 /etc/ssl/regulie/private.key
          chmod 644 /etc/ssl/regulie/certificate.crt
          chmod 644 /etc/ssl/regulie/ca-bundle.crt
     ```




3. **Important Notes:**

- **Wildcard Certificate:** If you have `*.regulie.com`, use same certificate files for both domains
- **Single Domain Certificate:** If only `regulie.com` is covered, you'll need:
    - Option 1: Purchase additional certificate for `app.regulie.com`
    - Option 2: Use Let's Encrypt for `app.regulie.com` (free, auto-renewal)
    - Option 3: Use same certificate if it's a wildcard `*.regulie.com`
- **Certificate Renewal:** Namecheap certificates need manual renewal (set calendar reminder)
- **Certificate Validity:** Check expiration date and set up renewal reminders

### 7. Reverse Proxy Configuration (Nginx)

#### Nginx Configuration

**Files to Create:**

- `nginx/nginx.conf` - Reverse proxy configuration
- `docker/nginx/` - Nginx configuration directory
- `scripts/install-namecheap-ssl.sh` - SSL certificate installation script
- `scripts/check-ssl-expiry.sh` - Script to check certificate expiration

**Nginx Configuration Example:**

```nginx
# Landing page - regulie.com
server {
    listen 443 ssl http2;
    server_name regulie.com www.regulie.com;
    
    ssl_certificate /etc/ssl/regulie/certificate.crt;
    ssl_certificate_key /etc/ssl/regulie/private.key;
    ssl_trusted_certificate /etc/ssl/regulie/ca-bundle.crt;
    
    root /var/www/landing;
    index index.html;
}

# Application - app.regulie.com
server {
    listen 443 ssl http2;
    server_name app.regulie.com;
    
    # If wildcard cert, use same files
    # If separate cert, use app.regulie.com certificate files
    ssl_certificate /etc/ssl/regulie/certificate.crt;
    ssl_certificate_key /etc/ssl/regulie/private.key;
    ssl_trusted_certificate /etc/ssl/regulie/ca-bundle.crt;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name regulie.com www.regulie.com app.regulie.com;
    return 301 https://$server_name$request_uri;
}
```



### 8. Application Configuration for VPS

#### Frontend Configuration (Next.js)

**Files to Modify:**

- `frontend/next.config.js` - Add subdomain handling
- `frontend/.env.production` - Update API URL to use `app.regulie.com`

#### Backend Configuration (.NET)

**Files to Modify:**

- `backend/TherapyNotes.API/Program.cs` - Update CORS origins to allow `app.regulie.com`
- Configure HTTPS redirects

#### Docker Configuration

**Files to Modify:**

- `docker-compose.prod.yml` - Add reverse proxy service
- Update environment variables for production

### 9. Deployment Architecture

```javascript
Internet
  ↓
DNS (Namecheap)
  ├─ regulie.com → VPS IP
  └─ app.regulie.com → VPS IP
  ↓
VPS (Reverse Proxy - Nginx)
  ├─ regulie.com → Landing Page (Next.js static export or separate site)
  └─ app.regulie.com → Application (Next.js app + Backend API)
  ↓
Docker Containers
  ├─ MongoDB (encrypted at rest)
  ├─ Backend API (.NET)
  └─ Frontend (Next.js)
```



### 10. VPS Deployment Steps

1. **DNS Setup:**

- Add A records in Namecheap for root domain and subdomain
- Wait for DNS propagation
- Verify DNS resolution

2. **SSL Certificate Setup:**

- Download SSL certificate files from Namecheap (certificate.crt, private.key, ca-bundle.crt)
- Upload certificate files to VPS (`/etc/ssl/regulie/`)
- Set proper file permissions (600 for key, 644 for certs)
- Verify certificate type (single domain vs wildcard)
- **Important:** If single domain cert, decide on approach for `app.regulie.com`:
    - Option 1: Purchase additional certificate for `app.regulie.com`
    - Option 2: Use Let's Encrypt for `app.regulie.com` (free, auto-renewal)
    - Option 3: Use same certificate if it's a wildcard `*.regulie.com`

3. **MongoDB Encryption Setup (Filesystem Level):**

- Set up LUKS encryption on VPS using `scripts/setup-vps-encryption.sh` (see `ENCRYPTION_AT_REST.md`)
- OR use VPS provider's encrypted storage option
- Mount encrypted volume for MongoDB data directory
- Configure MongoDB to use encrypted mount point

4. **Reverse Proxy Setup:**

- Install and configure Nginx on VPS
- Configure virtual hosts for both domains
- Configure SSL using Namecheap certificate files
- Set up HTTP to HTTPS redirects

5. **Application Deployment:**

- Clone repository to VPS
- Update environment variables for production
- Build Docker images
- Start containers using `docker-compose.prod.yml`
- Verify all services are running

6. **Testing:**

- Test landing page loads at `https://regulie.com`
- Test application loads at `https://app.regulie.com`
- Verify SSL certificates work for both domains (check browser padlock)
- Verify certificate chain is complete (no warnings)
- Test HTTP to HTTPS redirects
- Test API calls from app.regulie.com
- Check SSL certificate expiration date
- Verify MongoDB encryption at rest is working
- Test database operations

### 11. Testing Checklist

**Code Changes:**

- [ ] All TherapyNotes references changed to Regulie
- [ ] All namespaces updated
- [ ] All project files renamed
- [ ] Docker configurations updated
- [ ] Documentation updated

**MongoDB Encryption:**

- [ ] MongoDB starts with encryption enabled
- [ ] Data files are encrypted (check with `strings` command)
- [ ] Key file permissions are correct (600)
- [ ] Backup/restore process tested

**VPS Deployment:**

- [ ] DNS records configured correctly
- [ ] SSL certificates installed and working
- [ ] Nginx reverse proxy configured
- [ ] Landing page accessible at https://regulie.com
- [ ] Application accessible at https://app.regulie.com
- [ ] HTTP to HTTPS redirects working
- [ ] API endpoints accessible
- [ ] CORS configured correctly
- [ ] All Docker containers running
- [ ] MongoDB encryption verified

## Summary

**Part 1: Code Changes** (Do First)

1. Update tagline throughout application
2. Rebrand all code from TherapyNotes to Regulie
3. Implement MongoDB encryption at rest
4. Rename GitHub repository

**Part 2: VPS Deployment** (Do After Code Changes)

1. Configure DNS in Namecheap
2. Install SSL certificates
3. Set up reverse proxy (Nginx)
4. Deploy application to VPS