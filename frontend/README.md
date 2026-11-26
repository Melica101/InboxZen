# InboxZen — Hackathon MVP

## Context

Managers receive a high volume of email every day and risk missing critical messages and important deadlines.

## The challenge

- Build an intelligent personal assistant that sorts email, drafts calendar appointments, and reminds users about deadlines.
- Give users clear, configurable controls over what the agent can do and which actions require approval.

## Decision drivers

- **Priority management** — Prioritize emails from key clients and the CEO, and summarize newsletters at the end of the day.
- **Calendar automation** — Automatically draft invitations for meeting requests received by email.
- **Deadline monitoring** — Send automatic reminders and alert users to missing replies.
- **Task extraction** — Turn email threads into checklists of actionable next steps.

## Product features

| Feature | Description |
| --- | --- |
| **Daily Briefing** | Start here for a summary of the day's important emails, tasks, appointments, and critical issues. |
| **Smart Inbox** | Automatically sort email by category, urgency, and relevance. |
| **Priority Engine** | Prioritize messages based on VIPs, the CEO, strategic clients, deadlines, and impact. |
| **AI Email Summary** | Summarize individual emails and entire threads so users can grasp the essentials quickly. |
| **Task Extraction** | Turn emails into tasks with due dates, status, and clear calls to action. |
| **Meeting Assistant** | Detect meeting requests and draft calendar invitations. |
| **Follow-up Tracker** | Track missing replies and suggest follow-up messages. |
| **AI Reply Drafts** | Generate context-aware replies that users can personalize and edit. |
| **Autonomy Center** | Make autonomy levels transparent with configurable permissions and approvals. |
| **Activity & Alert Center** | Show a history of AI actions, notifications, deadlines, approvals, and reasons for decisions. |

## React interface

Run the React interface with `npm ci` and `npm run dev` from `frontend/react-app`, then open the URL printed by Vite. Use the language selector in the top bar to switch between English and Italiano. InboxZen saves your language choice in this browser.

To use the email analysis endpoint with the React interface, also run the Node server below on port 3000.

## Run locally
Requires Node.js 20.12+ (22 recommended). No dependencies or npm install required.

```sh
npm start
```
Open http://localhost:3000. For development use `npm run dev`.

## Optional live AI
Copy `.env.example` to `.env`, set `OPENAI_API_KEY` and optionally the model, then restart. Click Analyze emails. The Node server calls OpenAI with synthetic emails, one workspace per request, and displays extracted commitments and risks separately. API usage may incur charges. Do not place real confidential content in this demo. The deterministic risk storyline is independent of live model output.

## Demo flow
1. Daily briefing: inspect the Acme opportunity.
2. Risk radar: see three source emails and the dependency chain.
3. Approve escalation, then simulate IT response.
4. Calendar: resolve the work/personal conflict without revealing the private appointment.
5. Privacy center: disable analysis or change approval mode. Reset demo to restart.

## Architecture

InboxZen includes a React interface and a vanilla HTML/CSS/JS interface served by a dependency-free Node HTTP server. The demo uses synthetic email data and stores demo state in browser localStorage. Optional server-side AI analysis processes each workspace in a separate request. The API key stays on the server, which binds to loopback.

## Backend

The backend lives in `/backend`. It is a small REST API: the React app asks it for emails, tasks, risks and calendar events, and it asks an AI model to make sense of the mail. To run it: `cd backend && mvn spring-boot:run`, then open `http://localhost:8080/swagger-ui.html` to see and try every endpoint.

### How it works

When you log in, the backend gives you a token. Every following request carries that token, so the server always knows whose mailbox it is looking at. Each user has their own emails, tasks, risks, calendar and settings, split into two spaces: work and personal.

When you press "Analyze", the backend takes the latest emails of one space (never both at once), sends them to the AI model and asks for a structured answer: which emails are urgent, which commitments you have taken, and which risks are building up (for example a late delivery that blocks a client deal). The result is saved, so the briefing, the risk radar and the task list simply read from the database and are instant.

The AI never acts on its own. It can only prepare drafts, such as an escalation email or a proposal to reschedule a meeting. You decide whether to approve or reject each one, and how much freedom the agent gets is a setting you control. Nothing is ever sent automatically.

### Why these technologies

- **Java 21 + Spring Boot.** A mature, boring and well-documented stack. Authentication, validation, database access and error handling come ready-made, so we write business logic instead of plumbing. It is also what most companies run in production, so the code is easy to hand over.
- **H2 database, stored in a file.** Zero setup: clone, run, and the data is there. Perfect for a demo and for development. The data layer is standard JPA, so moving to PostgreSQL later only means changing the connection string (and adding database migrations).
- **JWT tokens (stateless login).** The server does not keep sessions in memory, so it is simple to restart or run more than one copy. The React app just attaches the token to each request.
- **Gemini as the AI model.** Fast and cheap enough to analyze a whole inbox on demand. We talk to it through the OpenAI-compatible API, so switching to another provider is a change of three settings (key, model, URL), not a rewrite.
- **Strict handling of AI output.** Emails are untrusted text and can contain instructions aimed at the AI ("ignore your rules and..."). So the email text is sent only as data, the model must answer in JSON, and the backend checks every field. A task or a risk that does not point to a real source email is thrown away. This keeps the AI from inventing facts and limits what a malicious email can do.
- **Drafts only, with human approval.** Managers need to trust the tool. An assistant that can be wrong but cannot send anything is safe to try, and the activity log shows what it did and why.
- **Swagger UI.** Generated automatically from the code, so the frontend developers always have up-to-date documentation and a way to test calls without writing any code.

### Demo mode

Without a Gemini key the app still works: analysis does nothing and drafts come from fixed templates. A demo user (`demo@inboxzen.test` / `test`) is created on first start, `scripts/load_emails.py` fills the mailbox with synthetic emails, and `POST /api/demo/reset` restores the starting data.

### Settings (environment variables)

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Enables real AI analysis. Never commit it. |
| `GEMINI_MODEL` | Which Gemini model to use. |
| `JWT_SECRET` | At least 32 characters. If empty a random one is used and everyone is logged out on restart. |
| `DB_URL` | Database location (default: local H2 file). |
| `CORS_ORIGINS` | Frontend addresses allowed to call the API. |
