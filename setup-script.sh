#!/bin/bash

# Hospital On-Call Scheduler - Automated Setup Script
# This script creates the complete project structure

set -e  # Exit on error

echo "🏥 Hospital On-Call Scheduler - Setup Script"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Warning: Node.js not found. Please install Node.js 20+ from nodejs.org${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}Warning: npm not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"
echo -e "${GREEN}✓ npm $(npm --version) found${NC}"
echo ""

# Create project directory
PROJECT_NAME=${1:-oncall-scheduler}
echo -e "${BLUE}Creating project: $PROJECT_NAME${NC}"

if [ -d "$PROJECT_NAME" ]; then
    echo -e "${YELLOW}Directory $PROJECT_NAME already exists. Remove it? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_NAME"
    else
        exit 1
    fi
fi

mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo -e "${GREEN}✓ Created project directory${NC}"

# Create directory structure
echo -e "${BLUE}Creating directory structure...${NC}"

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

echo -e "${GREEN}✓ Directory structure created${NC}"

# Create root package.json
echo -e "${BLUE}Creating root configuration...${NC}"

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
    "setup": "npm install && cd apps/api && npm install && cd ../web && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

# Create docker-compose.yml
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

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
build/
.env
.env.local
.env.production
*.log
.DS_Store
coverage/
.vercel/
.railway/
EOF

echo -e "${GREEN}✓ Root configuration created${NC}"

# Create backend files
echo -e "${BLUE}Creating backend configuration...${NC}"

cat > apps/api/package.json << 'EOF'
{
  "name": "oncall-api",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "express": "^4.18.2",
    "socket.io": "^4.6.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
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

cat > apps/api/.env.example << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oncall_scheduler"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
EOF

# Create Prisma schema
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

echo -e "${GREEN}✓ Backend configuration created${NC}"

# Create frontend files
echo -e "${BLUE}Creating frontend configuration...${NC}"

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
    "lucide-react": "^0.294.0"
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
    "vitest": "^1.0.4"
  }
}
EOF

cat > apps/web/vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
EOF

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

cat > apps/web/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat > apps/web/.env.example << 'EOF'
VITE_API_URL=http://localhost:3000
EOF

cat > apps/web/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>On-Call Scheduler</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > apps/web/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

echo -e "${GREEN}✓ Frontend configuration created${NC}"

# Create documentation
echo -e "${BLUE}Creating documentation...${NC}"

cat > README.md << 'EOF'
# 🏥 Hospital On-Call Scheduler

A mobile-first Progressive Web App for hospital interns to fairly schedule on-call duties.

## Quick Start

1. Start database:
   ```bash
   docker-compose up -d
   ```

2. Setup backend:
   ```bash
   cd apps/api
   npm install
   cp .env.example .env
   npx prisma migrate dev
   npm run dev
   ```

3. Setup frontend (new terminal):
   ```bash
   cd apps/web
   npm install
   cp .env.example .env
   npm run dev
   ```

4. Open http://localhost:5173

## Features

- ✅ Real-time group formation
- ✅ Fair round-robin scheduling
- ✅ Mobile-first design
- ✅ Progressive Web App
- ✅ WebSocket real-time updates

## Tech Stack

- React 18 + TypeScript
- Node.js + Express
- PostgreSQL + Prisma
- Socket.io
- TailwindCSS

## Documentation

- See `docs/` folder for detailed documentation
- API documentation: `docs/API.md`
- Deployment guide: `docs/DEPLOYMENT.md`

## License

MIT
EOF

cat > docs/QUICKSTART.md << 'EOF'
# Quick Start Guide

## Prerequisites

- Node.js 20+
- Docker (for local database)
- npm 9+

## Step-by-Step Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd oncall-scheduler
npm install
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Setup Environment

```bash
cd apps/api
cp .env.example .env
cd ../web
cp .env.example .env
```

### 4. Run Migrations

```bash
cd apps/api
npx prisma migrate dev
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

### 6. Open Application

Navigate to http://localhost:5173

## Next Steps

- Read the main README.md
- Check out INFRASTRUCTURE.md for deployment
- Explore the codebase in `apps/`

Happy coding! 🚀
EOF

echo -e "${GREEN}✓ Documentation created${NC}"

# Initialize git
echo -e "${BLUE}Initializing git repository...${NC}"
git init
git add .
git commit -m "Initial commit: Hospital On-Call Scheduler project structure"
echo -e "${GREEN}✓ Git repository initialized${NC}"

# Final message
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Copy the React app code from Claude into:"
echo "   apps/web/src/App.tsx"
echo ""
echo "2. Copy the backend server code from the infrastructure guide into:"
echo "   apps/api/src/server.ts"
echo ""
echo "3. Install dependencies:"
echo "   npm run setup"
echo ""
echo "4. Start Docker:"
echo "   docker-compose up -d"
echo ""
echo "5. Run migrations:"
echo "   cd apps/api && npx prisma migrate dev"
echo ""
echo "6. Start development servers:"
echo "   npm run dev"
echo ""
echo "7. Open http://localhost:5173"
echo ""
echo -e "${YELLOW}Pro tip: Read docs/QUICKSTART.md for detailed instructions${NC}"
echo ""
echo "Happy coding! 🏥✨"