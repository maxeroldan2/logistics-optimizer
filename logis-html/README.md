# Logistics Investment Optimizer - HTML/CSS/JavaScript + MySQL

A complete migration of the React TypeScript application to vanilla HTML/CSS/JavaScript with MySQL database, all containerized with Docker.

## Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript served by Nginx
- **Backend**: Node.js + Express REST API
- **Database**: MySQL 8.0
- **Containerization**: Docker + Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports 3001, 3306, 8080, 8081 available

### 1. Clone and Navigate
```bash
cd /Users/maxeroldan/Documents/logis/logis-html
```

### 2. Start All Services
```bash
docker-compose up -d
```

This will start:
- **Frontend**: http://localhost:8080 (Nginx)
- **Backend API**: http://localhost:3001 (Node.js)
- **Database**: localhost:3306 (MySQL)
- **PhpMyAdmin**: http://localhost:8081 (Database management)

### 3. Access the Application
- Open http://localhost:8080 in your browser
- Register a new account or use demo credentials:
  - Email: `dev@example.com`
  - Password: `password`

## Application Features

### ✅ Completed Features
- **Authentication**: Login/Register with JWT tokens
- **Shipment Management**: Create, view, and manage shipments
- **Container System**: Add containers with volume/weight limits
- **Product Management**: Add products with dimensions and pricing
- **Drag & Drop**: Assign products to containers via drag and drop
- **Calculations**: Real-time efficiency scoring and profit calculations
- **Dashboard**: Overview with metrics and shipment cards
- **Responsive Design**: Mobile-friendly interface

### 🏗️ Architecture Highlights
- **Stateless Frontend**: All state managed through API calls
- **RESTful API**: Complete CRUD operations for all entities
- **MySQL Schema**: Properly normalized database with foreign keys
- **Docker Environment**: Isolated, reproducible deployment
- **Security**: Password hashing, JWT authentication, CORS protection

## Database Structure

### Tables
- `users` - User authentication and subscription data
- `shipments` - Shipment containers for organizing logistics
- `containers` - Physical containers with dimensions and weight limits
- `products` - Products with dimensions, pricing, and efficiency metrics
- `saved_products` - User-saved product templates
- `saved_containers` - User-saved container templates
- `folders` - Organization folders for shipments

### Sample Data
The database initializes with sample data including:
- Demo users (free and premium accounts)
- Sample shipments with products and containers
- Product templates for quick setup

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/user/profile` - Get user profile

### Shipments
- `GET /api/shipments` - List user shipments
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/:id` - Get shipment details
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment

### Containers & Products
- `POST /api/containers` - Create container
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product (for assignments)
- `DELETE /api/containers/:id` - Delete container
- `DELETE /api/products/:id` - Delete product

### Saved Items
- `GET /api/saved-products` - Get user's saved product templates
- `POST /api/saved-products` - Save product as template
- `GET /api/folders` - Get organization folders
- `POST /api/folders` - Create new folder

## Development

### Project Structure
```
logis-html/
├── docker-compose.yml          # Docker orchestration
├── frontend/                   # HTML/CSS/JavaScript app
│   ├── index.html             # Main application page
│   ├── css/                   # Stylesheets
│   └── js/                    # JavaScript modules
├── backend/                   # Node.js API server
│   ├── server.js              # Express server
│   ├── package.json           # Dependencies
│   └── Dockerfile             # Backend container
└── database/                  # MySQL configuration
    └── init.sql               # Database schema and sample data
```

### Frontend Architecture
- **Modular JS**: Separated concerns (API, Auth, Utils, Components, App)
- **Component System**: Reusable UI rendering functions
- **State Management**: Centralized through App class with API persistence
- **Event Handling**: Modern event delegation and form handling
- **Responsive CSS**: Mobile-first design with CSS Grid and Flexbox

### Backend Architecture
- **Express.js**: RESTful API with middleware for CORS, auth, and body parsing
- **MySQL2**: Modern MySQL driver with promise support
- **JWT Authentication**: Secure token-based authentication
- **Error Handling**: Comprehensive error responses and logging
- **Connection Pooling**: Efficient database connection management

### Key Calculations
- **Product Efficiency**: Weighted scoring based on profit margin, turnover, and volume efficiency
- **Container Utilization**: Volume and weight usage tracking
- **Shipment Metrics**: Aggregated profitability and efficiency scores
- **Optimal Assignment**: Algorithm for best-fit product-to-container assignment

## Docker Services

### Frontend (Nginx)
- Serves static HTML/CSS/JavaScript files
- Lightweight Alpine-based container
- Port 8080

### Backend (Node.js)
- Express API server
- Hot reload in development
- Environment-based configuration
- Port 3001

### Database (MySQL)
- MySQL 8.0 with persistent volumes
- Automatic schema initialization
- Sample data preloaded
- Port 3306

### PhpMyAdmin
- Web-based database management
- Direct connection to MySQL
- Port 8081

## Environment Variables

The application uses these environment variables (set in docker-compose.yml):
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection
- `JWT_SECRET` - JWT token signing secret

## Commands

### Start Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f [service_name]
```

### Stop Services
```bash
docker-compose down
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### Access Database
```bash
docker-compose exec mysql mysql -u logis_user -p logis_db
```

## Migration Notes

This application successfully migrates all core functionality from the React TypeScript version:

### ✅ Successfully Migrated
- Complete UI/UX matching the original design
- All business logic and calculations
- Drag and drop functionality
- Real-time form updates
- Authentication system
- Data persistence
- Responsive design
- Modal systems
- Error handling

### 🔄 Technology Changes
- React → Vanilla JavaScript
- TypeScript → JavaScript
- Supabase → MySQL + Node.js API
- Vite → Docker + Nginx
- React Context → Class-based state management

### 🎯 Performance Benefits
- Faster initial load (no framework overhead)
- Direct database queries (no ORM overhead)
- Containerized deployment (consistent environments)
- Simplified stack (easier maintenance)

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Use proper SSL certificates
3. Configure reverse proxy (nginx/traefik)
4. Set up database backups
5. Monitor with logging solutions
6. Scale services as needed

The application is now fully containerized and ready for deployment in any Docker-compatible environment.