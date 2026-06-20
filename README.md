# AppointmentRepo

React + Express appointment system for Quirofísicos Rocha.

## Local development

### Requirements

- Node.js 18+
- MySQL 8+
- npm

### 1. Clone and install

```bash
git clone https://github.com/ulisesd15/AppointmentRepo.git
cd AppointmentRepo
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Create a MySQL database

```sql
CREATE DATABASE appointment_repo_dev;
```

### 3. Configure backend environment

Create `backend/.env`:

```env
PORT=4000
NODE_ENV=development

DB_NAME=appointment_repo_dev
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

JWT_SECRET=change_this_to_a_long_random_secret
FRONTEND_URL=http://localhost:5173
```

### 4. Run migrations and seed admin

From `backend`:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Development admin login:

```txt
admin@quirofisicosrocha.com
Password123!
```

Change this password before production.

### 5. Start the backend

From `backend`:

```bash
npm run dev
```

Backend health check:

```txt
http://localhost:4000/api/health
```

### 6. Start the frontend

From `frontend` in a second terminal:

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Main routes

- `/` homepage with active announcements
- `/book` appointment booking
- `/login` login/register
- `/appointments` patient appointment portal
- `/admin` admin dashboard

## Current feature set

- JWT auth
- User registration/login/profile
- Guest and logged-in booking
- Available slot generation
- Appointment cancellation
- Admin stats
- Admin appointment status management
- Business hours editor
- Schedule exceptions
- Blocked slots
- User management
- Announcements

## Notes

This is still a development rebuild. Before production, run a full local QA pass, change seed credentials, verify migrations against the target database, and configure production secrets.
