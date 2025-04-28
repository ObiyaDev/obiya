<a name="readme-top"></a>

<div align="center">
  <img src="assets/PNGs/icon.png" alt="Logo" width="180">
  <h1 align="center"> Unified Backend for APIs, Queues, Events, and Agents </h1>
</div>

<div align="center">
  <a href="https://motia.dev"><img src="https://img.shields.io/badge/PROJECT-PAGE-FFE165?style=for-the-badge&labelColor=555555" alt="Project Page"></a>
  <a href="https://discord.gg/nJFfsH5d6v"><img src="https://img.shields.io/badge/DISCORD-JOIN%20US-9146FF?style=for-the-badge&labelColor=555555" alt="Discord"></a>
  <a href="https://motia.dev/docs"><img src="https://img.shields.io/badge/DOCS-READ%20NOW-000000?style=for-the-badge&labelColor=555555" alt="Documentation"></a>
  <a href="https://www.npmjs.com/package/motia"><img src="https://img.shields.io/npm/v/motia?style=for-the-badge&label=NPM&labelColor=555555&color=CB3837" alt="NPM Version"></a>
  <a href="https://www.npmjs.com/package/motia"><img src="https://img.shields.io/npm/dt/motia?style=for-the-badge&label=DOWNLOADS&labelColor=555555&color=CB3837" alt="NPM Downloads"></a>
  <a href="#"><img src="https://img.shields.io/badge/STATUS-BETA-FFE165?style=for-the-badge&labelColor=555555" alt="Status Beta"></a>
  <hr>
</div>

Motia is a modern backend framework that combines APIs, background jobs, event systems, and AI agents into one unified, observable runtime. Stop context-switching between multiple runtimes—build your entire backend with event-driven steps, mixing JavaScript, TypeScript, and Python freely, while keeping shared state, tracing, and deployment simplicity.

