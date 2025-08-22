import { WORK_DIR } from "../constant";
import { FileMap } from "./files";

export const mockFiles: FileMap = {
  // 根目录文件
  [`${WORK_DIR}/index.js`]: {
    type: 'file',
    isBinary: false,
    content: `import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});`
  },
  [`${WORK_DIR}/package.json`]: {
    type: 'file',
    isBinary: false,
    content: `{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon --watch './' index.js"
  }
}`
  },
  [`${WORK_DIR}/README.md`]: {
    type: 'file',
    isBinary: false,
    content: `# Example App

This is a simple Express.js application.

## Getting Started

Run \`npm start\` to start the development server.`
  },
  [`${WORK_DIR}/.env`]: {
    type: 'file',
    isBinary: false,
    content: `NODE_ENV=development
PORT=3111
DATABASE_URL=sqlite:///db.sqlite`
  },
  [`${WORK_DIR}/.gitignore`]: {
    type: 'file',
    isBinary: false,
    content: `node_modules/
.env.local
.env.production
*.log
dist/
build/`
  },

  // src 文件夹
  [`${WORK_DIR}/src`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/src/app.js`]: {
    type: 'file',
    isBinary: false,
    content: `import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

export default app;`
  },
  [`${WORK_DIR}/src/utils.js`]: {
    type: 'file',
    isBinary: false,
    content: `export function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}`
  },

  // routes 文件夹
  [`${WORK_DIR}/src/routes`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/src/routes/index.js`]: {
    type: 'file',
    isBinary: false,
    content: `import { Router } from 'express';
import { userRouter } from './users.js';
import { postRouter } from './posts.js';

export const router = Router();

router.use('/users', userRouter);
router.use('/posts', postRouter);`
  },
  [`${WORK_DIR}/src/routes/users.js`]: {
    type: 'file',
    isBinary: false,
    content: `import { Router } from 'express';

export const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.json({ users: [] });
});

userRouter.post('/', (req, res) => {
  res.status(201).json({ message: 'User created' });
});`
  },
  [`${WORK_DIR}/src/routes/posts.js`]: {
    type: 'file',
    isBinary: false,
    content: `import { Router } from 'express';

export const postRouter = Router();

postRouter.get('/', (req, res) => {
  res.json({ posts: [] });
});`
  },

  // public 文件夹
  [`${WORK_DIR}/public`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/public/index.html`]: {
    type: 'file',
    isBinary: false,
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example App</title>
</head>
<body>
    <h1>Welcome to Example App</h1>
    <p>This is a simple static page.</p>
</body>
</html>`
  },
  [`${WORK_DIR}/public/style.css`]: {
    type: 'file',
    isBinary: false,
    content: `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}`
  },

  // assets 文件夹（包含二进制文件）
  [`${WORK_DIR}/assets`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/assets/images`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/assets/images/logo.png`]: {
    type: 'file',
    isBinary: true,
    content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  },
  [`${WORK_DIR}/assets/images/favicon.ico`]: {
    type: 'file',
    isBinary: true,
    content: 'AAABAAEAEBAAAAAAAABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAA'
  },
  [`${WORK_DIR}/assets/fonts`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/assets/fonts/Roboto-Regular.ttf`]: {
    type: 'file',
    isBinary: true,
    content: 'AAEAAAANAIAAAwBQRkZUTWkGDUgAAAEsAAAAHGNtYXAAYN3jAAABSAAAADRnYXNwAAAAEAAAAXwA'
  },

  // tests 文件夹
  [`${WORK_DIR}/tests`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/tests/app.test.js`]: {
    type: 'file',
    isBinary: false,
    content: `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('App', () => {
  it('should respond with 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
  });
});`
  },

  // config 文件夹
  [`${WORK_DIR}/config`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/config/database.js`]: {
    type: 'file',
    isBinary: false,
    content: `export const dbConfig = {
  development: {
    type: 'sqlite',
    database: './dev.db'
  },
  production: {
    type: 'postgresql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  }
};`
  },
  [`${WORK_DIR}/config/eslint.config.js`]: {
    type: 'file',
    isBinary: false,
    content: `export default {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off'
  }
};`
  },

  // docs 文件夹
  [`${WORK_DIR}/docs`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/docs/API.md`]: {
    type: 'file',
    isBinary: false,
    content: `# API Documentation

## Endpoints

### Users
- GET /api/users - Get all users
- POST /api/users - Create a new user

### Posts  
- GET /api/posts - Get all posts`
  },
  [`${WORK_DIR}/docs/CHANGELOG.md`]: {
    type: 'file',
    isBinary: false,
    content: `# Changelog

## v1.0.0
- Initial release
- Basic Express.js setup
- User and post routes`
  },

  // 临时文件和日志
  [`${WORK_DIR}/tmp`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/tmp/cache.json`]: {
    type: 'file',
    isBinary: false,
    content: `{
  "lastUpdate": "2024-01-01T00:00:00Z",
  "data": {}
}`
  },
  [`${WORK_DIR}/logs`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/logs/app.log`]: {
    type: 'file',
    isBinary: false,
    content: `2024-01-01 10:00:00 [INFO] Application started
2024-01-01 10:01:00 [INFO] Server listening on port 3111
2024-01-01 10:02:00 [DEBUG] Database connected`
  },

  // 多媒体文件
  [`${WORK_DIR}/media`]: {
    type: 'folder'
  },
  [`${WORK_DIR}/media/video.mp4`]: {
    type: 'file',
    isBinary: true,
    content: 'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAaobW9vdgAAAGxtdmhkAAAAAA'
  },
  [`${WORK_DIR}/media/audio.mp3`]: {
    type: 'file',
    isBinary: true,
    content: 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAA'
  },
  [`${WORK_DIR}/media/document.pdf`]: {
    type: 'file',
    isBinary: true,
    content: 'JVBERi0xLjQKMSAwIG9iaiA8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCg'
  }
}
