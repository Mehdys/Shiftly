# 📥 How to Download and Set Up This Project

This guide explains **exactly** how to download all the files and get started.

---

## Method 1: Direct Download from Claude (Recommended)

### Step 1: Download Each File

I've created 3 main documents for you. Here's how to save them:

#### **File 1: README.md** (Main Documentation)
1. Click on the README artifact above
2. Copy all the text (Ctrl+A, then Ctrl+C)
3. Create a new file on your computer called `README.md`
4. Paste the content and save

#### **File 2: INFRASTRUCTURE.md** (Infrastructure Guide)
1. Click on the "Infrastructure & Testing Guide" artifact
2. Copy all the text
3. Create a new file called `INFRASTRUCTURE.md`
4. Paste and save

#### **File 3: oncall-scheduler-app.tsx** (React App Code)
1. Click on the "Hospital On-Call Scheduler" artifact
2. Copy all the code
3. Create a file called `App.tsx`
4. Paste and save

---

## Method 2: Create Full Project Structure

Follow these commands **exactly** to create the complete project:

### Step 1: Create Base Directories

```bash
# Create project root
mkdir oncall-scheduler
cd oncall-scheduler

# Create main structure
mkdir -p apps/api/src/{routes,socket,middleware,services,utils}
mkdir -p apps/api/prisma/migrations
mkdir -p apps/api/tests/{unit,integration,e2e}
mkdir -p apps/web/src/{components/ui,pages,hooks,lib,stores,types}
mkdir -p apps/web/public/icons
mkdir -p apps/web/tests
mkdir -p packages/types
mkdir -p docs
mkdir -p tests
mkdir -p .github/workflows

# Verify structure created
tree -L 3  # Or 'ls -R' on Windows
```

**Expected Output:**
```
oncall-scheduler/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── prisma/
│   │   └── tests/
│   └── web/
│       ├── src/
│       ├── public/
│       └── tests/
├── packages/
├── docs/
├── tests/
└── .github/
```

---

### Step 2: Create Root Configuration Files

Create each file below:

#### **package.json** (root)
```bash
cat > package.json << 'EOF'
{
  "name": "oncall-scheduler",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "cd apps/api && npm run dev",
    "dev:web": "cd apps/web && npm run dev",
    "build": "npm run build:api && npm run build:web",
    "build:api": "cd apps/api && npm run build",
    "build:web": "cd apps/web && npm run build",
    "test": "npm run test:api && npm run test:web",
    "test:api": "cd apps/api && npm test",
    "test:web": "cd apps/web && npm test",
    "test:load": "k6 run tests/k6-test.js --vus 100 --duration 1m",
    "test:stress": "k6 run tests/k6-test.js --vus 1000 --duration 10m",
    "deploy:all": "npm run deploy:api && npm run deploy:web",
    "deploy:api": "cd apps/api && railway up",
    "deploy:web": "cd apps/web && vercel --prod"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF
```

#### **docker-compose.yml**
```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: oncall-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: oncall_scheduler
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: oncall-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
EOF
```

#### **.gitignore**
```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.production
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Logs
logs/
*.log

# Prisma
apps/api/prisma/migrations/**/migration.sql

# Vercel
.vercel/

# Railway
.railway/
EOF
```

---

### Step 3: Create Backend Files

#### **apps/api/package.json**
```bash
cat > apps/api/package.json << 'EOF'
{
  "name": "oncall-api",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "express": "^4.18.2",
    "socket.io": "^4.6.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "redis": "^4.6.11",
    "@socket.io/redis-adapter": "^8.2.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "prisma": "^5.7.0",
    "vitest": "^1.0.4"
  }
}
EOF
```

#### **apps/api/tsconfig.json**
```bash
cat > apps/api/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

#### **apps/api/.env.example**
```bash
cat > apps/api/.env.example << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oncall_scheduler"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:5173"

# Monitoring (Optional)
SENTRY_DSN=""
EOF
```

#### **apps/api/prisma/schema.prisma**
```bash
cat > apps/api/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Service {
  id                  String    @id @default(uuid())
  name                String
  startDate           DateTime
  endDate             DateTime
  joinCode            String    @unique
  createdBy           String
  locked              Boolean   @default(false)
  scheduleGeneratedAt DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  interns      Intern[]
  groups       Group[]
  assignments  Assignment[]
}

model Intern {
  id          String   @id @default(uuid())
  serviceId   String
  name        String
  groupId     String?
  phoneNumber String?
  joinedAt    DateTime @default(now())

  service       Service        @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  group         Group?         @relation(fields: [groupId], references: [id], onDelete: SetNull)
  joinRequests  JoinRequest[]
  notifications Notification[]

  @@index([serviceId])
  @@index([groupId])
}

model Group {
  id        String   @id @default(uuid())
  serviceId String
  name      String
  emoji     String?
  createdBy String
  isOpen    Boolean  @default(true)
  maxSize   Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  service      Service       @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  interns      Intern[]
  assignments  Assignment[]
  joinRequests JoinRequest[]

  @@index([serviceId])
}

