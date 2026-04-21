# GORATOR Frontend

**GORATOR** is a self-hosted platform for tracking errors and exceptions in your applications. 
A Sentry alternative that you deploy on your own server and fully control.

## Why GORATOR?

Production errors are inevitable. The question is how quickly you learn about them and how convenient it is to analyze them.

GORATOR receives error events from your applications, groups them into issues by type and stacktrace, and provides a convenient web interface for analysis. 
Instead of digging through logs, you get a clear picture: what errors are occurring, how often, in what environment, and in what context.

## How it works

1. You connect an SDK to your application and specify the DSN of your GORATOR server
2. When an error occurs, the SDK sends an event (envelope) with exception details, stacktrace, environment, and request data
3. GORATOR groups events into issues and displays them in the web interface
4. You see all errors in one place, filter by project, and analyze the details of each event

## Tech stack

- **Vue 3** + TypeScript + Vite
- **Pinia** for state management
- **Vue Router** for navigation (SPA)
- **SCSS** for styling

## Quick start

### Requirements

- Docker

### Building the image

```bash
cp .env.example .env
# Set the backend URL in .env:
# VITE_BACKEND_URL=https://your-domain.com/api
docker build -t sh-frontend:latest .
```

The `VITE_BACKEND_URL` variable is the backend address that the frontend will connect to.

### Running for development

```bash
npm install
npm run dev
```

## Nginx configuration example

For SPA routing and proxying API requests to the backend:

```nginx
server {
    server_name your-domain.com;

    location / {
          proxy_pass http://localhost:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_intercept_errors on;
          error_page 404 = @spa_fallback;
    }

    location @spa_fallback {
          rewrite ^.*$ /index.html break;
          proxy_pass http://localhost:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ...ssl settings...
}
```

## Related repositories

- [GORATOR Backend](https://github.com/GORATOR/backend) — server side (Go, PostgreSQL)
