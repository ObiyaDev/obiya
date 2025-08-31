<a href="https://obiya.dev">
  <img src="https://github.com/ObiyaDev/obiya/blob/main/obiya%20(1).png" alt="Obiya Banner" width="100%">
</a>


<p align="center">
  <strong>🔥 The Unified Backend Framework That Eliminates Runtime Fragmentation 🔥</strong>
</p>
<p align="center">
  <em>APIs, background jobs, workflows, and AI agents in one system. JavaScript, TypeScript, Python, and more in one codebase.</em>
</p>

<p align="center">
  <a href="https://github.com/ObiyaDev/obiya/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat&logo=opensourceinitiative&logoColor=white&labelColor=000000" alt="license">
  </a>
  <a href="https://github.com/ObiyaDev/obiya">
    <img src="https://img.shields.io/github/stars/ObiyaDev/obiya?style=flat&logo=github&logoColor=white&color=yellow&labelColor=000000" alt="GitHub stars">
  </a>
  <a href="#" target="_blank">
    <img src="https://img.shields.io/badge/Follow-@obiyadev-1DA1F2?style=flat&logo=twitter&logoColor=white&labelColor=000000" alt="Twitter Follow">
  </a>
</p>

<p align="center">
  <a href="https://www.obiya.dev/manifesto">💡 Obiya Manifesto</a> •
  <a href="https://www.obiya.dev/docs/getting-started/quick-start">🚀 Quick Start</a> •
  <a href="https://www.obiya.dev/docs/concepts/steps/defining-steps">📋 Defining Steps</a> •
  <a href="https://www.obiya.dev/docs">📚 Docs</a>
</p>

---

## 🎯 What is Obiya?

**Obiya solves backend fragmentation.** 

Modern software engineering is splintered – APIs live in one framework, background jobs in another, queues have their own tooling, and AI agents are springing up in yet more isolated runtimes. **This fragmentation demands a unified system.**

Obiya unifies APIs, background jobs, workflows, and AI agents into a **single coherent system** with shared observability and developer experience. Similar to how React simplified frontend development where everything is a component, **Obiya simplifies backend development where everything is a Step**.

Write **JavaScript, TypeScript, Python, and more** in the same workflow. **What used to take 5 frameworks to build now comes out of the box with Obiya.**

[![Obiya combines APIs, background queues, and AI agents into one system](assets/Obiya_Github_Repository_GIF.gif)](https://obiya.dev)

## 🚀 Quickstart

Get Obiya project up and running in **under 60 seconds**:

### 1. Bootstrap a New Obiya Project

```bash
npx obiya@latest create -i   # runs the interactive terminal
```

Follow the prompts to pick a template, project name, and language.
![obiya-terminal](https://github.com/ObiyaDev/obiya/blob/main/obiya.png)

### 2. Start the Workbench

Inside your new project folder, launch the dev server:

```bash
npx obiya dev # ➜ http://localhost:3000
```

**That's it!** You have:
- ✅ REST APIs with validation
- ✅ Visual debugger & tracing  
- ✅ Multi-language support
- ✅ Event-driven architecture
- ✅ Zero configuration

![new-workbench](https://github.com/ObiyaDev/obiya/blob/main/work_bench.png)

> 📖 **[Full tutorial in our docs →](https://obiya.dev/docs/getting-started/quick-start)**

## 🎯 Step Types

| Type | Trigger | Use Case |
|------|---------|----------|
| **`api`** | HTTP Request | REST endpoints |
| **`event`** | Topic subscription | Background processing |  
| **`cron`** | Schedule | Recurring jobs |
| **`noop`** | Manual | External processes |


---

## 🎯 Examples

### 🏆 **[ChessArena.ai](https://chessarena.ai)** - Full-Featured Production App

A complete chess platform benchmarking LLM performance with real-time evaluation.

**[Live Website →](https://chessarena.ai)** | **[Source Code →](https://github.com/Obiyadev/chessarena-ai)**

> ![ChessArena.ai in action (raw GIF)](https://github.com/Obiyadev/chessarena-ai/blob/main/public/images/chessarena.gif?raw=true)

**Built from scratch to production deployment, featuring:**
- 🔐 **Authentication & user management**
- 🤖 **Multi-agent LLM evaluation** (OpenAI, Claude, Gemini, Grok)
- 🐍 **Python engine integration** (Stockfish chess evaluation)
- 📊 **Real-time streaming** with live move updates and scoring
- 🎨 **Modern React UI** with interactive chess boards
- 🔄 **Event-driven workflows** connecting TypeScript APIs to Python processors
- 📈 **Live leaderboards** with move-by-move quality scoring
- 🚀 **Production deployment** on Obiya Cloud

### 📚 **More Examples**

**[View all 20+ examples →](https://github.com/ObiyaDev/obiya-examples)**

| Example | Description |
|---------|-------------|
| **[AI Research Agent](https://github.com/ObiyaDev/obiya-examples/tree/main/examples/ai-deep-research-agent)** | Web research with iterative analysis |
| **[Streaming Chatbot](https://github.com/ObiyaDev/obiya-examples/tree/main/examples/streaming-ai-chatbot)** | Real-time AI responses |
| **[Gmail Automation](https://github.com/ObiyaDev/obiya-examples/tree/main/examples/gmail-workflow)** | Smart email processing |
| **[Finance Agent](https://github.com/ObiyaDev/obiya-examples/tree/main/examples/finance-agent)** | Real-time market analysis |

**Features demonstrated:** Multi-language workflows • Real-time streaming • AI integration • Production deployment

---

## 🌐 Language Support

| Language | Status | 
|----------|--------|
| **JavaScript** | ✅ Stable |
| **TypeScript** | ✅ Stable |
| **Python** | ✅ Stable |
| **Ruby** | 🚧 Beta |
| **Go** | 🔄 Soon |

## 📚 Resources

- **[📖 Documentation](https://motia.dev/docs)** - Complete guides and API reference
- **[🐛 GitHub Issues](https://github.com/ObiyaDev/obiya)** - Bug reports and feature requests
- 
## 🚧 Roadmap

We have a public roadmap for Obiya.

Feel free to add comments to the issues, or create a new issue if you have a feature request.

| Feature | Status | Description |
| ------- | ------ | ----------- |
| Python Types | Planned | Add support for Python types |
| Streams: RBAC | Planned | Add support for RBAC |
| Streams: Workbench UI | Planned | Add support for Workbench UI |
| Queue Strategies | Planned | Add support for Queue Strategies |
| Reactive Steps | Planned | Add support for Reactive Steps |
| Point in time triggers | Planned | Add support for Point in time triggers |
| Workbench plugins | Planned | Add support for Workbench plugins |
| Rewrite our Core in either Go or Rust | Planned | Rewrite our Core in either Go or Rust |
| Decrease deployment time | Planned | Decrease deployment time |
| Built-in database support | Planned | Add support for built-in database |

## 🤝 Contributing

We welcome contributions! Check our **[Contributing Guide](https://github.com/ObiyaDev/obiya/blob/main/CONTRIBUTING.md)** to get started.

---

<div align="center">

**[🚀 Get Started](https://obiya.dev)** • **[📖 Docs](https://obiya.dev/docs)**


</div>
