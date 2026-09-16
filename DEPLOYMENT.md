# CoachKush - Production VPS Deployment Guide

This guide describes deploying CoachKush to an Ubuntu LTS server (AWS EC2, DigitalOcean, Hetzner, or Linode) using Docker Compose, Nginx, Let's Encrypt SSL, and MongoDB Atlas.

---

## 📋 Prerequisites

1. **Ubuntu 22.04 LTS or 24.04 LTS Server** (Minimum 2GB RAM recommended)
2. **Domain Name** pointed to your Server IP:
   - Root or Web: `@` -> `YOUR_SERVER_IP`
   - API: `api` -> `YOUR_SERVER_IP` (or single domain via reverse proxy `/api`)
3. **MongoDB Atlas Cluster** (M0 Free or Production Dedicated)
4. **Razorpay Production Credentials** (Key ID, Key Secret, optional Webhook Secret)
5. **SMTP Mail Credentials** (Host, Port, User, Password)

---

## 🛠️ Step-by-Step Deployment Sequence

### 1. Server Hardening & Firewall Configuration
SSH into your server and update packages:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
```

Configure UFW firewall to allow only SSH, HTTP, and HTTPS:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Install Docker & Docker Compose
```bash
# Add Docker's official GPG key & repository
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable Docker without sudo (optional)
sudo usermod -aG docker $USER
```

### 3. Clone Repository & Setup Environment
```bash
sudo mkdir -p /opt/coachkush
sudo chown -R $USER:$USER /opt/coachkush
cd /opt/coachkush

git clone <YOUR_REPOSITORY_URL> .
cp .env.example .env
nano .env
```

Populate `.env` with your production values:
```ini
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com

MONGO_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/coachkush?retryWrites=true&w=majority
JWT_SECRET=<GENERATE_A_32_CHAR_RANDOM_SECRET>
JWT_EXPIRES_IN=1d

ADMIN_USERNAME=coachkush_admin
ADMIN_PASSWORD=<STRONG_UNIQUE_PASSWORD>

WHATSAPP_CONTACT_URL=https://wa.me/91XXXXXXXXXX

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<YOUR_SENDGRID_KEY>
SMTP_FROM_EMAIL=coach@yourdomain.com
SMTP_FROM_NAME=CoachKush

RAZORPAY_KEY_ID=<YOUR_PRODUCTION_RAZORPAY_KEY_ID>
RAZORPAY_KEY_SECRET=<YOUR_PRODUCTION_RAZORPAY_KEY_SECRET>
RAZORPAY_WEBHOOK_SECRET=<YOUR_PRODUCTION_RAZORPAY_WEBHOOK_SECRET>
```

### 4. Build and Start Docker Containers
```bash
docker compose build --no-cache
docker compose up -d
```

Check running container status:
```bash
docker compose ps
docker compose logs -f backend
```

### 5. Obtain SSL Certificate with Certbot
Install Certbot for Let's Encrypt:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Run Certbot to request certificates:
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

Mount certificates into `/opt/coachkush/nginx/nginx.conf` and uncomment the SSL block, then reload Nginx:
```bash
docker compose restart nginx
```

### 6. Verify Production Health
Test the health check endpoint:
```bash
curl -i https://yourdomain.com/api/health
```
Expected response:
```json
{
  "status": "ok",
  "checks": {
    "api": "ok",
    "database": "connected"
  }
}
```

### 7. Access Admin Portal
Navigate to `https://yourdomain.com/login` and authenticate using your configured `ADMIN_USERNAME` and `ADMIN_PASSWORD`. You will immediately be redirected to the secure **Admin Dashboard** (`/admin`).

---

## 🔄 Updating the Application in Production

```bash
cd /opt/coachkush
git pull origin main
docker compose build
docker compose up -d
docker system prune -f
```
