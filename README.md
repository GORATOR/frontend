# GORATOR Frontend

**GORATOR** is a self-hosted platform for tracking errors and exceptions in your applications. 
A Sentry alternative that you deploy on your own server and fully control.

![demo](https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/demo.gif)

## Why GORATOR?

- Self-hosted — full control over your data
- Sentry-compatible SDKs without the operational overhead
- Automatic error grouping by stacktrace
- Simple REST API for analysis
- No need to dig through logs


<p align="center">
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/1_issues_filter.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_1_issues_filter.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/2_filtered_issues.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_2_filtered_issues.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/3_dsn_copy.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_3_dsn_copy.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/4_user_profile.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_4_user_profile.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/5_rbac_admin.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_5_rbac_admin.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/6_team_page.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_6_team_page.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/7_issue_details_1.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_7_issue_details_1.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/8_issue_details_2.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_8_issue_details_2.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/9_issue_details_3.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_9_issue_details_3.png" />
  </a>
  <a href="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/10_issue_details_4.png">
    <img src="https://raw.githubusercontent.com/GORATOR/static_files/refs/heads/main/thumb_10_issue_details_4.png" />
  </a>
</p>

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

Follow to [GORATOR Backend](https://github.com/GORATOR/backend#quick-start) for quick start

## Build

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
