# Production Deployment Guide
**DigitalOcean SGP1 · bcuams.birat.codes + nuclei.birat.codes**

---

## VM Reference

| Key | Value |
|-----|-------|
| Public IP | `188.166.209.236` |
| Reserved IP (DNS target) | `209.38.56.176` |
| Region | SGP1 (Singapore) |
| Spec | 2 vCPU · 2 GB RAM · 50 GB SSD |
| BCU domain | `bcuams.birat.codes` |
| Nuclei domain | `nuclei.birat.codes` |

> ⚠️ **Face recognition** in BCU uses `/dev/video0` (webcam). DigitalOcean VMs have no physical camera — this feature will be disabled. All other BCU features (attendance, auth, WebSocket) work normally.

---

## Architecture

```
Internet :80/:443
     │
  Reserved IP 209.38.56.176
     │
  UFW: 80 ✓  443 ✓  22 ✗ (internet) — SSH only via Tailscale
     │
  BCU nginx container (port 80:80, 443:443)
     ├── bcuams.birat.codes → frontend:3000 (BCU Next.js)
     │     ├── /api/django/* → django:8000
     │     ├── /ws/*         → django:8000 (WebSocket)
     │     ├── /static/*     → volume
     │     └── /media/*      → volume
     └── nuclei.birat.codes → nuclei-frontend:3000 (via proxy_net)
           └── internal      → backend:8000 (nuclei default network)
```

---

## Step 0 — DNS (do first, propagates while you work)

At your DNS provider (wherever `birat.codes` is managed), add:

```
A   bcuams.birat.codes    209.38.56.176   TTL 300
A   nuclei.birat.codes    209.38.56.176   TTL 300
```

Both point to the **reserved IP**, not the ephemeral one.

---

## Step 1 — Initial SSH as Root

```bash
ssh root@188.166.209.236
```

---

## Step 2 — Create `deploy` User

```bash
adduser deploy                       # set a strong password
usermod -aG sudo deploy
usermod -aG docker deploy            # allow docker without sudo (after Docker install)

# Copy your SSH public key to deploy user
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Test from your laptop (new terminal — keep root session open):
```bash
ssh deploy@188.166.209.236
```

---

## Step 3 — System Updates

```bash
apt update && apt upgrade -y
apt install -y curl wget git ufw fail2ban unattended-upgrades net-tools
```

---

## Step 4 — Install Tailscale

> ⚠️ **Do this BEFORE closing port 22.** If Tailscale fails and port 22 is closed, you'll be locked out (use DO console to recover).

```bash
curl -fsSL https://tailscale.com/install.sh | sh

# Start Tailscale (as deploy user or root)
tailscale up --ssh

# Tailscale will print a URL — open it in browser to authorize the VM
# After auth, Tailscale assigns a 100.x.x.x IP

# Confirm it works — note your Tailscale hostname or IP:
tailscale ip -4
tailscale status
```

Test Tailscale SSH from your laptop:
```bash
ssh deploy@<tailscale-ip-or-hostname>
# e.g.: ssh deploy@100.x.x.x
```

Confirm this works **before** proceeding to UFW.

---

## Step 5 — UFW Firewall

```bash
# Default: deny everything in, allow everything out
ufw default deny incoming
ufw default allow outgoing

# Allow HTTP and HTTPS from internet
ufw allow 80/tcp
ufw allow 443/tcp

# SSH: allow ONLY on Tailscale interface (tailscale0)
# This closes port 22 from the public internet
ufw allow in on tailscale0 to any port 22

