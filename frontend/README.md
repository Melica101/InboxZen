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
