# InboxZen — Hackathon MVP

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
