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

## MVP focus

| Area | Target | Current implementation |
| --- | --- | --- |
| Input | A simulated database of corporate email. | The demo uses synthetic email fixtures in source code and stores demo state in the browser. |
| AI engine | An LLM trained to classify text and generate replies. | The optional Node endpoint prompts a hosted LLM to summarize batches and extract commitments and risks. Dedicated classification, reply generation, and project-specific model training are absent. |
| Output | A Daily Briefing interface for quickly reviewing and acting on priorities. | The briefing shows a seeded risk, commitments, appointments, and proposed actions. |

## Product features and current status

| Feature | Intended behavior | Current implementation and gaps |
| --- | --- | --- |
| **Smart Inbox** | Automatically sort email by category, urgency, and relevance. | The inbox shows preassigned labels and filters by workspace. Automatic classification and sorting are missing. |
| **Priority Engine** | Prioritize messages based on VIPs, the CEO, strategic clients, deadlines, and impact. | Sample messages have preset priorities. Dynamic scoring and end-of-day newsletter summaries are missing. |
| **Daily Briefing** | Summarize the day's important emails, tasks, appointments, and critical issues. | The demo shows a preset scenario with a risk, tasks, appointments, and proposed actions. Automatic daily generation from incoming email is missing. |
| **AI Email Summary** | Summarize individual emails and entire threads so users can grasp the essentials quickly. | The optional Node endpoint returns a summary per analyzed workspace batch, which the vanilla interface displays. The React interface stores the results without displaying them. Individual email and thread summaries are missing. |
| **Task Extraction** | Turn emails into tasks with due dates, status, and clear calls to action. | The demo supports checking off seeded commitments. Live analysis can extract commitments with owners, deadlines, and source IDs. Turning those results into trackable checklist items is missing. |
| **Meeting Assistant** | Detect meeting requests and draft calendar invitations. | The demo simulates resolving a preset calendar conflict. Detecting meeting requests and generating invitation drafts are missing. |
| **Follow-up Tracker** | Track missing replies and suggest follow-up messages. | A preset escalation demonstrates the approval flow. Reply tracking, deadline alerts, and automatic reminders are missing. |
| **AI Reply Drafts** | Generate context-aware replies that users can personalize and edit. | The demo shows fixed escalation and rescheduling messages. AI generation, personalization, and editing are missing. |
| **Autonomy Center** | Make autonomy levels transparent with configurable permissions and approvals. | The Privacy Center lets users configure analysis and calendar coordination and choose an approval mode for simulated actions. Broader permission controls and backend policy enforcement are missing. |
| **Activity & Alert Center** | Show a history of AI actions, notifications, deadlines, approvals, and reasons for decisions. | Agent Activity logs demo events, and Risk Radar shows the reasoning behind the seeded risk. A unified alerts and approvals view, durable history, and per-action decision explanations are missing. |

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

## Architecture and limits
Vanilla HTML/CSS/JS + dependency-free Node HTTP server. Synthetic data and demo state in browser localStorage; optional server-side LLM extraction. No real email/calendar integration, authentication, production security, actual agent actions, or shared database. Work/personal tabs and separate requests demonstrate the intended isolation model but are not actual security boundaries. Some future permission controls are disabled. AI outputs need validation before real use. No real customer data should be used. API key remains server-side. Local server binds to loopback only. For enterprise implementation, add OAuth, authenticated tenant isolation, a validated data model, policy enforcement, and a durable backend. 