# Enable
ufw --force enable
ufw status verbose
```

Expected output — 22 only appears for `tailscale0`, NOT `eth0`.

---

## Step 6 — SSH Hardening

Edit `/etc/ssh/sshd_config`:

```bash
nano /etc/ssh/sshd_config
```

Set or verify these lines:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
AllowUsers deploy
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

```bash
systemctl restart ssh
```

Test from your laptop (must use Tailscale IP now):
```bash
ssh deploy@<tailscale-ip>         # should work
ssh deploy@188.166.209.236       # should time out (port closed)
```

---

## Step 7 — fail2ban

```bash
# Default config is fine for SSH brute-force protection
systemctl enable --now fail2ban
fail2ban-client status sshd
```

---

## Step 8 — Unattended Security Upgrades

```bash
dpkg-reconfigure --priority=low unattended-upgrades
# Select "Yes" when prompted
```

---

## Step 9 — 10 GB Swap

```bash
fallocate -l 10G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Persist across reboots
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Reduce swap pressure (only use swap when RAM < 10%)
echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl -p

# Verify
free -h
swapon --show
```

---

## Step 10 — Docker

```bash
# Install Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sh

# Add deploy user to docker group
usermod -aG docker deploy

# Enable Docker daemon on boot
systemctl enable --now docker

# Log out and back in for group to take effect
exit
ssh deploy@<tailscale-ip>

# Verify
docker version
docker compose version
```

---

## Step 11 — Shared Docker Network + Project Directories

```bash
# Shared network — BCU nginx uses this to reach nuclei frontend
docker network create proxy_net

# Project directories
sudo mkdir -p /srv/bcu /srv/nuclei
sudo chown deploy:deploy /srv/bcu /srv/nuclei
```

---

## Step 12 — Clone Both Projects

```bash
# BCU project
cd /srv/bcu
git clone https://github.com/<YOUR_BCU_REPO>.git .

# Nuclei project
cd /srv/nuclei
git clone https://github.com/ToniBirat7/Nuclei_Segmentation_U-Net_VGG_x_RFC.git .
```

---

## Step 13 — BCU Project Environment

```bash
cd /srv/bcu

# Create .env from template
cp env.docker.example .env
nano .env
```

Fill in `.env`:
```bash
SECRET_KEY=<generate: python3 -c "import secrets; print(secrets.token_hex(50))">
DEBUG=False
ALLOWED_HOSTS=bcuams.birat.codes,127.0.0.1,localhost
FRONTEND_URLS=https://bcuams.birat.codes,http://localhost

# SQLite (default for Docker — no separate DB needed)
DB_NAME=/app/data/db.sqlite3

