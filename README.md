# Campus Helpdesk & Maintenance Tickets — Frontend

React + Vite frontend implementing the full P5 Campus Helpdesk UI/UX spec:
16 screens across 5 roles (Reporter, Agent, Technician, Manager, Auditor),
using the brand identity (logo + colors `#704847` / `#EAE2DC`).

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173. The app runs fully standalone using mock data
(no backend required) — log in with any of these demo accounts:

| Role       | Email               | Password |
|------------|----------------------|----------|
| Reporter   |  reporter@uni.edu    | 123456   |
| Agent      | agent@uni.edu        | 123456   |
| Technician | tech@uni.edu         | 123456   |
| Manager    | manager@uni.edu      | 123456   |
| Auditor    | auditor@uni.edu      | 123456   |

## Project structure

```
src/
  api/            <- ALL backend communication lives here (one file per domain)
    client.js     <- fetch wrapper, base URL, auth token handling
    auth.js       <- login / register / logout
    tickets.js    <- CRUD + triage + work log + KPIs
    users.js      <- pending accounts, technician workload, assignment
    config.js     <- categories / teams / SLA / business hours (admin config)
    audit.js      <- audit log (Auditor role)
    notifications.js
  mock/           <- seed data used while VITE_USE_MOCKS=true
  context/
    AuthContext.jsx  <- current user + role, login/logout state
  components/     <- Logo, Sidebar, Topbar, Tag, Kpi, Card, ProtectedRoute…
  layouts/
    AppLayout.jsx <- sidebar + topbar shell used by all role dashboards
  pages/
    auth/         <- Login, Register, PendingApproval
    reporter/      <- Dashboard, CreateTicket
    shared/        <- TicketDetails (all roles), Notifications
    agent/         <- Dashboard, Triage (with AI suggestion panel)
    technician/    <- Dashboard, TicketWork
    manager/       <- Dashboard, AccountRequests, Workload, Configuration
    auditor/       <- RecentChanges
```

## Connecting your backend + database

The frontend never talks to a database directly — it only calls the
functions in `src/api/*.js`, which currently read/write `src/mock/*.js`.
To connect a real backend:

1. Copy `.env.example` to `.env` and set:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_USE_MOCKS=false
   ```
2. Implement the REST endpoints referenced in each `src/api/*.js` file —
   every function has a comment documenting its expected endpoint and
   payload shape, e.g.:
   ```js
   /** POST /tickets { title, description, category, location, asset, urgency } -> Ticket */
   ```
3. Your backend should return JSON, and `POST /auth/login` should return
   `{ token, user }`. The token is stored and automatically attached as
   `Authorization: Bearer <token>` on every subsequent request
   (see `src/api/client.js`).
4. That's it — no other file needs to change. Every page already calls
   the `api/*` functions, so switching `VITE_USE_MOCKS` to `false` points
   the whole app at your real backend/database.

### Suggested database entities (matches the mock data shape)
- **users**: id, name, email, password_hash, role, status
- **tickets**: id, title, description, category, location, priority,
  status, reporter_id, team, technician_id, created_at
- **ticket_timeline**: ticket_id, label, at
- **ticket_comments**: ticket_id, author, text, is_internal
- **categories**: id, name, team, active
- **audit_log**: id, user, action, entity, at
- **notifications**: id, user_id, text, read, created_at

### What the frontend tolerates from the backend
- Lists can come back as a plain array, `{ data: [...] }`, or `{ data: { items: [...] } }`.
- Tickets: `id` or `ticket_id`, `category` or `category_name`, `reference_number`, statuses like
  `OPEN / IN_PROGRESS / PENDING / RESOLVED / CLOSED` (mapped to open / progress / pending / done).
- Users: `id` or `user_id`, `name` or `full_name`; `role` in any letter case.
- `POST /auth/login` may return `{ token, user }` or `{ data: { token, user } }`.
- Any `401` response clears the session and sends the user back to the login page.
- Endpoints the UI calls that you must implement: `DELETE /users/:id` (Manager -> User management).

### Mock mode notes
- Registered users live in memory only (no localStorage) and reset on page refresh.
- Only the login session (token + current user) is kept in localStorage.

### Docker
```bash
docker build -t campus-helpdesk-frontend \
  --build-arg VITE_API_BASE_URL=https://your-backend/api \
  --build-arg VITE_USE_MOCKS=false .
docker run -p 8080:80 campus-helpdesk-frontend
```

## Build for production

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## Design system

Colors, logo, and the original static UI/UX mockups (all 16 screens) are
also available as a standalone reference — ask if you'd like that file
again.