<style>
  :root {
    --border-radius: 12px;
    --shadow: rgba(0,0,0,0.1) 0 2px 6px;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: transparent;
      --card-bg: #1f1f1f;
      --text: #eaeaea;
      --border: #333;
      --accent: #4caf50;
      --issue-color: #ffb74d;
      --muted: #aaa;
    }
  }

  @media (prefers-color-scheme: light) {
    :root {
      --bg: transparent;
      --card-bg: #ffffff;
      --text: #333;
      --border: #ddd;
      --accent: #2e7d32;
      --issue-color: #e65100;
      --muted: #666;
    }
  }

  .grid-container {
    display: flex;
    gap: 10px;
    font-family: sans-serif;
    color: var(--text);
    background-color: var(--bg);
    align-items: flex-start;
  }

  /* Responsive layout for mobile */
  @media (max-width: 960px) {
    .grid-container {
      flex-direction: column;
    }

    .card {
      width: 100%;
    }
  }

  .card {
    flex: 1;
    padding: 20px;
    border-radius: var(--border-radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    background-color: var(--card-bg);
  }

  h3 {
    text-align: center;
    margin-top: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
    font-size: 0.9em;
  }

  th {
    border-bottom: 1px solid var(--border);
    padding-bottom: 6px;
  }

  td {
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
  }

  ul {
    padding-left: 18px;
    font-size: 0.85em;
    margin: 8px 0 0;
  }

  .issue {
    color: var(--issue-color);
  }

  .benefit {
    color: var(--accent);
  }

  .checkmark {
    color: var(--accent);
  }

  .muted {
    color: var(--muted);
  }
</style>

<div class="grid-container">
  
  <!-- Problem Card -->
  <div class="card">
    <h3>🚧 The Problem: Fragmented Runtimes</h3>
    <table>
      <tr>
        <th align="left">Runtime Layer</th>
        <th align="left">Common Tools</th>
      </tr>
      <tr>
        <td>🖥️ API Servers</td>
        <td>Express, FastAPI, Rails, Django, Laravel, Spring, .NET, Flask,  Nest</td>
      </tr>
      <tr>
        <td>📬 Job Queues / Events</td>
        <td>Sidekiq, Temporal, BullMQ, Kafka, RabbitMQ, AWS SQS, Redis Streams</td>
      </tr>
      <tr>
        <td>🤖 AI & Agents</td>
        <td>LangGraph, CrewAI, Mastra, LangChain, AutoGPT, Agnu, AgentGPT</td>
      </tr>
    </table>
    <strong>Issues Caused by Fragmentation:</strong>
    <ul>
      <li>🔸 <strong>Deployment Complexity:</strong> Multiple scaling models and deployment targets</li>
      <li>🔸 <strong>Debugging Difficulty:</strong> Fragmented observability, incomplete traces</li>
      <li>🔸 <strong>Developer Constraints:</strong> Language lock-in, limited flexibility</li>
      <li>🔸 <strong>Cognitive Overhead:</strong> Context-switching across different frameworks</li>
      <li>🔸 <strong>Redundant Boilerplate:</strong> Repeated logic for retries, errors, and idempotency</li>
    </ul>
  </div>

  <!-- Solution Card -->
  <div class="card">
    <h3>✅ Motia’s Unified Solution</h3>
    <table>
      <tr>
        <th align="left">Runtime Layer</th>
        <th align="left">How Motia Solves It</th>
      </tr>
      <tr>
        <td>🖥️ API Servers</td>
        <td><span class="checkmark">✅</span> Expose <strong>Steps</strong> instantly as APIs/webhooks, no extra server setup.</td>
      </tr>
      <tr>
        <td>📬 Job Queues / Events</td>
        <td><span class="checkmark">✅</span> Unified runtime with built-in queueing, retries & state management.</td>
      </tr>
      <tr>
        <td>🤖 AI & Agents</td>
        <td><span class="checkmark">✅</span> Combine deterministic logic & agentic AI Steps seamlessly.</td>
      </tr>
    </table>
    <strong>Benefits of Unifying with Motia:</strong>
    <ul>
      <li>🎯 <strong>Unified Deployment:</strong> One consistent scaling and deployment model</li>
      <li>🔍 <strong>Enhanced Observability:</strong> End-to-end tracing and simplified debugging</li>
      <li>⚙️ <strong>Full Language Flexibility:</strong> Mix JavaScript, TypeScript, Python freely</li>
      <li>🧠 <strong>Lower Cognitive Load:</strong> Single intuitive model for backend workflows</li>
      <li>♻️ <strong>Simplified Error Handling:</strong> Automatic retries and consistent error management</li>
    </ul>
  </div>

</div>

## 🎯 Key Motia Features

| Features                             | Description                                                                                                                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📦 **Full PyPi & NPM Support**       | Seamlessly integrate and leverage packages from the vast ecosystems of PyPi and NPM in your workflows.                                                                                                                                            |
| 🚏 **Built-in Routing**              | Motia provides out-of-the-box routing capabilities, allowing instant setup of APIs and webhooks with no additional configuration required.                                                                                                        |
| 🧪 **Fully Testable**                | Integrates effortlessly with your existing test suite, enabling comprehensive testing of workflows and steps using your preferred testing tools.                                                                                                  |
| 👤 **Human-in-the-Loop**             | Built-in mechanisms for human intervention, making it easy to integrate review or approval steps directly into automated workflows.                                                                                                               |
| 📜 **Minimal DSL**                   | Motia uses a minimal and intuitive domain-specific language (DSL), reducing learning curves and enabling quicker adoption.                                                                                                                        |
| 🚀 **API Steps (APIs/Webhooks)**     | Quickly expose workflow steps as APIs or webhooks without additional server setup, ideal for integrating into existing web infrastructure.                                                                                                        |
| 🖥️ **Motia Workbench**               | Provides a visual interface for workflow management, debugging, and monitoring, allowing easy visualization and manipulation of workflow execution.                                                                                               |
| 🔎 **Trace IDs & Logging**           | Integrated trace IDs and structured logging enable end-to-end observability, simplifying debugging and improving reliability.                                                                                                                     |
| 🔄 **Middleware & CLI**              | Easily extend workflow capabilities with middleware, and rapidly create, manage, and deploy projects through a powerful CLI tool.                                                                                                                 |
| ⚡ **Hot-Reloading**                 | Real-time development experience allowing you to instantly see changes without restarting your workflows, significantly speeding up the development cycle.                                                                                        |
| 📊 **Mermaid Diagrams**              | Automatic generation of Mermaid diagrams for each workflow, offering clear visualization of flow logic and dependencies.                                                                                                                          |
| 🌐 **Motia Cursor & IDE Extensions** | Enhance productivity with Motia-specific rules in Cursor and VS-Code extensions, integrating workflow management directly into your preferred IDE environment.                                                                                    |
| ☁️ **Motia Cloud**                   | One-command deployments, integrated observability tools, centralized logging, secret management, and environment-specific configurations including canary and rollback deployments, enabling robust and reliable workflow hosting and management. |

## 🗂 Examples

<style>
.example-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  font-family: sans-serif;
}

.example-card {
  flex: 1 1 300px;
  max-width: calc(33% - 32px); /* ensures max 3 cards per row */
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  text-align: center;
  background-color: transparent; /* Removed white background */
}

.example-card img {
  width: 100%;
  border-radius: 6px;
}

.example-card strong {
  display: block;
  margin-top: 8px;
}

.example-card em {
  color: #555;
  font-size: 0.9em;
}

.example-card small {
  color: #888;
}