REDIS_URL=redis://redis:6379
```

---

## Step 14 — BCU nginx Changes for Dual-Project Routing

The BCU nginx needs two changes: (1) add the nuclei server block, (2) join `proxy_net`.

### 14a. Update `/srv/bcu/nginx/nginx.conf`

Change `server_name _;` to `server_name bcuams.birat.codes;` and add a second server block:

```nginx
# BCU AMS — primary app
server {
    listen 80;
    server_name bcuams.birat.codes;
    client_max_body_size 10M;

    location /static/ {
        alias /var/www/static/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location /api/django/ {
        proxy_pass http://django:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://django:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Nuclei Segmentation — routes to nuclei-frontend on proxy_net
server {
    listen 80;
    server_name nuclei.birat.codes;
    client_max_body_size 15M;

    location / {
        proxy_pass         http://nuclei-frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

### 14b. Update `/srv/bcu/docker-compose.yml`

Add `proxy_net` to the nginx service and declare the network:

```yaml
services:
  # ... existing services unchanged ...

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"      # add this for HTTPS later
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - static_files:/var/www/static:ro
      - media_files:/var/www/media:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro    # add for HTTPS later
    depends_on:
      - django
      - frontend
    networks:
      - default
      - proxy_net       # allows nginx to reach nuclei-frontend

# Add at bottom of docker-compose.yml:
networks:
  proxy_net:
    external: true
```

> These BCU changes need to be committed to the BCU repo and deployed. Do this before starting the nuclei project.

---

## Step 15 — Start BCU Project

```bash
cd /srv/bcu
docker compose build
docker compose up -d
docker compose ps
docker compose logs nginx
```

Verify:
```bash
curl -H "Host: bcuams.birat.codes" http://localhost/api/django/
# → 401 or 200 (not 502)
```

---

## Step 16 — Start Nuclei Project

```bash
cd /srv/nuclei
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Verify internal routing:
```bash
# Backend healthy
docker exec $(docker ps -qf name=nuclei_backend) curl -s http://localhost:8000/api/v1/health

# Frontend reachable via proxy_net alias
curl -H "Host: nuclei.birat.codes" http://localhost/
# → should return HTML (200)
```

---

## Step 17 — HTTPS with Let's Encrypt

Install certbot on the **host** (not in container):

```bash
apt install -y certbot

# Stop BCU nginx temporarily to free port 80
cd /srv/bcu && docker compose stop nginx

# Obtain certificates for both domains
certbot certonly --standalone \
  -d bcuams.birat.codes \
  -d nuclei.birat.codes \
  --agree-tos --email biratgautam09@gmail.com --non-interactive

# Restart BCU nginx
docker compose start nginx
```

### Update BCU nginx.conf for HTTPS

Replace the two server blocks with HTTPS-enabled versions:

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name bcuams.birat.codes nuclei.birat.codes;
    return 301 https://$host$request_uri;
}

# BCU AMS — HTTPS
server {
    listen 443 ssl;
    server_name bcuams.birat.codes;
    client_max_body_size 10M;

    ssl_certificate     /etc/letsencrypt/live/bcuams.birat.codes/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bcuams.birat.codes/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location /static/ { alias /var/www/static/; expires 7d; add_header Cache-Control "public, immutable"; }
    location /media/  { alias /var/www/media/;  expires 30d; add_header Cache-Control "public"; }

    location /api/django/ {
        proxy_pass http://django:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://django:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Nuclei Segmentation — HTTPS
server {
    listen 443 ssl;
    server_name nuclei.birat.codes;
    client_max_body_size 15M;

    ssl_certificate     /etc/letsencrypt/live/bcuams.birat.codes/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bcuams.birat.codes/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
        proxy_pass         http://nuclei-frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

Reload BCU nginx:
```bash
cd /srv/bcu && docker compose exec nginx nginx -s reload
```

### Auto-renew certbot

```bash
# Test renewal
certbot renew --dry-run

# Add cron (runs twice daily, standard certbot practice)
echo "0 */12 * * * root certbot renew --quiet --deploy-hook 'cd /srv/bcu && docker compose exec nginx nginx -s reload'" \
  >> /etc/crontab
```

---

## Step 18 — Final Verification

```bash
# Both domains respond with HTTPS
curl -I https://bcuams.birat.codes
curl -I https://nuclei.birat.codes

# Nuclei segmentation health
curl https://nuclei.birat.codes/api/v1/health
# → {"status":"ok","model_loaded":true}

# Memory check
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}"

# Disk usage
df -h /
du -sh /var/lib/docker
```

---

## Step 19 — CI/CD Setup

Both projects deploy automatically on push to `master` via Tailscale SSH.

### Get your Tailscale VM hostname

```bash
# On VM:
tailscale status
# Note the machine name, e.g.: "sgp1-vm" or the 100.x.x.x IP
```

### GitHub Secrets — BCU repo

Go to BCU repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `TAILSCALE_AUTHKEY` | Generate at tailscale.com/admin/settings/keys (reusable, tagged `tag:ci`) |
| `VM_HOST` | Tailscale hostname or 100.x.x.x IP |
| `VM_USER` | `deploy` |
| `VM_SSH_KEY` | Private key of `deploy` user (see below) |

### GitHub Secrets — Nuclei repo

Same secrets as BCU (same VM, same user):

| Secret | Value |
|--------|-------|
| `TAILSCALE_AUTHKEY` | Same as BCU (or generate a new one) |
| `VM_HOST` | Same Tailscale IP/hostname |
| `VM_USER` | `deploy` |
| `VM_SSH_KEY` | Same private key |

### Generate deploy SSH key pair (on VM)

```bash
# As deploy user on VM:
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# Add public key to authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Print private key — paste this as VM_SSH_KEY secret in GitHub
cat ~/.ssh/deploy_key
```

### Update BCU deploy.yml — change `cd ~/BCU_AMS_CV_Project` to `/srv/bcu`

```yaml
# In BCU repo .github/workflows/deploy.yml, line ~43:
script: |
  cd /srv/bcu          # was: cd ~/BCU_AMS_CV_Project
  git stash push ...
```

### Tailscale Auth Key

1. Go to https://login.tailscale.com/admin/settings/keys
2. Create key: **Reusable**, **Pre-authorized**, tag `tag:ci`
3. Paste as `TAILSCALE_AUTHKEY` secret in both repos

### Test CI/CD

```bash
# Push a trivial change to master on both repos — watch Actions tab
git commit --allow-empty -m "test: trigger deploy"
git push origin master
```

---

## Step 20 — BCU deploy.yml Update

Update the BCU workflow to use `/srv/bcu` path. In the BCU repo:

```yaml
# .github/workflows/deploy.yml line 43 — change:
cd ~/BCU_AMS_CV_Project
# to:
cd /srv/bcu
```

Commit and push to BCU repo.

---

## RAM Budget

| Service | Idle | Peak |
|---------|------|------|
| BCU redis | 10 MB | 32 MB (capped) |
| BCU django/daphne | 130 MB | 280 MB |
| BCU next.js | 80 MB | 150 MB |
| BCU nginx | 10 MB | 15 MB |
| Nuclei FastAPI+ONNX | 125 MB | 200 MB |
| Nuclei next.js | 50 MB | 80 MB |
| OS + Docker daemon | 300 MB | 300 MB |
| **Total** | **~705 MB** | **~1057 MB** |
| **Swap** | **10 GB** | safety net |

2 GB VM — ~1 GB headroom at peak. Swap handles spikes.

---

## Maintenance Cheatsheet

```bash
# View all running containers
docker ps

# Logs
docker compose -f /srv/nuclei/docker-compose.prod.yml logs -f
docker compose -f /srv/bcu/docker-compose.yml logs -f

# Restart a service
docker compose -f /srv/nuclei/docker-compose.prod.yml restart backend

# Manual deploy (if CI fails)
cd /srv/nuclei && git pull && docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d
cd /srv/bcu   && git pull && docker compose build && docker compose up -d

# Free up disk space
docker system prune -f
docker image prune -a -f    # removes ALL unused images (use with care)

# Renew SSL manually
certbot renew && cd /srv/bcu && docker compose exec nginx nginx -s reload

# Check swap
free -h && swapon --show

# System resource snapshot
htop   # install: apt install htop
```

---

## Quick-Start Sequence Summary

```
1.  DNS A records → 209.38.56.176
2.  SSH root@188.166.209.236
3.  Create deploy user + copy SSH keys
4.  apt update && apt upgrade
5.  Install Tailscale → tailscale up --ssh → test SSH via Tailscale
6.  UFW: allow 80,443 + SSH only on tailscale0 interface
7.  SSH hardening → restart ssh
8.  fail2ban + unattended-upgrades
9.  10 GB swap
10. Install Docker
11. docker network create proxy_net
12. mkdir /srv/bcu /srv/nuclei
13. Clone both repos
14. BCU: create .env, update nginx.conf + docker-compose.yml
15. BCU: docker compose up -d
16. Nuclei: docker compose -f docker-compose.prod.yml up -d
17. certbot → HTTPS
18. Update nginx.conf for HTTPS → reload nginx
19. GitHub Secrets → test CI/CD push
20. Monitor: docker stats, free -h
```
