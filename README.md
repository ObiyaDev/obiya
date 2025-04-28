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

## 🗂 Features

<td width="25%" valign="top" style="padding:15px; border-radius:10px; background:#f8f8f8; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
    <h4 style="margin-bottom:10px;">🛠️ Framework Features</h4>
    <strong style="color:#4CAF50;">✅ Beta</strong>
    <ul style="list-style:none; padding:0; text-align:left;">
      <li>API Steps (APIs/Webhooks)</li>
      <li>Motia Workbench</li>
      <li>Trace IDs</li>
      <li>Logging</li>
      <li>Middleware</li>
      <li>CLI</li>
      <li>Short-term State (KV)</li>
      <li>Hot-Reloading</li>
      <li>Mermaid Diagrams</li>
    </ul>
    <strong style="color:#FF9800;">🔜 Roadmap</strong>
    <ul style="list-style:none; padding:0; text-align:left;">
      <li>Tree-Shaking Python</li>
      <li>Long-term State (RDB)</li>
      <li>Streaming State</li>
      <li>Sockets</li>
      <li>State Adapters</li>
      <li>Logging Adapters</li>
      <li>Shared Components</li>
    </ul>
  </td>

  <!-- Ecosystem & Tools -->
  <td width="25%" valign="top" style="padding:15px; border-radius:10px; background:#f8f8f8; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
    <h4 style="margin-bottom:10px;">🌐 Ecosystem & Tools</h4>
    <strong style="color:#4CAF50;">✅ Beta</strong>
    <ul style="list-style:none; padding:0; text-align:left;">
      <li>Motia Cursor Rules</li>
      <li>Workbench VS-Code/Cursor Extension</li>
      <li>Motia Test Helpers</li>
    </ul>
  </td>

  <!-- Motia Cloud -->
  <td width="25%" valign="top" style="padding:15px; border-radius:10px; background:#f8f8f8; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
    <h4 style="margin-bottom:10px;">☁️ Motia Cloud</h4>
    <strong style="color:#4CAF50;">✅ Beta</strong>
    <ul style="list-style:none; padding:0; text-align:left;">
      <li>One-Command Deploys</li>
      <li>Observability</li>
      <li>Logging, State & Error Monitoring</li>
      <li>Environments</li>
      <li>Secret Management</li>
      <li>Canary & Rollback Deployments</li>
    </ul>
  </td>
</tr>

## 🗂 Examples

<div align="center">
  <table>
    <tr>
      <td width="33%" align="center">
        <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/finance-agent">
          <img src="assets/examples/finance-agent.png" width="200" alt="Finance Agent"><br>
          <strong>Finance Agent</strong>
        </a>
        <p><em>AI-driven financial market insights.</em></p>
        <small>TypeScript, Alpha Vantage, SerperDev, OpenAI</small>
      </td>
      <td width="33%" align="center">
        <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/github-integration-workflow">
          <img src="assets/examples/github-pr-management.png" width="200" alt="GitHub Agent"><br>
          <strong>GitHub Agent</strong>
        </a>
        <p><em>AI-based GitHub issue & PR automation.</em></p>
        <small>TypeScript, OpenAI, GitHub API</small>
      </td>
      <td width="33%" align="center">
        <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/gmail-workflow">
          <img src="assets/examples/gmail-flow.png" width="200" alt="Gmail Manager"><br>
          <strong>Gmail Manager</strong>
        </a>
        <p><em>Intelligent email classification & auto-response.</em></p>
        <small>TypeScript, Python, Google APIs, Discord</small>
      </td>
    </tr>
    <tr>
      <td width="33%" align="center">
        <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/trello-flow">
          <img src="assets/examples/trello-manager.png" width="200" alt="Trello Automation"><br>
          <strong>Trello Automation</strong>
        </a>
        <p><em>Automated task progression & summaries.</em></p>
        <small>TypeScript, Trello API, OpenAI, Slack</small>
      </td>
      <td width="33%" align="center">
        <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/rag_example">
          <img src="assets/examples/parse-embed-rag.png" width="200" alt="RAG Agent"><br>
          <strong>RAG Agent</strong>
        </a>
        <p><em>Knowledge retrieval & Q&A applications.</em></p>
        <small>Python, TypeScript, FAISS, Google's Generative AI</small>
      </td>
      <td width="33%" align="center">
        <a href="https://github.com/MotiaDev/motia-examples/tree/main/examples/vision-example">
          <img src="assets/examples/generate-image.png" width="200" alt="AI Image Generation"><br>
          <strong>AI Image Generation</strong>
        </a>
        <p><em>Generate & evaluate AI images.</em></p>
        <small>TypeScript, Python, Claude, Flux, OpenAI</small>
      </td>
    </tr>
  </table>
</div>

## Quick Start

Ready to get started in minutes? Follow these simple steps using **pnpm** and the automated project creation:

1.  **Create a new project using the Motia CLI:**

    ```bash
    npx motia create -n my-first-agent
    ```

    _(Replace `my-first-agent` with your desired project name)_

    This command will:

    - Create a new folder `my-first-agent`
    - Set up a basic Motia project with example steps
    - Install dependencies using pnpm

2.  **Navigate into your new project directory:**

    ```bash
    cd my-first-agent
    ```

3.  **Start the Motia development server:**

    ```bash
    pnpm run dev
    ```

4.  **Open the Motia Workbench in your browser (usually `http://localhost:3000`)**. You should see a pre-built flow named "default" with example steps visualized.

5.  **Test an example API Step:** In your terminal, use `curl` to trigger the example API endpoint (often `/default` in the default template):

    ```bash
    curl -X POST http://localhost:3000/default \
    -H "Content-Type: application/json" \
    -d '{}'
    ```

    Alternatively, use the Motia CLI to emit an event (for event-based steps in the template):

    ```bash
    npx motia emit --topic test-state --message '{}'
    ```

    Check the Workbench logs – you should see logs indicating the step execution and event flow!

**Congratulations! You've just created and run your first Motia workflow using the automated project setup.**

## Start building your AI powered agents with simple steps

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
