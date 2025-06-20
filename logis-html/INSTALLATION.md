# Installation Guide

## Prerequisites

### 1. Install Docker Desktop
Download and install Docker Desktop from: https://www.docker.com/products/docker-desktop/

For macOS:
- Download Docker Desktop for Mac
- Install the .dmg file
- Start Docker Desktop application
- Verify installation: `docker --version`

### 2. Verify Docker Installation
Open Terminal and run:
```bash
docker --version
docker compose --version
```

## Quick Start

### 1. Navigate to Project Directory
```bash
cd /Users/maxeroldan/Documents/logis/logis-html
```

### 2. Start the Application
```bash
docker compose up -d
```

This command will:
- Download necessary Docker images (MySQL, Node.js, Nginx)
- Build the backend API container
- Start all services in background
- Initialize the MySQL database with sample data

### 3. Verify Services are Running
```bash
docker compose ps
```

You should see 4 services running:
- `logis_frontend` (Nginx) - Port 8080
- `logis_backend` (Node.js) - Port 3001  
- `logis_mysql` (MySQL) - Port 3306
- `logis_phpmyadmin` (PhpMyAdmin) - Port 8081

### 4. Access the Application

**Main Application**: http://localhost:8080

**Database Management**: http://localhost:8081
- Server: mysql
- Username: root
- Password: rootpassword

**API Health Check**: http://localhost:3001/api/health

### 5. Test Login
Use these demo credentials:
- Email: `dev@example.com`
- Password: `password`

Or register a new account.

## Troubleshooting

### Port Conflicts
If you get port conflicts, stop other services or change ports in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change 8080 to available port
```

### View Logs
To see what's happening:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### Restart Services
```bash
# Stop all services
docker compose down

# Start again
docker compose up -d

# Rebuild after code changes
docker compose up -d --build
```

### Clean Reset
To completely reset (will lose data):
```bash
docker compose down -v
docker compose up -d
```

### Database Connection Issues
If the backend can't connect to MySQL:
1. Wait 30-60 seconds for MySQL to fully initialize
2. Check logs: `docker compose logs mysql`
3. Restart backend: `docker compose restart backend`

## Development

### Making Code Changes

**Frontend Changes** (HTML/CSS/JS):
- Edit files in `frontend/` directory
- Changes are immediately visible (refresh browser)

**Backend Changes** (Node.js):
- Edit files in `backend/` directory  
- Restart backend: `docker compose restart backend`

**Database Changes**:
- Edit `database/init.sql`
- Reset database: `docker compose down -v && docker compose up -d`

### File Structure
```
logis-html/
├── docker-compose.yml     # Service orchestration
├── frontend/              # HTML/CSS/JavaScript app
│   ├── index.html        # Main page
│   ├── css/styles.css    # Main styles
│   └── js/app.js         # Application logic
├── backend/               # Node.js API
│   ├── server.js         # Express server
│   └── package.json      # Dependencies
└── database/
    └── init.sql          # Database schema
```

## Production Deployment

For production:
1. Change default passwords in `docker-compose.yml`
2. Use environment variables for secrets
3. Add SSL/TLS certificates
4. Configure reverse proxy
5. Set up monitoring and backups

## Success Indicators

✅ All 4 Docker containers running  
✅ Application loads at http://localhost:8080  
✅ Can register/login with new accounts  
✅ Can create shipments and add products  
✅ Drag and drop works for product assignment  
✅ Database management accessible at http://localhost:8081  

The application is now fully migrated from React TypeScript + Supabase to HTML/CSS/JavaScript + MySQL with Docker!