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
  <hr>
</div>

Motia is a modern backend framework that combines APIs, background jobs, event systems, and AI agents into one unified, observable runtime. Stop context-switching between multiple runtimes—build your entire backend with event-driven steps, mixing JavaScript, TypeScript, and Python freely, while keeping shared state, tracing, and deployment simplicity.

_⚠️ Motia is currently in Beta: Actively evolving—your feedback helps shape the future!_

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
    gap: 20px;
    font-family: sans-serif;
    color: var(--text);
    background-color: var(--bg);
    align-items: flex-start;
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
    <strong class="muted">Issues caused collectively:</strong>
    <ul>
      <li class="issue">Multiple deploy targets & scaling complexities</li>
      <li class="issue">Partial observability causing debugging pain</li>
      <li class="issue">Language constraints limiting flexibility</li>
      <li class="issue">Cognitive overhead from context switching</li>
      <li class="issue">Repeated boilerplate for error handling & retries</li>
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
        <td><span class="checkmark">✅</span> Combine deterministic logic & autonomous AI Steps seamlessly.</td>
      </tr>
    </table>
    <strong class="muted">Additional Benefits:</strong>
    <ul>
      <li class="benefit"><strong>Single Deploy Target:</strong> Simplified scaling & deployment</li>
      <li class="benefit"><strong>Complete Observability:</strong> Easier debugging & unified tracing</li>
      <li class="benefit"><strong>Language Flexibility:</strong> JS, TS, Python integration</li>
      <li class="benefit"><strong>Reduced Cognitive Load:</strong> One consistent mental model</li>
      <li class="benefit"><strong>Reduced Boilerplate:</strong> Automatic retries, idempotency & errors</li>
    </ul>
  </div>

</div>

## 🚀 Quickstart

Get started instantly with Motia CLI:

```bash
npx motia@latest create -n new-project
cd new-project && npm run dev
```

Now, visit http://localhost:3000 to open your visual Motia Workbench!

Smaller workbench image here: TODO

## 🎯 Key Features

- **Single-command Deploy:** Local, MotiaCloud, or self-hosted Lambda
- **Code-first & Multi-language:** JavaScript, TypeScript, Python—all in one workflow
- **Flexible Execution Modes:** Deterministic steps or autonomous agentic logic
- **Runtime Validations:** Ensure step integrity and safe refactors
- **Integrated Observability:** Comprehensive tracing, retries, and logging
- **Automatic APIs & Webhooks:** Instantly expose any step over HTTP
- **Bring-your-own AI Stack:** Integrate any LLM, embedding model, or vector store
- **Visual Development Environment:** Interactive event flow visualization and debugging

## Motia Workbench: Your Visual Control Center

The Motia Workbench is your browser-based development environment.

![Motia Workbench Interface](./assets/gmail-example.png)

- **Interactive Flow Visualization:** See your steps connected in a dynamic, visual graph. Understand event flow and step interactions at a glance.
- **Real-time Testing:** Trigger API endpoints and emit events directly from the UI to test your flows and agents in real-time.
- **Live Log Streaming:** Monitor logs in real-time within the Workbench, making debugging and observing execution a breeze.
- **Step Customization:** Create custom UI components for your steps to enhance visualization and tailor the Workbench to your workflows.

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