/* Medium screens: 2-column layout */
@media (max-width: 960px) {
  .example-card {
    max-width: calc(50% - 32px);
  }
}

/* Small screens: single-column layout */
@media (max-width: 600px) {
  .example-card {
    max-width: 100%;
  }
}
</style>

<div class="example-container">
  <div class="example-card">
    <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/finance-agent">
      <img src="assets/examples/finance-agent.png" alt="Finance Agent">
      <strong>Finance Agent</strong>
    </a>
    <p><em>AI-driven financial market insights.</em></p>
    <small>TypeScript, Alpha Vantage, SerperDev, OpenAI</small>
  </div>

  <div class="example-card">
    <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/github-integration-workflow">
      <img src="assets/examples/github-pr-management.png" alt="GitHub Agent">
      <strong>GitHub Agent</strong>
    </a>
    <p><em>GitHub issue & PR automation.</em></p>
    <small>TypeScript, OpenAI, GitHub API</small>
  </div>

  <div class="example-card">
    <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/gmail-workflow">
      <img src="assets/examples/gmail-flow.png" alt="Gmail Manager">
      <strong>Gmail Manager</strong>
    </a>
    <p><em>Email classification & auto-response.</em></p>
    <small>TypeScript, Python, Google APIs, Discord</small>
  </div>

  <div class="example-card">
    <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/trello-flow">
      <img src="assets/examples/trello-manager.png" alt="Trello Automation">
      <strong>Trello Automation</strong>
    </a>
    <p><em>Task progression & summaries.</em></p>
    <small>TypeScript, Trello API, OpenAI, Slack</small>
  </div>

  <div class="example-card">
    <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/rag_example">
      <img src="assets/examples/parse-embed-rag.png" alt="RAG Agent">
      <strong>RAG Agent</strong>
    </a>
    <p><em>Knowledge retrieval & Q&A.</em></p>
    <small>Python, TypeScript, FAISS, Google AI</small>
  </div>

  <div class="example-card">
    <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/vision-example">
      <img src="assets/examples/generate-image.png" alt="AI Image Generation">
      <strong>AI Image Generation</strong>
    </a>
    <p><em>Generate & evaluate AI images.</em></p>
    <small>TypeScript, Python, Claude, Flux, OpenAI</small>
  </div>
</div>

## 🚀 Quick Start

Get your first Motia workflow running in minutes:

**1. Create a Project**

Create a new project with the Motia CLI:

```bash
npx motia create -n my-first-agent
```

_This sets up a starter project in the `my-first-agent` folder._

**2. Launch the Dev Server**

Navigate into your project and start the server:

```bash
cd my-first-agent
pnpm run dev
```

**3. Open the Workbench**

Open [http://localhost:3000](http://localhost:3000) to see your workflow visualized in the Motia Workbench.

**4. Trigger Your Workflow**

Trigger your API Step:

```bash
curl -X POST http://localhost:3000/default -H "Content-Type: application/json" -d '{}'
```

Trigger your Event Step (directly):

```bash
npx motia emit --topic test-state --message '{}'
```

🎉 **That's it!** You're ready to build with Motia.

## Start building your APIs, agents and automations with simple steps

- Configure a simple to emit/subscribe, assign to a flow and inculde runtime validation
- Define a function to handle when the step is triggered
- Import any package

```TypeScript
import { OpenAI } from 'openai';
import { z } from 'zod';
import type { EventConfig, StepHandler } from 'motia';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const config: EventConfig = {
  type: 'event',
  name: 'Auto-Reply to Support Emails',
  subscribes: ['email.received'],
  emits: ['email.send'],
  flows: ['email-support'],
  input: z.object({ subject: z.string(), body: z.string(), from: z.string() }),
};

export const handler: StepHandler<typeof config> = async (inputData, context) => {
  const { subject, body, from } = inputData;
  const { emit, logger } = context;

  const sentimentResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: `Analyze the sentiment of the following text: ${body}` }],
  });

  const sentiment = sentimentResponse.choices[0].message.content;

  logger.info('[EmailAutoReply] Sentiment analysis', { sentiment });

  emit({
    type: 'email.send',
    data: { from, subject, body, sentiment },
  });
};
```

## Next Steps

- **Dive into the Documentation:** Explore the [full Motia documentation](https://motia.dev/docs) to understand core concepts, step types, state management, and more.
- **Explore Examples:** Check out practical [examples](https://motia.dev/docs/real-world-use-cases) to see Motia in action and get inspiration for your own workflows and agents.
- **Join the Community:** Connect with other Motia users and the development team on our [Discord server](https://discord.gg/nJFfsH5d6v) and contribute to the project on [GitHub](https://github.com/MotiaDev/motia).

**License:** [MIT](LICENSE)
