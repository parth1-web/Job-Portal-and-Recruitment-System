# Job Portal Recruitment System

A full-stack job recruitment platform for candidates, employers, and administrators. The project includes a React and TypeScript web application for the user experience and a .NET 8 Web API organized with Domain, Application, Infrastructure, and API layers.

## Features

### Candidates

- Browse and search available jobs
- View job details, companies, skills, and locations
- Save jobs for later
- Apply to jobs with a cover letter and resume information
- Track application status and history
- Manage candidate profile, skills, education, and experience
- View scheduled interviews
- Receive application and interview notifications

### Employers

- Manage employer and company profiles
- Create, edit, publish, close, and delete job postings
- Review candidate applications
- Update application statuses
- Schedule and manage interviews
- Track employer notifications

### Platform

- Candidate, employer, and administrator roles
- JWT authentication support in the .NET API
- Swagger/OpenAPI documentation in development
- PostgreSQL persistence through Entity Framework Core
- Database migrations and seeded skills
- Responsive React interface with Tailwind CSS

## Technology Stack

### Frontend and demo server

- React 18
- TypeScript
- Vite
- Express
- Tailwind CSS 4
- Lucide React
- Motion
- `tsx`

### Backend

- .NET 8 / ASP.NET Core Web API
- Entity Framework Core 8
- PostgreSQL with Npgsql
- JWT Bearer authentication
- Swagger / Swashbuckle
- Clean Architecture-style project separation

## Project Structure

```text
JobPortal/
├── src/                         # React frontend
│   ├── components/              # Shared UI components
│   ├── context/                 # React context providers
│   ├── services/                # Frontend service helpers
│   ├── views/                   # Application screens
│   ├── App.tsx
│   └── index.css
├── server.ts                    # Express + Vite development server and demo API
├── JobPortal.Domain/            # Domain entities, enums, and exceptions
├── JobPortal.Application/       # DTOs, interfaces, validators, and services
├── JobPortal.Infrastructure/    # EF Core, PostgreSQL, repositories, migrations
├── JobPortal.API/               # ASP.NET Core controllers and API startup
├── JobPortal.Tests/              # Test project
├── .vscode/tasks.json           # VS Code development tasks
├── package.json                 # Frontend scripts and dependencies
└── JobPortal.slnx               # .NET solution
```

## Prerequisites

Install the following before running the project:

- Node.js 20 or newer
- npm
- .NET SDK 8.0
- PostgreSQL 14 or newer for the .NET API
- Git

## Quick Start: Frontend Demo

The fastest way to view the working interface is to run the React and Express application. Its demo API uses seeded in-memory data, so PostgreSQL is not required for this mode.

```powershell
# Clone the repository
git clone https://github.com/<your-username>/<your-repository>.git
cd JobPortal

# Install frontend dependencies
npm install

# Start the React frontend and Express demo API
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The development server includes the frontend and demo `/api` routes in `server.ts`. Data written through these demo routes is stored in memory and is reset when the server restarts.

## Run the .NET API

1. Create a PostgreSQL database named `JobPortalDb`.
2. Set the connection string in `JobPortal.API/appsettings.Development.json` or with user secrets/environment variables.
3. Replace the development JWT key with a long, random value.
4. Apply the existing migrations.
5. Start the API.

Example connection string:

```text
Host=localhost;Port=5432;Database=JobPortalDb;Username=postgres;Password=your_password;
```

From the repository root:

```powershell
dotnet restore
dotnet build JobPortal.slnx

dotnet ef database update `
  --project JobPortal.Infrastructure/JobPortal.Infrastructure.csproj `
  --startup-project JobPortal.API/JobPortal.API.csproj

dotnet run --project JobPortal.API/JobPortal.API.csproj
```

The API runs at [http://localhost:5280](http://localhost:5280). Development Swagger is available at [http://localhost:5280/swagger](http://localhost:5280/swagger).

If Entity Framework CLI is not installed, install it once with:

```powershell
dotnet tool install --global dotnet-ef
```

## Configuration and Security

The checked-in development settings contain placeholder database credentials and a development JWT key. Before deploying or sharing a production environment:

- Do not commit real passwords, JWT keys, or other secrets.
- Store secrets with ASP.NET Core User Secrets, environment variables, or a secrets manager.
- Use a strong unique JWT signing key.
- Restrict CORS origins to trusted frontend URLs.
- Use HTTPS in production.

Example User Secrets commands:

```powershell
dotnet user-secrets init --project JobPortal.API/JobPortal.API.csproj
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=JobPortalDb;Username=postgres;Password=your_password" --project JobPortal.API/JobPortal.API.csproj
dotnet user-secrets set "Jwt:Key" "replace-with-a-long-random-secret" --project JobPortal.API/JobPortal.API.csproj
```

## Development Tasks

The repository includes VS Code tasks for the two application parts:

- **Run .NET Backend**: starts the API on port `5280`
- **Run React Frontend**: starts the frontend on port `3000`
- **Run Complete Fullstack App**: starts both tasks

The frontend task detects an existing process on port `3000` and avoids starting a duplicate server.

## Useful Commands

```powershell
# Frontend type check
npm run lint

# Frontend production build
npm run build

# Start the built Node server
npm start

# Restore and build all .NET projects
dotnet restore
dotnet build JobPortal.slnx

# Run .NET tests
dotnet test JobPortal.Tests/JobPortal.Tests.csproj
```

## API Areas

The .NET API contains controllers for:

- Authentication
- Candidates and employers
- Companies
- Jobs and employer job management
- Job applications
- Interviews
- Notifications
- Resumes
- Saved jobs
- Skills

Use Swagger during development to inspect available endpoints and authorize requests with a JWT bearer token.

## Testing

Run the test project with:

```powershell
dotnet test JobPortal.Tests/JobPortal.Tests.csproj
```

Run the frontend TypeScript check with:

```powershell
npm run lint
```

## Production Build

Build the frontend and bundled Express server with:

```powershell
npm run build
npm start
```

The production server expects the frontend build output in `dist/` and listens on port `3000`.

## License

This project does not currently include a license. Add a license file before distributing it publicly if you want to define reuse and contribution terms.
