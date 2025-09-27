# USOF Backend - Setup Instructions

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- **Node.js** (version 16.x or higher)
- **npm** (comes with Node.js)
- **MySQL** (version 8.0 or higher)
- **Git** (for cloning the repository)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd usof-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

#### Copy Environment File
```bash
cp .env.example .env
```

#### Configure Environment Variables

Open the `.env` file and configure the following variables:

```env
# App Configuration
APP_PORT=3000
APP_URL=http://localhost:3000
NODE_ENV=development

# Admin Panel Credentials
ADMIN_EMAIL=admin
ADMIN_PASSWORD=admin
ADMIN_COOKIE_SECRET=supersecret

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Session Configuration
SESSION_SECRET=your_session_secret_here

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=blog_app
MYSQL_USER=blog_user
MYSQL_PASSWORD=blog_pass
MYSQL_ROOT_PASSWORD=root_pass

# Database Connection Settings
DB_CONNECTION_LIMIT=0
DB_WAIT_FOR_CONNECTIONS=true
```

**Important Security Notes:**
- Change `JWT_SECRET` to a strong, unique secret key
- Change `SESSION_SECRET` to a strong, unique secret key
- Update `ADMIN_PASSWORD` to a secure password
- For production, set `NODE_ENV=production`

### 4. Database Setup

#### Option A: Using Docker (Recommended)

If you have Docker installed, you can use the provided docker-compose file:

```bash
docker-compose up -d mysql
```

This will create a MySQL container with the database and user configured according to your `.env` file.

#### Option B: Manual MySQL Setup

1. **Start MySQL service**
2. **Create database and user:**

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE blog_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'blog_pass';
GRANT ALL PRIVILEGES ON blog_app.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

## Running the Application

### Development Mode

```bash
npm start
```

Or:

```bash
node src/server.js
```

The server will start on `http://localhost:3000`

### Production Mode

For production deployment:

1. Set environment to production:
```env
NODE_ENV=production
```

2. Start with process manager (PM2 recommended):
```bash
npm install -g pm2
pm2 start src/server.js --name "usof-backend"
```

## Verification

### 1. Check Server Status

Visit `http://localhost:3000` - you should see a welcome message or API documentation.

### 2. Access Admin Panel

Visit `http://localhost:3000/admin` and login with:
- Email: `admin` (or the value you set in `ADMIN_EMAIL`)
- Password: `admin` (or the value you set in `ADMIN_PASSWORD`)

### 3. Test API Endpoints

Test basic functionality:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Get all posts
curl http://localhost:3000/api/posts
```

## Common Issues and Solutions

### Database Connection Issues

**Error**: `ER_ACCESS_DENIED_FOR_USER`
- **Solution**: Verify MySQL credentials in `.env` file
- **Check**: Ensure MySQL user has proper permissions

**Error**: `ECONNREFUSED`
- **Solution**: Ensure MySQL service is running
- **Check**: Verify `MYSQL_HOST` and `MYSQL_PORT` in `.env`

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`
- **Solution**: Change `APP_PORT` in `.env` file to a different port
- **Alternative**: Kill the process using port 3000:
  ```bash
  # On Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # On macOS/Linux
  lsof -ti:3000 | xargs kill
  ```

### File Upload Issues

**Error**: File upload permissions
- **Solution**: Ensure upload directories exist and have proper permissions:
  ```bash
  chmod 755 uploads
  chmod 755 uploads/avatars
  ```

### Session Issues

**Error**: Session not persisting
- **Solution**: Verify `SESSION_SECRET` is set in `.env`
- **Check**: Ensure cookies are enabled in your client

## Development Tools

### Database Management

- **AdminJS**: Available at `http://localhost:3000/admin`
- **MySQL Workbench**: For direct database access
- **phpMyAdmin**: Alternative web-based MySQL management

### API Testing

- **Postman**: Import the provided collection for easy API testing
- **curl**: Command-line testing as shown in examples above
- **Insomnia**: Alternative to Postman

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `APP_PORT` | Server port | 3000 | No |
| `APP_URL` | Application URL | http://localhost:3000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `ADMIN_EMAIL` | Admin panel login | admin | Yes |
| `ADMIN_PASSWORD` | Admin panel password | admin | Yes |
| `ADMIN_COOKIE_SECRET` | Admin session secret | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `SESSION_SECRET` | Session signing secret | - | Yes |
| `MYSQL_HOST` | MySQL host | localhost | Yes |
| `MYSQL_PORT` | MySQL port | 3306 | Yes |
| `MYSQL_DATABASE` | Database name | - | Yes |
| `MYSQL_USER` | Database user | - | Yes |
| `MYSQL_PASSWORD` | Database password | - | Yes |

## Next Steps

After successful setup:

1. **Explore the Admin Panel** - Manage users, view data
2. **Test API Endpoints** - Use Postman collection or curl commands
3. **Review Documentation** - Check API documentation for detailed endpoint information
4. **Customize Configuration** - Adjust settings based on your needs
5. **Deploy to Production** - Follow production deployment guidelines