model JoinRequest {
  id          String    @id @default(uuid())
  groupId     String
  internId    String
  status      String    @default("pending")
  requestedAt DateTime  @default(now())
  respondedAt DateTime?
  respondedBy String?

  group  Group  @relation(fields: [groupId], references: [id], onDelete: Cascade)
  intern Intern @relation(fields: [internId], references: [id], onDelete: Cascade)

  @@unique([groupId, internId])
  @@index([groupId, status])
}

model Assignment {
  id        String   @id @default(uuid())
  serviceId String
  groupId   String
  date      DateTime
  createdAt DateTime @default(now())

  service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  group   Group   @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([serviceId, date])
  @@index([serviceId])
}

model Notification {
  id          String   @id @default(uuid())
  recipientId String
  type        String
  groupId     String?
  senderId    String?
  message     String
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  expiresAt   DateTime

  recipient Intern @relation(fields: [recipientId], references: [id], onDelete: Cascade)

  @@index([recipientId, read])
}
EOF
```

---

### Step 4: Create Frontend Files

#### **apps/web/package.json**
```bash
cat > apps/web/package.json << 'EOF'
{
  "name": "oncall-web",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.6.0",
    "@tanstack/react-query": "^5.14.2",
    "zustand": "^4.4.7",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "vitest": "^1.0.4",
    "vite-plugin-pwa": "^0.17.4"
  }
}
EOF
```

#### **apps/web/vite.config.ts**
```bash
cat > apps/web/vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'On-Call Scheduler',
        short_name: 'Gardes',
        description: 'Fair scheduling for hospital interns',
        theme_color: '#4F46E5',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  }
});
EOF
```

#### **apps/web/tailwind.config.js**
```bash
cat > apps/web/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
```

#### **apps/web/.env.example**
```bash
cat > apps/web/.env.example << 'EOF'
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=
VITE_POSTHOG_KEY=
EOF
```

#### **apps/web/index.html**
```bash
cat > apps/web/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Fair scheduling for hospital interns" />
    <meta name="theme-color" content="#4F46E5" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <title>On-Call Scheduler</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
```

---

### Step 5: Create Documentation Files

#### **docs/API.md**
```bash
cat > docs/API.md << 'EOF'
# API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-api.railway.app`

## Endpoints

### Services

#### POST /api/services
Create a new service.

**Request:**
```json
{
  "name": "Cardiology Feb-Apr 2024",
  "startDate": "2024-02-01",
  "endDate": "2024-04-30",
  "createdBy": "user-id"
}
```

**Response:**
```json
{
  "id": "uuid",
  "joinCode": "ABC123",
  ...
}
```

### Groups

#### POST /api/groups
Create a new group.

### Schedule

#### POST /api/services/:id/generate-schedule
Generate fair schedule using round-robin algorithm.

---

See INFRASTRUCTURE.md for complete API reference.
EOF
```

#### **docs/CONTRIBUTING.md**
```bash
cat > docs/CONTRIBUTING.md << 'EOF'
# Contributing to On-Call Scheduler

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Start development: `npm run dev`

## Commit Convention

We use Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `chore:` Maintenance

## Pull Request Process

1. Create feature branch
2. Make changes
3. Run tests: `npm test`
4. Push and create PR
5. Wait for review

Thank you for contributing! 🎉
EOF
```

---

### Step 6: Copy README and INFRASTRUCTURE Files

```bash
# Now paste the README.md you copied from Claude
# Create the file and paste:
nano README.md  # Or use any text editor
# Paste content, save (Ctrl+X, Y, Enter in nano)

# Same for INFRASTRUCTURE.md
nano INFRASTRUCTURE.md
# Paste content from "Infrastructure & Testing Guide" artifact
```

---

### Step 7: Initialize Git

```bash
git init
git add .
git commit -m "Initial commit: Hospital On-Call Scheduler"
```

---

### Step 8: Verify Everything

```bash
# Check all files created
find . -type f -name "*.json" -o -name "*.md" -o -name "*.prisma"

# Expected output should show all files we created
```

---

## Method 3: Use GitHub Template (Coming Soon)

Once you push to GitHub, others can use it as a template:

```bash
# Push to GitHub
git remote add origin https://github.com/yourusername/oncall-scheduler.git
git push -u origin main

# Others can then clone
git clone https://github.com/yourusername/oncall-scheduler.git
```

---

## Next Steps After Download

Once you have all files:

1. **Follow README.md** - Read the complete documentation
2. **Follow Deterministic Next Steps** - Steps 1-12 in README.md
3. **Read INFRASTRUCTURE.md** - For deployment and scaling
4. **Start coding!** - Begin with Quick Start section

---

## Troubleshooting

**Problem: Files not creating**
```bash
# Check permissions
ls -la

# Try with sudo (Linux/Mac)
sudo mkdir -p apps/api
```

**Problem: Can't paste into terminal**
- Windows: Right-click to paste
- Mac: Cmd+V
- Linux: Ctrl+Shift+V

**Problem: Missing dependencies**
```bash
# Install Node.js first
node --version  # Should show v20+
# If not, download from nodejs.org
```

---

## Quick Copy-Paste Package

For fastest setup, run this **one command**:

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/oncall-scheduler/main/scripts/setup.sh | bash
```

(Note: Create this script later and push to GitHub)

---

**You now have everything you need!** 🎉

Start with **README.md → Quick Start** section.